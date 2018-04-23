package pushstore

import (
	"database/sql"
	"encoding/json"
	"time"

	"github.com/jackc/pgx"
)

type PushPGStore struct {
	PushStore
	dbConn *pgx.Conn
}

type NotificationToken struct {
	Tokens   []string
	Platform string
}

const (
	sqlInsertAccount      = "INSERT INTO mobile.account(account_number) VALUES ($1) ON CONFLICT DO NOTHING"
	sqlInsertUUID         = "INSERT INTO mobile.push_uuid VALUES($1, $2, $3, $4) ON CONFLICT DO NOTHING"
	sqlRemoveUUID         = "DELETE FROM mobile.push_uuid WHERE account_number = $1 AND token = $2"
	sqlQueryPushTokens    = "SELECT platform, client, json_agg(token) FROM mobile.push_uuid WHERE account_number = $1 GROUP BY platform, client"
	sqlInsertPushItem     = "INSERT INTO mobile.push_item(account_number, source, title, message, data, pinned) VALUES ($1, $2, $3, $4, $5, $6)"
	sqlUpdatePushItem     = "UPDATE mobile.push_item SET status = $1, updated_at = now() WHERE id = $2"
	sqlQueryPushItems     = "SELECT id, source, title, message, data, pinned, status, created_at, updated_at FROM mobile.push_item WHERE account_number = $1 ORDER BY updated_at"
	sqlQueryPushItemCount = "SELECT count(id) FROM mobile.push_item WHERE account_number = $1 AND status <> 'completed'"
)

func NewPGStore(dbConn *pgx.Conn) *PushPGStore {
	return &PushPGStore{
		dbConn: dbConn,
	}
}

func (p *PushPGStore) AddAccount(account string) error {
	_, err := p.dbConn.Exec(sqlInsertAccount, account)
	return err
}

func (p *PushPGStore) AddPushToken(account, uuid, platform, client string) error {
	if err := p.AddAccount(account); err != nil {
		return err
	}

	if _, err := p.dbConn.Exec(sqlInsertUUID, account, uuid, platform, client); err != nil {
		return err
	}

	return nil
}

func (p *PushPGStore) RemovePushToken(account, uuid string) (bool, error) {
	result, err := p.dbConn.Exec(sqlRemoveUUID, account, uuid)
	if err != nil {
		return false, err
	}

	rowAffected := result.RowsAffected()

	if rowAffected == 0 || err != nil {
		return false, err
	}

	return true, nil
}

func (p *PushPGStore) QueryPushTokens(account string) (map[string]map[string][]string, error) {
	rows, err := p.dbConn.Query(sqlQueryPushTokens, account)
	defer rows.Close()
	if err != nil {
		if err != sql.ErrNoRows {
			return nil, err
		}
	}

	clients := make(map[string]map[string][]string)
	for rows.Next() {
		var client string
		var platform string
		var rawTokens json.RawMessage
		err := rows.Scan(&platform, &client, &rawTokens)
		if err != nil {
			return nil, err
		}

		receivers := clients[client]
		if receivers == nil {
			receivers = make(map[string][]string)
		}

		tokens := make([]string, 0)
		json.Unmarshal(rawTokens, &tokens)

		receivers[platform] = tokens
		clients[client] = receivers
	}

	return clients, nil
}

func (p *PushPGStore) AddPushItem(account, source, title, message string, data map[string]interface{}, pinned bool) error {
	if err := p.AddAccount(account); err != nil {
		return err
	}

	_, err := p.dbConn.Exec(sqlInsertPushItem, account, source, title, message, data, pinned)
	return err
}

func (p *PushPGStore) UpdatePushItem(id int, status string) error {
	_, err := p.dbConn.Exec(sqlUpdatePushItem, status, id)
	return err
}

func (p *PushPGStore) QueryPushItems(account string) ([]PushItem, error) {
	rows, err := p.dbConn.Query(sqlQueryPushItems, account)
	defer rows.Close()
	if err != nil {
		if err != sql.ErrNoRows {
			return nil, err
		}
	}

	items := make([]PushItem, 0)
	for rows.Next() {
		var id int
		var source, title, message, status string
		var d json.RawMessage
		var pinned bool
		var createdAt, updatedAt time.Time
		if err := rows.Scan(&id, &source, &title, &message, &d, &pinned, &status, &createdAt, &updatedAt); err != nil {
			return nil, err
		}

		var data map[string]interface{}
		if err := json.Unmarshal(d, &data); err != nil {
			return nil, err
		}

		items = append(items, PushItem{
			ID:        id,
			Source:    source,
			Title:     title,
			Message:   message,
			Data:      data,
			Pinned:    pinned,
			Status:    status,
			CreatedAt: createdAt,
			UpdatedAt: updatedAt,
		})
	}

	return items, nil
}

func (p *PushPGStore) QueryBadgeCount(account string) (int, error) {
	rows, err := p.dbConn.Query(sqlQueryPushItemCount, account)
	defer rows.Close()
	if err != nil {
		if err != sql.ErrNoRows {
			return 0, err
		}
	}

	if rows.Next() {
		var count int
		err := rows.Scan(&count)
		return count, err
	}

	return 0, nil
}
