package bitmarkstore

import (
	"database/sql"
	"time"

	"github.com/jackc/pgx"
)

type BitmarkPGStore struct {
	BitmarkStore
	dbConn *pgx.Conn
}

const (
	sqlInsertBitmarkTracking = "INSERT INTO mobile.bitmark_tracking(bitmark_id, account_number) VALUES ($1, $2) ON CONFLICT DO NOTHING"
	sqlDeleteBitmarkTracking = "DELETE FROM mobile.bitmark_tracking WHERE bitmark_id = $1, account_number = $2"
	sqlQueryBitmarkTracking  = "SELECT bitmark_id, created_at FROM mobile.bitmark_tracking WHERE account = $1 ORDER BY created_at ASC"
)

func New(dbConn *pgx.Conn) *BitmarkPGStore {
	return &BitmarkPGStore{
		dbConn: dbConn,
	}
}

func (b *BitmarkPGStore) AddTrackingBitmark(account, bitmarkID string) error {
	_, err := b.dbConn.Exec(sqlInsertBitmarkTracking, bitmarkID, account)
	return err
}

func (b *BitmarkPGStore) DeleteTrackingBitmark(account, bitmarkID string) error {
	_, err := b.dbConn.Exec(sqlDeleteBitmarkTracking, bitmarkID, account)
	return err
}

func (b *BitmarkPGStore) GetTrackingBitmarks(account string) ([]BitmarkTracking, error) {
	rows, err := b.dbConn.Query(sqlQueryBitmarkTracking, account)
	if err != nil {
		if err != sql.ErrNoRows {
			return nil, err
		}
	}
	defer rows.Close()

	items := make([]BitmarkTracking, 0)
	for rows.Next() {
		var bitmarkID string
		var createdAt time.Time
		if err := rows.Scan(&bitmarkID, &createdAt); err != nil {
			return nil, err
		}

		items = append(items, BitmarkTracking{
			BitmarkID: bitmarkID,
			CreatedAt: createdAt,
		})
	}

	return items, nil
}
