package blockchain

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/bitmark-inc/mobile-app/mobile-server/external/gateway"
	"github.com/bitmark-inc/mobile-app/mobile-server/external/gorush"
	"github.com/bitmark-inc/mobile-app/mobile-server/pushnotification"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/bitmarkstore"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/pushstore"
	"github.com/bitmark-inc/mobile-app/mobile-server/util"
	"github.com/nsqio/go-nsq"
	memcache "github.com/patrickmn/go-cache"
	log "github.com/sirupsen/logrus"
)

type BlockchainEventHandler struct {
	nsq.Handler
	pushStore     pushstore.PushStore
	bitmarkStore  bitmarkstore.BitmarkStore
	pushAPIClient *gorush.Client
	gatewayClient *gateway.Client
	cache         *memcache.Cache
}

func New(pushStore pushstore.PushStore, bitmarkStore bitmarkstore.BitmarkStore, pushAPIClient *gorush.Client, gatewayClient *gateway.Client) *BlockchainEventHandler {
	c := memcache.New(2*time.Minute, 5*time.Minute)
	return &BlockchainEventHandler{
		pushStore:     pushStore,
		bitmarkStore:  bitmarkStore,
		pushAPIClient: pushAPIClient,
		gatewayClient: gatewayClient,
		cache:         c,
	}
}

func (h *BlockchainEventHandler) HandleMessage(message *nsq.Message) error {
	var data blockInfo
	if err := json.Unmarshal(message.Body, &data); err != nil {
		log.Error(err)
		return err
	}

	log.Debugf("Handle message: %+v", data)

	// De-duplication
	blockKey := strconv.FormatInt(data.BlockNumber, 10)
	_, found := h.cache.Get(blockKey)
	if found {
		log.Info("Found duplicated block event: ", data.BlockNumber)
		return nil
	}

	h.cache.Set(blockKey, true, memcache.DefaultExpiration)

	// get bitmarkid
	bitmarkIDs := make([]string, 0)
	for _, transfer := range data.Transfers {
		bitmarkIDs = append(bitmarkIDs, transfer.BitmarkID)
		h.processTransferConfirmation(transfer)
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

func (h *BlockchainEventHandler) processTransferConfirmation(transfer blockBitmarkInfo) error {
	if transfer.TxPreviousID == nil {
		log.Warn("Found a transfer with empty previous tx:", transfer.TxID)
		return nil
	}

	var asset gateway.Asset

	previousTx, err := h.gatewayClient.GetTxInfo(context.Background(), *transfer.TxPreviousID)
	if err != nil {
		return nil
	}

	asset = previousTx.Asset

	// TODO: temporary disable this notification, need to re-enable or remove this code.
	// senderPushMessage := fmt.Sprintf(messages[EventTransferConfirmedSender], previousTx.Asset.Name, util.ShortenAccountNumber(transfer.Owner))
	// if err = pushnotification.Push(context.Background(), &pushnotification.PushInfo{
	// 	Account: previousTx.Tx.Owner,
	// 	Title:   "",
	// 	Message: senderPushMessage,
	// 	Data: &map[string]interface{}{
	// 		"tx_id":      transfer.TxID,
	// 		"bitmark_id": transfer.BitmarkID,
	// 		"name":       "transfer_completed",
	// 	},
	// 	Source: "gateway",
	// 	Pinned: false,
	// 	Silent: true,
	// }, h.pushStore, h.pushAPIClient); err != nil {
	// 	return err
	// }

	receiverPushMessage := fmt.Sprintf(messages[EventTransferConfirmedReceiver], asset.Name, util.ShortenAccountNumber(previousTx.Tx.Owner))
	if err = pushnotification.Push(context.Background(), &pushnotification.PushInfo{
		Account: transfer.Owner,
		Title:   "",
		Message: receiverPushMessage,
		Data: &map[string]interface{}{
			"tx_id":      transfer.TxID,
			"bitmark_id": transfer.BitmarkID,
			"name":       "transfer_item_received",
		},
		Source: "gateway",
		Pinned: false,
		Silent: true,
	}, h.pushStore, h.pushAPIClient); err != nil {
		return err
	}

	return nil
}
