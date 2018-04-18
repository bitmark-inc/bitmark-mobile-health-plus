package bitmarkstore

import (
	"time"
)

type BitmarkTracking struct {
	BitmarkID string    `json:"bitmark_id"`
	CreatedAt time.Time `json:"created_at"`
}

type BitmarkStore interface {
	AddTrackingBitmark(account, bitmarkID string) error
	GetTrackingBitmarks(account string) ([]BitmarkTracking, error)
	DeleteTrackingBitmark(account, bitmarkID string) error
}
