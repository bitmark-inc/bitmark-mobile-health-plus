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

type BitmarkRenting struct {
	ID        string    `json:"id"`
	Receiver  string    `json:"grantee"`
	CreatedAt time.Time `json:"created_at"`
	GrantedAt time.Time `json:"granted_at"`
}

type BitmarkStore interface {
	AddTrackingBitmark(ctx context.Context, account, bitmarkID, txID, status string) error
	GetTrackingBitmarks(ctx context.Context, account string) ([]BitmarkTracking, error)
	DeleteTrackingBitmark(ctx context.Context, account, bitmarkID string) (bool, error)
	GetAccountHasTrackingBitmark(ctx context.Context, bitmarkIDs []string) (map[string][]string, error)
	AddBitmarkRenting(ctx context.Context, sender string) (string, error)
	UpdateReceiverBitmarkRenting(ctx context.Context, id, receiver string) (*string, error)
	DeleteBitmarkRenting(ctx context.Context, id string) error
	QueryBitmarkRenting(ctx context.Context, sender string) ([]BitmarkRenting, error)
}
