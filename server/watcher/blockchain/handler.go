package blockchain

import (
	"encoding/json"

	"github.com/bitmark-inc/mobile-app/server/external/notification"
	"github.com/bitmark-inc/mobile-app/server/store/pushuuid"
	"github.com/nsqio/go-nsq"
	log "github.com/sirupsen/logrus"
)

type BlockchainEventHandler struct {
	nsq.Handler
	// Stores
	pushUUIDStore pushuuid.PushUUIDStore
	// External API
	pushAPIClient *notification.Client
}

func New(pushUUIDStore pushuuid.PushUUIDStore, pushAPIClient *notification.Client) *BlockchainEventHandler {
	return &BlockchainEventHandler{
		pushUUIDStore: pushUUIDStore,
		pushAPIClient: pushAPIClient,
	}
}

func (h *BlockchainEventHandler) HandleMessage(message *nsq.Message) error {
	var data map[string]string
	if err := json.Unmarshal(message.Body, &data); err != nil {
		return err
	}

	log.Debug("Handle event for data", data)

	tokens, err := h.pushUUIDStore.QueryPushTokens("e1pFRPqPhY2gpgJTpCiwXDnVeouY9EjHY6STtKwdN6Z4bp4sog")
	if err != nil {
		return err
	}

	return h.pushAPIClient.Send(data["name"], data["body"], tokens, nil)
}
