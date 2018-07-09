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

type Bitmark struct {
	ID          string    `json:"id"`
	Owner       string    `json:"owner"`
	Issuer      string    `json:"issuer"`
	IssuedAt    time.Time `json:"issued_at"`
	BlockNumber int       `json:"block_number"`
	Offset      int64     `json:"offset"`
	Status      string    `json:"status"`
}

type Asset struct {
	ID       string            `json:"id"`
	Name     string            `json:"name"`
	Metadata map[string]string `json:"metadata"`
}

type BitmarkInfo struct {
	Bitmark Bitmark `json:"bitmark"`
	Asset   Asset   `json:"asset"`
}

type Tx struct {
	ID        string `json:"id"`
	Owner     string `json:"owner"`
	Status    string `json:"status"`
	BitmarkID string `json:"bitmark_id"`
}

type TxInfo struct {
	Tx    Bitmark `json:"tx"`
	Asset Asset   `json:"asset"`
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

func (c *Client) GetBitmarkInfo(ctx context.Context, bitmarkID string) (*BitmarkInfo, error) {
	bitmarkInfoURL := c.url + "/v1/bitmarks/" + bitmarkID + "?asset=true"
	response, err := ctxhttp.Get(ctx, c.client, bitmarkInfoURL)
	if err != nil {
		return nil, err
	}

	var bitmarkInfo BitmarkInfo

	decoder := json.NewDecoder(response.Body)
	if err := decoder.Decode(&bitmarkInfo); err != nil {
		return nil, err
	}

	return &bitmarkInfo, nil
}

func (c *Client) GetTxInfo(ctx context.Context, txID string) (*TxInfo, error) {
	txInfoURL := c.url + "/v1/txs/" + txID + "?asset=true"
	response, err := ctxhttp.Get(ctx, c.client, txInfoURL)
	if err != nil {
		return nil, err
	}

	var txInfo TxInfo

	decoder := json.NewDecoder(response.Body)
	if err := decoder.Decode(&txInfo); err != nil {
		return nil, err
	}

	return &txInfo, nil
}
