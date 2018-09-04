package bitmarkstore

import (
	"context"
	"database/sql"
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
	sqlQueryBitmarkTracking           = "SELECT bitmark_id, tx_id, status, created_at FROM mobile.bitmark_tracking WHERE account_number = $1 ORDER BY created_at ASC"
	sqlQueryAccountHasTrackingBitmark = "SELECT bitmark_id, array_agg(account_number) FROM mobile.bitmark_tracking WHERE bitmark_id = ANY($1) GROUP BY bitmark_id"
	sqlInsertBitmarkRenting           = "INSERT INTO mobile.bitmark_renting(id, sender) VALUES ($1, $2)"
	sqlUpdateBitmarkRentingReceiver   = "UPDATE mobile.bitmark_renting SET receiver = $1, granted_at = NOW() WHERE id = $2 AND created_at > NOW() - INTERVAL '5 minutes' RETURNING sender"
	sqlDeleteBitmarkRenting           = "DELETE FROM mobile.bitmark_renting WHERE id = $1"
	sqlQueryBitmarkRenting            = "SELECT id, receiver, created_at, granted_at FROM mobile.bitmark_renting WHERE sender = $1 AND granted_at IS NOT NULL"
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

func (b *BitmarkPGStore) GetTrackingBitmarks(ctx context.Context, account string) ([]BitmarkTracking, error) {
	rows, err := b.dbConn.QueryEx(ctx, sqlQueryBitmarkTracking, nil, account)
	defer rows.Close()
	if err != nil {
		if err != sql.ErrNoRows {
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
		if err != sql.ErrNoRows {
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

// UpdateReceiverBitmarkRenting update receiver and return sender
func (b *BitmarkPGStore) UpdateReceiverBitmarkRenting(ctx context.Context, id, receiver string) (*string, error) {
	row := b.dbConn.QueryRowEx(ctx, sqlUpdateBitmarkRentingReceiver, nil, receiver, id)
	if row == nil {
		return nil, nil
	}

	var sender *string
	if err := row.Scan(&sender); err != nil {
		return nil, err
	}

	return sender, nil
}

// DeleteBitmarkRenting delete bitmark renting item
func (b *BitmarkPGStore) DeleteBitmarkRenting(ctx context.Context, id string) error {
	_, err := b.dbConn.ExecEx(ctx, sqlDeleteBitmarkRenting, nil, id)
	return err
}

func (b *BitmarkPGStore) QueryBitmarkRenting(ctx context.Context, sender string) ([]BitmarkRenting, error) {
	rows, err := b.dbConn.QueryEx(ctx, sqlQueryBitmarkRenting, nil, sender)

	defer rows.Close()
	if err != nil {
		if err != sql.ErrNoRows {
			return nil, err
		}
	}

	items := make([]BitmarkRenting, 0)
	for rows.Next() {
		var id, receiver string
		var createdAt, grantedAt time.Time
		if err := rows.Scan(&id, &receiver, &createdAt, &grantedAt); err != nil {
			return nil, err
		}

		items = append(items, BitmarkRenting{
			ID:        id,
			Receiver:  receiver,
			CreatedAt: createdAt,
			GrantedAt: grantedAt,
		})
	}

	return items, nil
}
