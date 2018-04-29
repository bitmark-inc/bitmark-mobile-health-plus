package bitmarkstore

import (
	"context"
	"time"
)

type BitmarkTracking struct {
	BitmarkID string    `json:"bitmark_id"`
	TxID      string    `json:"tx_id"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

type BitmarkStore interface {
	AddTrackingBitmark(ctx context.Context, account, bitmarkID, txID, status string) error
	GetTrackingBitmarks(ctx context.Context, account string) ([]BitmarkTracking, error)
	DeleteTrackingBitmark(ctx context.Context, account, bitmarkID string) (bool, error)
}
