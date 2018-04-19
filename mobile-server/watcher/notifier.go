package watcher

import (
	"github.com/nsqio/go-nsq"
)

type NotifyClient struct {
	Queues []*nsq.Consumer
	Stop   chan struct{}
}

func (nc *NotifyClient) Close() {
	close(nc.Stop)
}

func (nc *NotifyClient) Connect(hostPort string) error {
	for _, queue := range nc.Queues {
		if err := queue.ConnectToNSQD(hostPort); err != nil {
			return err
		}
	}

	return nil
}

func (nc *NotifyClient) Add(topic, channel string, handler nsq.Handler) error {
	config := nsq.NewConfig()
	q, err := nsq.NewConsumer(topic, channel, config)
	if err != nil {
		return err
	}

	q.AddHandler(handler)

	nc.Queues = append(nc.Queues, q)

	return nil
}
