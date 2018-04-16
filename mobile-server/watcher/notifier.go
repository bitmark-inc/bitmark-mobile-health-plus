package watcher

import (
	"github.com/nsqio/go-nsq"
)

type notifyClient struct {
	queues []*nsq.Consumer
	stop   chan struct{}
}

func (nc *notifyClient) close() {
	close(nc.stop)
}

func (nc *notifyClient) connect(hostPort string) error {
	for _, queue := range nc.queues {
		if err := queue.ConnectToNSQD(hostPort); err != nil {
			return err
		}
	}

	return nil
}

func (nc *notifyClient) add(topic, channel string, handler nsq.Handler) error {
	config := nsq.NewConfig()
	q, err := nsq.NewConsumer(topic, channel, config)
	if err != nil {
		return err
	}

	q.AddHandler(handler)

	nc.queues = append(nc.queues, q)

	return nil
}
