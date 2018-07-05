package blockchain

import jsoniter "github.com/json-iterator/go"

const (
	EventTrackingBitmarkConfirmed  = "tracking_transfer_confirmed"
	EventTransferConfirmedSender   = "transfer_confirmed_sender"
	EventTransferConfirmedReceiver = "transfer_confirmed_receiver"
)

var (
	messages = map[string]string{
		EventTrackingBitmarkConfirmed:  "The property \"%s\" has been updated, tap to view tracking details.",
		EventTransferConfirmedSender:   "The property \"%s\" was transferred to %s.",
		EventTransferConfirmedReceiver: "You have received the property \"%s\" from %s.",
	}
)

var json = jsoniter.ConfigCompatibleWithStandardLibrary

type blockBitmarkInfo struct {
	TxID         string  `json:"tx_id"`
	BitmarkID    string  `json:"bitmark_id"`
	Owner        string  `json:"owner"`
	AssetID      string  `json:"asset_id"`
	TxPreviousID *string `json:"tx_previoud_id"`
}

type blockInfo struct {
	BlockNumber int64              `json:"block_number"`
	Transfers   []blockBitmarkInfo `json:"transfers"`
	Issues      []blockBitmarkInfo `json:"issues"`
}
