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
	Sender    string    `json:"grantor"`
	Receiver  string    `json:"grantee"`
	CreatedAt time.Time `json:"created_at"`
	GrantedAt time.Time `json:"granted_at"`
}

type BitmarkRentingStatus string

const (
	RentingOpen      BitmarkRentingStatus = "open"
	RentingWaiting   BitmarkRentingStatus = "waiting_confirmation"
	RentingCompleted BitmarkRentingStatus = "completed"
)

type IssueRequestAsset struct {
	ID            string            `json:"id"`
	Sender        string            `json:"registrant"`
	Receiver      string            `json:"issuer"`
	AssetName     string            `json:"asset_name"`
	AssetMetadata map[string]string `json:"asset_metadata"`
	AssetFilename string            `json:"asset_filename"`
	CreatedAt     time.Time         `json:"created_at"`
}

type BitmarkStore interface {
	AddTrackingBitmark(ctx context.Context, account, bitmarkID, txID, status string) error
	GetTrackingBitmarks(ctx context.Context, account string) ([]BitmarkTracking, error)
	DeleteTrackingBitmark(ctx context.Context, account, bitmarkID string) (bool, error)
	DeleteTrackingBitmarkByAccount(ctx context.Context, account string) error
	GetAccountHasTrackingBitmark(ctx context.Context, bitmarkIDs []string) (map[string][]string, error)
	AddBitmarkRenting(ctx context.Context, sender string) (string, error)
	AddBitmarkRentingReceiver(ctx context.Context, id, receiver string) (*string, error)
	UpdateBitmarkRentingStatus(ctx context.Context, id string, status BitmarkRentingStatus) error
	DeleteBitmarkRenting(ctx context.Context, id, account string) error
	DeleteBitmarkRentingByAccount(ctx context.Context, account string) error
	QueryBitmarkRenting(ctx context.Context, account string) ([]BitmarkRenting, []BitmarkRenting, []BitmarkRenting, error)
	AddIssueRequest(ctx context.Context, id, sender, receiver, assetName, filename string, assetMetadata map[string]string) error
	RemoveIssueRequest(ctx context.Context, id, receiver string) error
	QueryIssueRequest(ctx context.Context, receiver string) ([]IssueRequestAsset, error)
}
