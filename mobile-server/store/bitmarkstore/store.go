package bitmarkstore

import (
	"time"
)

type BitmarkTracking struct {
	BitmarkID string    `json:"bitmark_id"`
	TxID      string    `json:"tx_id"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

type BitmarkStore interface {
	AddTrackingBitmark(account, bitmarkID, txID, status string) error
	GetTrackingBitmarks(account string) ([]BitmarkTracking, error)
	DeleteTrackingBitmark(account, bitmarkID string) (bool, error)
}
