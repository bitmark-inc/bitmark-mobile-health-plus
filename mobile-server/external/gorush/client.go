package gorush

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httputil"

	log "github.com/sirupsen/logrus"
)

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
	Title    string                 `json:"title"`
	Topic    string                 `json:"topic"`
	Tokens   []string               `json:"tokens"`
	Platform int                    `json:"platform"`
	Message  string                 `json:"message"`
	Data     map[string]interface{} `json:"data"`
	Alert    map[string]interface{} `json:"alert"`
	Badge    int                    `json:"badge"`
	Sound    string                 `json:"sound"`
}

type Client struct {
	urls map[string]string
}

func New(urls map[string]string) *Client {
	return &Client{urls}
}

func (c *Client) Send(title, message string, receivers map[string]map[string][]string, data map[string]interface{}, badge int) error {
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
			})
		}
		log.Info("Pushing to client: ", client)
		body := new(bytes.Buffer)
		json.NewEncoder(body).Encode(map[string]interface{}{"notifications": notifications})
		resp, err := http.DefaultClient.Post(c.urls[client]+"/api/push", "application/json", body)

		// For debugging
		if err != nil {
			responseDump, err := httputil.DumpResponse(resp, true)
			if err != nil {
				log.Error(err)
			}
			log.WithField("responseDump", responseDump).Error(err)
		}
	}

	return err
}

func (c *Client) Ping() bool {
	var err error
	for _, url := range c.urls {
		log.Info("Ping to:", url)
		_, err = http.DefaultClient.Head(url)
	}

	return err == nil
}
