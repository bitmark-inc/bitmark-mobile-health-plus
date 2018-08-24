package twosigs

import (
	"context"
	"encoding/json"
	"time"

	"github.com/bitmark-inc/mobile-app/mobile-server/external/gateway"
	"github.com/bitmark-inc/mobile-app/mobile-server/external/gorush"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/pushstore"

	"github.com/bitmark-inc/mobile-app/mobile-server/pushnotification"
	"github.com/nsqio/go-nsq"
	log "github.com/sirupsen/logrus"
)

type TwoSigsHandler struct {
	nsq.Handler
	pushStore     pushstore.PushStore
	pushAPIClient *gorush.Client
	gatewayClient *gateway.Client
	researchers   map[string]string
}

func New(store pushstore.PushStore, pushAPIClient *gorush.Client, gatewayClient *gateway.Client, reseacherAccounts map[string]string) *TwoSigsHandler {
	return &TwoSigsHandler{
		pushStore:     store,
		pushAPIClient: pushAPIClient,
		gatewayClient: gatewayClient,
		researchers:   reseacherAccounts,
	}
}

func (h *TwoSigsHandler) HandleMessage(message *nsq.Message) error {
	var data map[string]interface{}
	if err := json.Unmarshal(message.Body, &data); err != nil {
		return err
	}

	event := data["name"].(string)
	from := data["from"].(string)
	to := data["to"].(string)

	// For data donation
	if len(h.researchers[to]) > 0 && event == "transfer_accepted" {
		offerID := data["id"].(string)
		transferOffer, err := h.gatewayClient.GetOfferIdInfo(context.Background(), offerID)
		if err != nil {
			log.Error("error when getting transfer offer:", err)
			return err
		}

		log.Debugf("got transfer offer: %+v\n", transferOffer)

		app, okForApp := transferOffer.ExtraInfo["app"].(string)
		message, okForMessage := transferOffer.ExtraInfo["message"].(string)
		data, okForData := transferOffer.ExtraInfo["data"].(map[string]interface{})

		if okForApp && app == "bitmark-data-donation" {
			if okForMessage && okForData {
				data["offer_id"] = offerID
				return pushnotification.Push(context.Background(), &pushnotification.PushInfo{
					Account: from,
					Title:   "",
					Message: message,
					Data:    &data,
					Pinned:  false,
					Source:  "bitmark-data-donation",
					Silent:  false,
				}, h.pushStore, h.pushAPIClient)
			}

			return nil
		}
	}

	// For p2p transfers
	switch event {
	case EventTransferRequest:
		// TODO: consider removing this code
		offerID := data["id"].(string)
		log.Debugf("Offer id = %s", offerID)
		transferOffer, err := h.gatewayClient.GetOfferIdInfo(context.Background(), offerID)
		if err != nil {
			log.Error("error when getting transfer offer:", err)
			return err
		}
		if transferOffer == nil {
			log.Info("transfer offer nil, skipping ...")
			return nil
		}
		log.Debugf("Transfer offer = %+v", transferOffer)
		bitmarkInfo, err := h.gatewayClient.GetBitmarkInfo(context.Background(), transferOffer.BitmarkId)
		if err != nil {
			log.Error("error when getting bitmark info:", err)
			return err
		}

		if bitmarkInfo.Bitmark.Status != "confirmed" {
			log.Infof("Transfer offer with id: %s, bitmark id = %s is not confirmed. Requeue after 10 seconds.", offerID, bitmarkInfo)
			message.RequeueWithoutBackoff(10 * time.Second)
			return nil
		}

		return pushnotification.Push(context.Background(), &pushnotification.PushInfo{
			Account: to,
			Title:   "",
			Message: messages[event],
			Data:    &data,
			Pinned:  false,
			Source:  "",
			Silent:  false,
		}, h.pushStore, h.pushAPIClient)
	case EventTransferAccepted:
		return pushnotification.Push(context.Background(), &pushnotification.PushInfo{
			Account: from,
			Title:   "",
			Message: messages[event],
			Data:    &data,
			Pinned:  false,
			Source:  "",
			Silent:  false,
		}, h.pushStore, h.pushAPIClient)
	case EventTransferFailed:
		return pushnotification.Push(context.Background(), &pushnotification.PushInfo{
			Account: to,
			Title:   "",
			Message: messages[event],
			Data:    &data,
			Pinned:  false,
			Source:  "",
			Silent:  false,
		}, h.pushStore, h.pushAPIClient)
	case EventTransferRejected:
		return pushnotification.Push(context.Background(), &pushnotification.PushInfo{
			Account: from,
			Title:   "",
			Message: messages[event],
			Data:    &data,
			Pinned:  false,
			Source:  "",
			Silent:  false,
		}, h.pushStore, h.pushAPIClient)
	default:
		log.Info("Unhandled event:", event)
	}

	return nil
}
