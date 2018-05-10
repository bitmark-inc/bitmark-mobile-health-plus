package bitmarkstore

import (
	"context"
	"database/sql"
	"time"

	"github.com/jackc/pgx"
)

type BitmarkPGStore struct {
	BitmarkStore
	dbConn *pgx.ConnPool
}

const (
	sqlInsertBitmarkTracking          = "INSERT INTO mobile.bitmark_tracking(account_number, bitmark_id, tx_id, status) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING"
	sqlDeleteBitmarkTracking          = "DELETE FROM mobile.bitmark_tracking WHERE bitmark_id = $1 AND account_number = $2"
	sqlQueryBitmarkTracking           = "SELECT bitmark_id, tx_id, status, created_at FROM mobile.bitmark_tracking WHERE account_number = $1 ORDER BY created_at ASC"
	sqlQueryBitmarkTrackingAvailable  = "SELECT EXISTS (SELECT 1 FROM mobile.bitmark_tracking WHERE bitmark_id = $1 LIMIT 1)"
	sqlQueryAccountHasTrackingBitmark = "SELECT array_agg(account_number) FROM mobile.bitmark_tracking WHERE bitmark_id = $1"
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

func (b *BitmarkPGStore) TestTrackingBitmark(ctx context.Context, bitmarkID string) (bool, error) {
	row := b.dbConn.QueryRowEx(ctx, sqlQueryBitmarkTrackingAvailable, nil, bitmarkID)

	var available bool
	err := row.Scan(&available)
	return available, err
}

func (b *BitmarkPGStore) GetAccountHasTrackingBitmark(ctx context.Context, bitmarkID string) ([]string, error) {
	row := b.dbConn.QueryRowEx(ctx, sqlQueryAccountHasTrackingBitmark, nil, bitmarkID)

	var accountNumbers []string
	err := row.Scan(&accountNumbers)
	return accountNumbers, err
}
