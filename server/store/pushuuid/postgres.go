package pushuuid

import (
	"database/sql"
	"encoding/json"

	"github.com/jackc/pgx"
)

type PushUUIDPGStore struct {
	PushUUIDStore
	dbConn *pgx.Conn
}

type NotificationToken struct {
	Tokens   []string
	Platform string
}

const (
	sqlInsertAccount   = "INSERT INTO mobile.account(account_number) VALUES ($1) ON CONFLICT DO NOTHING"
	sqlInsertUUID      = "INSERT INTO mobile.push_uuid VALUES($1, $2, $3, $4) ON CONFLICT DO NOTHING"
	sqlRemoveUUID      = "DELETE FROM mobile.push_uuid WHERE account_number = $1 AND token = $2"
	sqlQueryPushTokens = "SELECT platform, client, json_agg(token) FROM mobile.push_uuid WHERE account_number = $1 GROUP BY platform, client"
)

func NewPGStore(dbConn *pgx.Conn) *PushUUIDPGStore {
	return &PushUUIDPGStore{
		dbConn: dbConn,
	}
}

func (p *PushUUIDPGStore) AddPushToken(account, uuid, platform, client string) error {
	if _, err := p.dbConn.Exec(sqlInsertAccount, account); err != nil {
		return err
	}

	if _, err := p.dbConn.Exec(sqlInsertUUID, account, uuid, platform, client); err != nil {
		return err
	}

	return nil
}

func (p *PushUUIDPGStore) RemovePushToken(account, uuid string) (bool, error) {
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

func (p *PushUUIDPGStore) QueryPushTokens(account string) (map[string]map[string][]string, error) {
	rows, err := p.dbConn.Query(sqlQueryPushTokens, account)
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
