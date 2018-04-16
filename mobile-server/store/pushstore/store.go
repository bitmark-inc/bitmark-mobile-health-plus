package pushstore

import (
	"time"
)

type PushItem struct {
	ID        int                    `json:"id"`
	Source    string                 `json:"source"`
	Title     string                 `json:"title"`
	Message   string                 `json:"message"`
	Data      map[string]interface{} `json:"data"`
	Pinned    bool                   `json:"pinned"`
	Status    string                 `json:"status"`
	CreatedAt time.Time              `json:"created_at"`
	UpdatedAt time.Time              `json:"updated_at"`
}

type PushStore interface {
	AddAccount(account string) error
	AddPushToken(account, uuid, platform, client string) error
	RemovePushToken(account, uuid string) (bool, error)
	QueryPushTokens(account string) (map[string]map[string][]string, error)
	AddPushItem(account, source, title, message string, data map[string]interface{}, pinned bool) error
	UpdatePushItem(id int, status string) error
	QueryPushItems(account string) ([]PushItem, error)
	QueryBadgeCount(account string) (int, error)
}
