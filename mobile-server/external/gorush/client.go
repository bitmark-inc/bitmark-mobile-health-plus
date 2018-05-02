package gorush

import (
	"bytes"
	"context"
	"net/http"
	"time"

	"github.com/json-iterator/go"
	"golang.org/x/net/context/ctxhttp"

	log "github.com/sirupsen/logrus"
)

var json = jsoniter.ConfigCompatibleWithStandardLibrary

var (
	platformCode = map[string]int{
		"ios":     1,
		"android": 2,
	}

	clientTopics = map[string]string{
		"primary": "com.bitmark.bitmarkios",
		"beta":    "com.bitmark.bitmarkios.inhouse",
	}
)

type notification struct {
	Title            string                  `json:"title"`
	Topic            string                  `json:"topic"`
	Tokens           []string                `json:"tokens"`
	Platform         int                     `json:"platform"`
	Message          string                  `json:"message"`
	Data             *map[string]interface{} `json:"data"`
	Alert            map[string]interface{}  `json:"alert"`
	Badge            int                     `json:"badge"`
	Sound            string                  `json:"sound"`
	ContentAvailable bool                    `json:"content_available"`
}

type Client struct {
	urls   map[string]string
	client *http.Client
}

func New(urls map[string]string) *Client {
	return &Client{
		urls: urls,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (c *Client) Send(ctx context.Context, title, message string, receivers map[string]map[string][]string, data *map[string]interface{}, badge int, silent bool) error {
	var err error
	for client, payloads := range receivers {
		notifications := make([]notification, 0)

		for platform, tokens := range payloads {
			notifications = append(notifications, notification{
				Topic:    clientTopics[client],
				Tokens:   tokens,
				Platform: platformCode[platform],
				Message:  message,
				Data:     data,
				// Badge:    badge,
				Sound: "default",
				Alert: map[string]interface{}{
					"title": title,
					"body":  message,
				},
				ContentAvailable: !silent,
			})
		}
		log.Info("Pushing to client: ", client)
		body := new(bytes.Buffer)
		json.NewEncoder(body).Encode(map[string]interface{}{"notifications": notifications})
		_, err = ctxhttp.Post(ctx, c.client, c.urls[client]+"/api/push", "application/json", body)
	}

	return err
}

func (c *Client) Ping(ctx context.Context) bool {
	var err error
	for _, url := range c.urls {
		log.Info("Ping to:", url)
		_, err = ctxhttp.Head(ctx, c.client, url)
	}

	return err == nil
}
