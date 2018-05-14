package blockchain

import jsoniter "github.com/json-iterator/go"

const (
	EventTrackingBitmarkConfirmed = "tracking_transfer_confirmed"
)

var (
	messages = map[string]string{
		EventTrackingBitmarkConfirmed: "Your tracked property %s status has been updated, tap to view details.",
	}
)

var json = jsoniter.ConfigCompatibleWithStandardLibrary

type blockBitmarkInfo struct {
	TxID      string `json:"tx_id"`
	BitmarkID string `json:"bitmark_id"`
}

type blockInfo struct {
	BlockNumber int64              `json:"block_number"`
	Transfers   []blockBitmarkInfo `json:"transfers"`
	Issues      []blockBitmarkInfo `json:"issues"`
}