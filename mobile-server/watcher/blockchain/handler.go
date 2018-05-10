package blockchain

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/bitmark-inc/mobile-app/mobile-server/external/gateway"
	"github.com/bitmark-inc/mobile-app/mobile-server/external/gorush"
	"github.com/bitmark-inc/mobile-app/mobile-server/pushnotification"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/bitmarkstore"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/pushstore"
	"github.com/nsqio/go-nsq"
	log "github.com/sirupsen/logrus"
)

type BlockchainEventHandler struct {
	nsq.Handler
	pushStore     pushstore.PushStore
	bitmarkStore  bitmarkstore.BitmarkStore
	pushAPIClient *gorush.Client
	gatewayClient *gateway.Client
}

func New(pushStore pushstore.PushStore, bitmarkStore bitmarkstore.BitmarkStore, pushAPIClient *gorush.Client, gatewayClient *gateway.Client) *BlockchainEventHandler {
	return &BlockchainEventHandler{
		pushStore:     pushStore,
		bitmarkStore:  bitmarkStore,
		pushAPIClient: pushAPIClient,
		gatewayClient: gatewayClient,
	}
}

func (h *BlockchainEventHandler) HandleMessage(message *nsq.Message) error {
	var data map[string]interface{}
	if err := json.Unmarshal(message.Body, &data); err != nil {
		log.Error(err)
		return err
	}

	log.Debugf("Handle message: %+v", data)

	// h.bitmarkStore.TestTrackingBitmark(context.Background(), )

	name, okName := data["name"].(string)
	if !okName && name != "new_transfers" {
		return nil
	}

	bitmarkID, okBitmarkID := data["body"].(string)
	if !okBitmarkID {
		return errors.New("failed to parse bitmark id")
	}

	ctx := context.Background()

	// prevent overhead on db
	isMatched, err := h.bitmarkStore.TestTrackingBitmark(ctx, bitmarkID)
	if err != nil {
		log.Error(err)
		return err
	}

	if !isMatched {
		log.Debug("No bitmard ids matched")
		return nil
	}

	// aggregate accounts
	accounts, err := h.bitmarkStore.GetAccountHasTrackingBitmark(ctx, bitmarkID)
	if err != nil {
		log.Error(err)
		return err
	}

	// get bitmark info to build message
	bitmarkInfo, err := h.gatewayClient.GetBitmarkInfo(ctx, bitmarkID)
	if err != nil {
		log.Error(err)
		return err
	}

	event := EventTrackingBitmarkConfirmed
	pushMessage := fmt.Sprintf(messages[event], bitmarkInfo.Asset.Name)
	pushData := &map[string]interface{}{
		"bitmark_id": bitmarkID,
		"event":      event,
	}

	for _, account := range accounts {
		pushnotification.Push(ctx, &pushnotification.PushInfo{
			Account: account,
			Title:   "",
			Message: pushMessage,
			Data:    pushData,
			Source:  "gateway",
			Pinned:  false,
			Silent:  true,
		}, h.pushStore, h.pushAPIClient)
	}

	return nil
}
