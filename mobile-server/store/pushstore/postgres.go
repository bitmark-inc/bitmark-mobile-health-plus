package pushstore

import (
	"context"
	"database/sql"
	"time"

	"github.com/json-iterator/go"

	"github.com/jackc/pgx"
)

var json = jsoniter.ConfigCompatibleWithStandardLibrary

type PushPGStore struct {
	PushStore
	dbConn *pgx.ConnPool
}

type NotificationToken struct {
	Tokens   []string
	Platform string
}

const (
	sqlInsertAccount       = "INSERT INTO mobile.account(account_number) VALUES ($1) ON CONFLICT DO NOTHING"
	sqlInsertUUID          = "INSERT INTO mobile.push_uuid VALUES($1, $2, $3, $4) ON CONFLICT DO NOTHING"
	sqlRemoveUUID          = "DELETE FROM mobile.push_uuid WHERE account_number = $1 AND token = $2"
	sqlRemoveUUIDByAccount = "DELETE FROM mobile.push_uuid WHERE account_number = $1"
	sqlQueryPushTokens     = "SELECT platform, client, json_agg(token) FROM mobile.push_uuid WHERE account_number = $1 GROUP BY platform, client"
	sqlInsertPushItem      = "INSERT INTO mobile.push_item(account_number, source, title, message, data, pinned) VALUES ($1, $2, $3, $4, $5, $6)"
	sqlUpdatePushItem      = "UPDATE mobile.push_item SET status = $1, updated_at = now() WHERE id = $2"
	sqlQueryPushItems      = "SELECT id, source, title, message, data, pinned, status, created_at, updated_at FROM mobile.push_item WHERE account_number = $1 ORDER BY updated_at"
	sqlQueryPushItemCount  = "SELECT count(id) FROM mobile.push_item WHERE account_number = $1 AND status <> 'completed'"
)

func NewPGStore(dbConn *pgx.ConnPool) *PushPGStore {
	return &PushPGStore{
		dbConn: dbConn,
	}
}

func (p *PushPGStore) AddAccount(ctx context.Context, account string) error {
	_, err := p.dbConn.ExecEx(ctx, sqlInsertAccount, nil, account)
	return err
}

func (p *PushPGStore) AddPushToken(ctx context.Context, account, uuid, platform, client string) error {
	if err := p.AddAccount(ctx, account); err != nil {
		return err
	}

	if _, err := p.dbConn.ExecEx(ctx, sqlInsertUUID, nil, account, uuid, platform, client); err != nil {
		return err
	}

	return nil
}

func (p *PushPGStore) RemovePushToken(ctx context.Context, account, uuid string) (bool, error) {
	result, err := p.dbConn.ExecEx(ctx, sqlRemoveUUID, nil, account, uuid)
	if err != nil {
		return false, err
	}

	rowAffected := result.RowsAffected()

	if rowAffected == 0 || err != nil {
		return false, err
	}

	return true, nil
}

func (p *PushPGStore) RemovePushTokenByAccount(ctx context.Context, account string) error {
	_, err := p.dbConn.ExecEx(ctx, sqlRemoveUUIDByAccount, nil, account)
	return err
}

func (p *PushPGStore) QueryPushTokens(ctx context.Context, account string) (map[string]map[string][]string, error) {
	rows, err := p.dbConn.QueryEx(ctx, sqlQueryPushTokens, nil, account)
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
		var rawTokens []byte
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

func (p *PushPGStore) AddPushItem(ctx context.Context, account, source, title, message string, data *map[string]interface{}, pinned bool) error {
	if err := p.AddAccount(ctx, account); err != nil {
		return err
	}

	_, err := p.dbConn.ExecEx(ctx, sqlInsertPushItem, nil, account, source, title, message, data, pinned)
	return err
}

func (p *PushPGStore) UpdatePushItem(ctx context.Context, id int, status string) error {
	_, err := p.dbConn.ExecEx(ctx, sqlUpdatePushItem, nil, status, id)
	return err
}

func (p *PushPGStore) QueryPushItems(ctx context.Context, account string) ([]PushItem, error) {
	rows, err := p.dbConn.QueryEx(ctx, sqlQueryPushItems, nil, account)
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
		var d []byte
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

func (p *PushPGStore) QueryBadgeCount(ctx context.Context, account string) (int, error) {
	rows, err := p.dbConn.QueryEx(ctx, sqlQueryPushItemCount, nil, account)
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
