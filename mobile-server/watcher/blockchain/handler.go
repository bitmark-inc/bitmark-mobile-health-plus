package blockchain

import (
	"context"
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
	var data blockInfo
	if err := json.Unmarshal(message.Body, &data); err != nil {
		log.Error(err)
		return err
	}

	log.Debugf("Handle message: %+v", data)

	// h.bitmarkStore.TestTrackingBitmark(context.Background(), )

	bitmarkIDs := make([]string, 0)
	for _, bitmark := range data.Transfers {
		bitmarkIDs = append(bitmarkIDs, bitmark.BitmarkID)
	}

	ctx := context.Background()

	// aggregate accounts
	accountsInfo, err := h.bitmarkStore.GetAccountHasTrackingBitmark(ctx, bitmarkIDs)
	if err != nil {
		log.Error(err)
		return err
	}

	if len(accountsInfo) == 0 {
		log.Info("Found no bitmarks matched with tracking list in block: ", data.BlockNumber)
		return nil
	}

	for bitmarkID, accounts := range accountsInfo {
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
	}

	return nil
}
