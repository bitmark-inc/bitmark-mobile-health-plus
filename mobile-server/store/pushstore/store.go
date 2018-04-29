package pushstore

import (
	"context"
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
	AddAccount(ctx context.Context, account string) error
	AddPushToken(ctx context.Context, account, uuid, platform, client string) error
	RemovePushToken(ctx context.Context, account, uuid string) (bool, error)
	QueryPushTokens(ctx context.Context, account string) (map[string]map[string][]string, error)
	AddPushItem(ctx context.Context, account, source, title, message string, data *map[string]interface{}, pinned bool) error
	UpdatePushItem(ctx context.Context, id int, status string) error
	QueryPushItems(ctx context.Context, account string) ([]PushItem, error)
	QueryBadgeCount(ctx context.Context, account string) (int, error)
}
