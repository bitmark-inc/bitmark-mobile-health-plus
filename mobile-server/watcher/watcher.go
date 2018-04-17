package watcher

import (
	"github.com/bitmark-inc/mobile-app/mobile-server/external/gorush"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/pushstore"
	"github.com/bitmark-inc/mobile-app/mobile-server/watcher/blockchain"
	"github.com/bitmark-inc/mobile-app/mobile-server/watcher/twosigs"
	nsq "github.com/nsqio/go-nsq"
)

type Watcher struct {
	notifer           *notifyClient
	blockchainHandler *blockchain.BlockchainEventHandler
}

const (
	nsqChannel = "mobile-server"
)

func New(host string, store pushstore.PushStore, client *gorush.Client) *Watcher {
	nc := &notifyClient{
		queues: make([]*nsq.Consumer, 0),
		stop:   make(chan struct{}),
	}

	blockchainHandler := blockchain.New(store, client)
	nc.add("blockchain", nsqChannel, blockchainHandler)

	twosigsHandler := twosigs.New(store, client)
	nc.add("transfer-offer", nsqChannel, twosigsHandler)

	return &Watcher{
		notifer:           nc,
		blockchainHandler: blockchainHandler,
	}
}

func (w *Watcher) Connect(host string) {
	w.notifer.connect(host)
}

func (w *Watcher) Close() {
	w.notifer.close()
}
