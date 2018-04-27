package bitmarkstore

import (
	"database/sql"
	"time"

	"github.com/jackc/pgx"
)

type BitmarkPGStore struct {
	BitmarkStore
	dbConn *pgx.ConnPool
}

const (
	sqlInsertBitmarkTracking = "INSERT INTO mobile.bitmark_tracking(account_number, bitmark_id, tx_id, status) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING"
	sqlDeleteBitmarkTracking = "DELETE FROM mobile.bitmark_tracking WHERE bitmark_id = $1 AND account_number = $2"
	sqlQueryBitmarkTracking  = "SELECT bitmark_id, tx_id, status, created_at FROM mobile.bitmark_tracking WHERE account_number = $1 ORDER BY created_at ASC"
)

func New(dbConn *pgx.ConnPool) *BitmarkPGStore {
	return &BitmarkPGStore{
		dbConn: dbConn,
	}
}

func (b *BitmarkPGStore) AddTrackingBitmark(account, bitmarkID, txID, status string) error {
	_, err := b.dbConn.Exec(sqlInsertBitmarkTracking, account, bitmarkID, txID, status)
	return err
}

func (b *BitmarkPGStore) DeleteTrackingBitmark(account, bitmarkID string) (bool, error) {
	tag, err := b.dbConn.Exec(sqlDeleteBitmarkTracking, bitmarkID, account)
	return tag.RowsAffected() > 0, err
}

func (b *BitmarkPGStore) GetTrackingBitmarks(account string) ([]BitmarkTracking, error) {
	rows, err := b.dbConn.Query(sqlQueryBitmarkTracking, account)
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
