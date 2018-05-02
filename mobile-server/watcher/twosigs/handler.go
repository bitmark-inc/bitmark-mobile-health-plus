package twosigs

import (
	"encoding/json"

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
		transferOffer, err := h.gatewayClient.GetOfferIdInfo(offerID)
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
				return pushnotification.Push(&pushnotification.PushInfo{
					Account: from,
					Title:   "",
					Message: message,
					Data: &map[string]interface{}{
						"event":    event,
						"offer_id": offerID,
					},
					Pinned: false,
					Source: "gateway",
					Silent: false,
				}, h.pushStore, h.pushAPIClient)
			}

			return nil
		}
	}

	// For p2p transfers
	switch event {
	case EventTransferRequest:
		return pushnotification.Push(&pushnotification.PushInfo{
			Account: to,
			Title:   "",
			Message: messages[event],
			Data:    &data,
			Pinned:  false,
			Source:  "gateway",
			Silent:  false,
		}, h.pushStore, h.pushAPIClient)
	case EventTransferAccepted:
		return pushnotification.Push(&pushnotification.PushInfo{
			Account: from,
			Title:   "",
			Message: messages[event],
			Data:    &data,
			Pinned:  false,
			Source:  "gateway",
			Silent:  false,
		}, h.pushStore, h.pushAPIClient)
	case EventTransferFailed:
		return pushnotification.Push(&pushnotification.PushInfo{
			Account: to,
			Title:   "",
			Message: messages[event],
			Data:    &data,
			Pinned:  false,
			Source:  "gateway",
			Silent:  false,
		}, h.pushStore, h.pushAPIClient)
	case EventTransferRejected:
		return pushnotification.Push(&pushnotification.PushInfo{
			Account: from,
			Title:   "",
			Message: messages[event],
			Data:    &data,
			Pinned:  false,
			Source:  "gateway",
			Silent:  false,
		}, h.pushStore, h.pushAPIClient)
	default:
		log.Info("Unhandled event:", event)
	}

	return nil
}
