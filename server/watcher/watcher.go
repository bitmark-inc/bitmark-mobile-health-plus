package watcher

import (
	"github.com/bitmark-inc/mobile-app/server/external/notification"
	"github.com/bitmark-inc/mobile-app/server/store/pushuuid"
	"github.com/bitmark-inc/mobile-app/server/watcher/blockchain"
	nsq "github.com/nsqio/go-nsq"
)

type Watcher struct {
	notifer           *notifyClient
	blockchainHandler *blockchain.BlockchainEventHandler
}

const (
	nsqChannel = "mobile-server"
)

func New(host string, pushUUIDStore pushuuid.PushUUIDStore, pushAPIClient *notification.Client) *Watcher {
	nc := &notifyClient{
		queues: make([]*nsq.Consumer, 0),
		stop:   make(chan struct{}),
	}

	blockchainHandler := blockchain.New(pushUUIDStore, pushAPIClient)

	nc.add("blockchain", nsqChannel, blockchainHandler)

	return &Watcher{
		notifer:           nc,
		blockchainHandler: blockchainHandler,
	}
}

func (w *Watcher) Connect(host string) {
	w.notifer.connect(host)
}
