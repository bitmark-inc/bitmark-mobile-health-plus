package gateway

import (
	"context"
	"net/http"
	"time"

	"golang.org/x/net/context/ctxhttp"

	"github.com/json-iterator/go"

	bitmarksdk "github.com/bitmark-inc/bitmark-sdk-go"
	log "github.com/sirupsen/logrus"
)

var json = jsoniter.ConfigCompatibleWithStandardLibrary

type Client struct {
	url    string
	client *http.Client
}

func New(url string) *Client {
	return &Client{
		url: url,
		client: &http.Client{
			Timeout: 10 * time.Second,
		}}
}

type TransferOffer struct {
	Id        string                         `json:"id"`
	BitmarkId string                         `json:"bitmark_id"`
	From      string                         `json:"from"`
	To        string                         `json:"to"`
	Status    string                         `json:"status"`
	Record    bitmarksdk.TransferOfferRecord `json:"record"`
	ExtraInfo map[string]interface{}         `json:"extra_info"`
	CreatedAt time.Time                      `json:"created_at"`
	TxId      string                         `json:"txId"`
	Open      bool                           `json:"open"`
}

func (c *Client) GetOfferIdInfo(ctx context.Context, offerID string) (*TransferOffer, error) {
	requestURL := c.url + "/v2/transfer_offers?offer_id=" + offerID
	resp, err := ctxhttp.Get(ctx, c.client, requestURL)
	if err != nil {
		return nil, err
	}

	var offer map[string]*TransferOffer
	if err := json.NewDecoder(resp.Body).Decode(&offer); err != nil {
		return nil, err
	}

	return offer["offer"], nil
}

func (c *Client) Ping(ctx context.Context) bool {
	log.Info("Ping to:", c.url)
	_, err := ctxhttp.Head(ctx, c.client, c.url)
	return err == nil
}
