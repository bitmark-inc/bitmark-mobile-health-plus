package watcher

import (
	"crypto/tls"

	"github.com/nsqio/go-nsq"
)

type NotifyClient struct {
	Queues   []*nsq.Consumer
	Stop     chan struct{}
	CertPath string
	KeyFile  string
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
	cert, err := tls.LoadX509KeyPair(nc.CertPath, nc.KeyFile)
	if err != nil {
		panic(err)
	}
	tlsConfig := &tls.Config{
		Certificates:       []tls.Certificate{cert},
		InsecureSkipVerify: true,
	}
	config.TlsV1 = true
	config.TlsConfig = tlsConfig
	config.MaxAttempts = 30

	q, err := nsq.NewConsumer(topic, channel, config)
	if err != nil {
		return err
	}

	q.AddHandler(handler)

	nc.Queues = append(nc.Queues, q)

	return nil
}
