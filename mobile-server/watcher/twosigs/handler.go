package twosigs

import (
	"encoding/json"

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
}

func New(store pushstore.PushStore, pushAPIClient *gorush.Client) *TwoSigsHandler {
	return &TwoSigsHandler{
		pushStore:     store,
		pushAPIClient: pushAPIClient,
	}
}

func (h *TwoSigsHandler) HandleMessage(message *nsq.Message) error {
	var data map[string]interface{}
	if err := json.Unmarshal(message.Body, &data); err != nil {
		return err
	}

	log.Debug("Handle event for data", data)

	event := data["name"].(string)
	from := data["from"].(string)
	to := data["to"].(string)

	switch event {
	case EventTransferRequest:
		return pushnotification.Push(pushnotification.PushInfo{
			Account: to,
			Title:   "",
			Message: messages[event],
			Data:    data,
			Pinned:  false,
			Source:  "gateway",
			Silent:  false,
		}, h.pushStore, h.pushAPIClient)
	case EventTransferAccepted:
		return pushnotification.Push(pushnotification.PushInfo{
			Account: from,
			Title:   "",
			Message: messages[event],
			Data:    data,
			Pinned:  false,
			Source:  "gateway",
			Silent:  false,
		}, h.pushStore, h.pushAPIClient)
	case EventTransferFailed:
		return pushnotification.Push(pushnotification.PushInfo{
			Account: to,
			Title:   "",
			Message: messages[event],
			Data:    data,
			Pinned:  false,
			Source:  "gateway",
			Silent:  false,
		}, h.pushStore, h.pushAPIClient)
	case EventTransferRejected:
		return pushnotification.Push(pushnotification.PushInfo{
			Account: from,
			Title:   "",
			Message: messages[event],
			Data:    data,
			Pinned:  false,
			Source:  "gateway",
			Silent:  false,
		}, h.pushStore, h.pushAPIClient)
	default:
		log.Info("Unhandled event", event)
	}

	return nil
}
