package bitmarkstore

import (
	"context"
	"time"

	"github.com/jackc/pgx"
	"github.com/json-iterator/go"

	uuid "github.com/satori/go.uuid"
)

type BitmarkPGStore struct {
	BitmarkStore
	dbConn *pgx.ConnPool
}

var json = jsoniter.ConfigCompatibleWithStandardLibrary

const (
	sqlInsertBitmarkTracking          = "INSERT INTO mobile.bitmark_tracking(account_number, bitmark_id, tx_id, status) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING"
	sqlDeleteBitmarkTracking          = "DELETE FROM mobile.bitmark_tracking WHERE bitmark_id = $1 AND account_number = $2"
	sqlDeleteBitmarkTrackingByAccount = "DELETE FROM mobile.bitmark_tracking WHERE account_number = $1"
	sqlQueryBitmarkTracking           = "SELECT bitmark_id, tx_id, status, created_at FROM mobile.bitmark_tracking WHERE account_number = $1 ORDER BY created_at ASC"
	sqlQueryAccountHasTrackingBitmark = "SELECT bitmark_id, array_agg(account_number) FROM mobile.bitmark_tracking WHERE bitmark_id = ANY($1) GROUP BY bitmark_id"
	sqlInsertBitmarkRenting           = "INSERT INTO mobile.bitmark_renting(id, sender) VALUES ($1, $2)"
	sqlUpdateBitmarkRentingReceiver   = "UPDATE mobile.bitmark_renting SET receiver = $1, updated_at = NOW(), status = 'waiting_confirmation' WHERE id = $2 AND receiver IS NULL AND created_at > NOW() - INTERVAL '3 days' RETURNING sender"
	sqlUpdateBitmarkRentingStatus     = "UPDATE mobile.bitmark_renting SET status = $1, updated_at = NOW() WHERE id = $2"
	sqlDeleteBitmarkRenting           = "DELETE FROM mobile.bitmark_renting WHERE id = $1 AND sender = $2"
	sqlDeleteBitmarkRentingByAccount  = "DELETE FROM mobile.bitmark_renting WHERE sender = $1 OR receiver = $1"
	sqlQueryBitmarkRentingSender      = "SELECT id, sender, receiver, created_at, updated_at FROM mobile.bitmark_renting WHERE sender = $1 AND status = 'completed'"
	sqlQueryBitmarkRentingReceiver    = "SELECT id, sender, receiver, created_at, updated_at FROM mobile.bitmark_renting WHERE receiver = $1 AND status = 'completed'"
	sqlQueryBitmarkRentingAwaiting    = "SELECT id, sender, receiver, created_at, updated_at FROM mobile.bitmark_renting WHERE sender = $1 AND status = 'waiting_confirmation'"
	sqlInsertIssueRequestAsset        = "INSERT INTO mobile.issue_request(id, sender, receiver, asset_name, asset_metadata, asset_filename) VALUES($1, $2, $3, $4, $5, $6)"
	sqlDeleteIssueRequestAsset        = "DELETE FROM mobile.issue_request WHERE id = $1 WHERE receiver = $2"
	sqlQueryIssueRequest              = "SELECT id, sender, receiver, asset_name, asset_metadata, asset_filename, created_at FROM issue_request WHERE receiver = $1"
)

func New(dbConn *pgx.ConnPool) *BitmarkPGStore {
	return &BitmarkPGStore{
		dbConn: dbConn,
	}
}

func (b *BitmarkPGStore) AddTrackingBitmark(ctx context.Context, account, bitmarkID, txID, status string) error {
	_, err := b.dbConn.ExecEx(ctx, sqlInsertBitmarkTracking, nil, account, bitmarkID, txID, status)
	return err
}

func (b *BitmarkPGStore) DeleteTrackingBitmark(ctx context.Context, account, bitmarkID string) (bool, error) {
	tag, err := b.dbConn.ExecEx(ctx, sqlDeleteBitmarkTracking, nil, bitmarkID, account)
	return tag.RowsAffected() > 0, err
}

func (b *BitmarkPGStore) DeleteTrackingBitmarkByAccount(ctx context.Context, account string) error {
	_, err := b.dbConn.ExecEx(ctx, sqlDeleteBitmarkTrackingByAccount, nil, account)
	return err
}

func (b *BitmarkPGStore) GetTrackingBitmarks(ctx context.Context, account string) ([]BitmarkTracking, error) {
	rows, err := b.dbConn.QueryEx(ctx, sqlQueryBitmarkTracking, nil, account)
	defer rows.Close()
	if err != nil {
		if err != pgx.ErrNoRows {
			return nil, err
		}
	}

	items := make([]BitmarkTracking, 0)
	for rows.Next() {
		var bitmarkID, txID, status string
		var createdAt time.Time
		if err := rows.Scan(&bitmarkID, &txID, &status, &createdAt); err != nil {
			return nil, err
		}

		items = append(items, BitmarkTracking{
			BitmarkID: bitmarkID,
			TxID:      txID,
			Status:    status,
			CreatedAt: createdAt,
		})
	}

	return items, nil
}

func (b *BitmarkPGStore) GetAccountHasTrackingBitmark(ctx context.Context, bitmarkIDs []string) (map[string][]string, error) {
	rows, err := b.dbConn.QueryEx(ctx, sqlQueryAccountHasTrackingBitmark, nil, bitmarkIDs)

	defer rows.Close()
	if err != nil {
		if err != pgx.ErrNoRows {
			return nil, err
		}
	}

	result := make(map[string][]string)

	for rows.Next() {
		var bitmarkID string
		var accountNumbers []string
		if err := rows.Scan(&bitmarkID, &accountNumbers); err != nil {
			return nil, err
		}

		result[bitmarkID] = accountNumbers
	}

	return result, nil
}

// AddBitmarkRenting add bitmark renting item
func (b *BitmarkPGStore) AddBitmarkRenting(ctx context.Context, sender string) (string, error) {
	id := uuid.NewV4().String()

	_, err := b.dbConn.ExecEx(ctx, sqlInsertBitmarkRenting, nil, id, sender)
	return id, err
}

// AddBitmarkRentingReceiver update receiver and return sender
func (b *BitmarkPGStore) AddBitmarkRentingReceiver(ctx context.Context, id, receiver string) (*string, error) {
	row := b.dbConn.QueryRowEx(ctx, sqlUpdateBitmarkRentingReceiver, nil, receiver, id)
	if row == nil {
		return nil, nil
	}

	var sender *string
	if err := row.Scan(&sender); err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		} else {
			return nil, err
		}
	}

	return sender, nil
}

// AddBitmarkRentingReceiver update receiver and return sender
func (b *BitmarkPGStore) UpdateBitmarkRentingStatus(ctx context.Context, id string, status BitmarkRentingStatus) error {
	_, err := b.dbConn.ExecEx(ctx, sqlUpdateBitmarkRentingStatus, nil, string(status), id)
	return err
}

// DeleteBitmarkRenting delete bitmark renting item
func (b *BitmarkPGStore) DeleteBitmarkRenting(ctx context.Context, id, account string) error {
	_, err := b.dbConn.ExecEx(ctx, sqlDeleteBitmarkRenting, nil, id, account)
	return err
}

// DeleteBitmarkRentingByAccount delete bitmark renting item
func (b *BitmarkPGStore) DeleteBitmarkRentingByAccount(ctx context.Context, account string) error {
	_, err := b.dbConn.ExecEx(ctx, sqlDeleteBitmarkRentingByAccount, nil, account)
	return err
}

func (b *BitmarkPGStore) QueryBitmarkRenting(ctx context.Context, account string) ([]BitmarkRenting, []BitmarkRenting, []BitmarkRenting, error) {
	// Sender
	rows1, err := b.dbConn.QueryEx(ctx, sqlQueryBitmarkRentingSender, nil, account)

	defer rows1.Close()
	if err != nil {
		if err != pgx.ErrNoRows {
			return nil, nil, nil, err
		}
	}

	senderList := make([]BitmarkRenting, 0)
	for rows1.Next() {
		var id, sender, receiver string
		var createdAt, grantedAt time.Time
		if err := rows1.Scan(&id, &sender, &receiver, &createdAt, &grantedAt); err != nil {
			return nil, nil, nil, err
		}

		senderList = append(senderList, BitmarkRenting{
			ID:        id,
			Sender:    sender,
			Receiver:  receiver,
			CreatedAt: createdAt,
			GrantedAt: grantedAt,
		})
	}
	rows1.Close()

	// Receiver
	rows2, err := b.dbConn.QueryEx(ctx, sqlQueryBitmarkRentingReceiver, nil, account)
	defer rows2.Close()

	if err != nil {
		if err != pgx.ErrNoRows {
			return nil, nil, nil, err
		}
	}

	receiverList := make([]BitmarkRenting, 0)
	for rows2.Next() {
		var id, sender, receiver string
		var createdAt, grantedAt time.Time
		if err := rows2.Scan(&id, &sender, &receiver, &createdAt, &grantedAt); err != nil {
			return nil, nil, nil, err
		}

		receiverList = append(receiverList, BitmarkRenting{
			ID:        id,
			Sender:    sender,
			Receiver:  receiver,
			CreatedAt: createdAt,
			GrantedAt: grantedAt,
		})
	}
	rows2.Close()

	// Awaiting
	rows3, err := b.dbConn.QueryEx(ctx, sqlQueryBitmarkRentingAwaiting, nil, account)
	defer rows3.Close()

	if err != nil {
		if err != pgx.ErrNoRows {
			return nil, nil, nil, err
		}
	}

	awaitingList := make([]BitmarkRenting, 0)
	for rows3.Next() {
		var id, sender, awaiting string
		var createdAt, grantedAt time.Time
		if err := rows3.Scan(&id, &sender, &awaiting, &createdAt, &grantedAt); err != nil {
			return nil, nil, nil, err
		}

		awaitingList = append(awaitingList, BitmarkRenting{
			ID:        id,
			Sender:    sender,
			Receiver:  awaiting,
			CreatedAt: createdAt,
			GrantedAt: grantedAt,
		})
	}

	return senderList, receiverList, awaitingList, nil
}

func (b *BitmarkPGStore) AddIssueRequest(ctx context.Context, id, sender, receiver, assetName, filename string, assetMetadata map[string]string) error {
	_, err := b.dbConn.ExecEx(ctx, sqlInsertIssueRequestAsset, nil, id, sender, receiver, assetName, assetMetadata, filename)
	return err
}

func (b *BitmarkPGStore) RemoveIssueRequest(ctx context.Context, id, receiver string) error {
	_, err := b.dbConn.ExecEx(ctx, sqlDeleteIssueRequestAsset, nil, id, receiver)
	return err
}

func (b *BitmarkPGStore) QueryIssueRequest(ctx context.Context, receiver string) ([]IssueRequestAsset, error) {
	rows, err := b.dbConn.QueryEx(ctx, sqlQueryIssueRequest, nil, receiver)

	defer rows.Close()
	if err != nil {
		if err != pgx.ErrNoRows {
			return nil, err
		}
	}

	issueRequests := make([]IssueRequestAsset, 0)

	for rows.Next() {
		var i IssueRequestAsset
		if err := rows.Scan(&i.ID, &i.Sender, &i.Receiver, &i.AssetName, &i.AssetMetadata, &i.AssetFilename, &i.CreatedAt); err != nil {
			return nil, err
		}

		issueRequests = append(issueRequests, i)
	}

	return issueRequests, nil
}
