package gorush

import (
	"bytes"
	"context"
	"net/http"
	"time"

	"github.com/bitmark-inc/mobile-app/mobile-server/config"
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
)

type notification struct {
	Title    string                  `json:"title"`
	Topic    string                  `json:"topic"`
	Tokens   []string                `json:"tokens"`
	Platform int                     `json:"platform"`
	Message  string                  `json:"message"`
	Data     *map[string]interface{} `json:"data"`
	Alert    map[string]interface{}  `json:"alert"`
	Badge    int                     `json:"badge"`
	Sound    string                  `json:"sound"`
	// ContentAvailable bool                    `json:"content_available"`
}

type Client struct {
	pushClients map[string]config.PushServerInfo
	client      *http.Client
}

func New(pushClients map[string]config.PushServerInfo) *Client {
	return &Client{
		pushClients: pushClients,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (c *Client) Send(ctx context.Context, title, message, source string, receivers map[string]map[string][]string, data *map[string]interface{}, badge int, silent bool) error {
	var err error
	for client, payloads := range receivers {

		// FIXME: Think an elegant solution for this
		if source == "bitmark-data-donation" && len(client) >= 8 && client[:8] == "registry" {
			log.Info("Source is health data and it's pushing to registry app. Aborting.")
			return nil
		}

		notifications := make([]notification, 0)
		pushserverInfo, ok := c.pushClients[client]
		if !ok {
			log.Error("Cannot find client matches with: ", client)
		}

		for platform, tokens := range payloads {
			notifications = append(notifications, notification{
				Topic:    pushserverInfo.Topic,
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
				// ContentAvailable: !silent,
			})
		}
		log.Info("Pushing to client: ", client)
		body := new(bytes.Buffer)
		json.NewEncoder(body).Encode(map[string]interface{}{"notifications": notifications})
		_, err = ctxhttp.Post(ctx, c.client, pushserverInfo.URI+"/api/push", "application/json", body)
	}

	return err
}

func (c *Client) Ping(ctx context.Context) bool {
	var err error
	for _, pushClient := range c.pushClients {
		log.Info("Ping to:", pushClient.URI)
		_, err = ctxhttp.Head(ctx, c.client, pushClient.URI)
	}

	return err == nil
}
