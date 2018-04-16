package blockchain

import (
	"encoding/json"

	"github.com/bitmark-inc/mobile-app/mobile-server/external/gorush"
	"github.com/bitmark-inc/mobile-app/mobile-server/pushnotification"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/pushstore"
	"github.com/nsqio/go-nsq"
	log "github.com/sirupsen/logrus"
)

type BlockchainEventHandler struct {
	nsq.Handler
	pushStore     pushstore.PushStore
	pushAPIClient *gorush.Client
}

func New(store pushstore.PushStore, pushAPIClient *gorush.Client) *BlockchainEventHandler {
	return &BlockchainEventHandler{
		pushStore:     store,
		pushAPIClient: pushAPIClient,
	}
}

func (h *BlockchainEventHandler) HandleMessage(message *nsq.Message) error {
	var data map[string]interface{}
	if err := json.Unmarshal(message.Body, &data); err != nil {
		return err
	}

	log.Debug("Handle event for data", data)
	return pushnotification.Push(pushnotification.PushInfo{
		Account: "e1pFRPqPhY2gpgJTpCiwXDnVeouY9EjHY6STtKwdN6Z4bp4sog",
		Title:   data["name"].(string),
		Message: data["body"].(string),
		Data:    data,
		Source:  "gateway",
		Pinned:  false,
		Silent:  true,
	}, h.pushStore, h.pushAPIClient)
}
