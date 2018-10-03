package pushnotification

import (
	"context"

	"github.com/bitmark-inc/mobile-app/mobile-server/external/gorush"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/pushstore"
)

type PushInfo struct {
	Account string
	Title   string
	Message string
	Data    *map[string]interface{}
	Pinned  bool
	Source  string
	Silent  bool
	LocKey  *string
	LocArgs []string
}

func Push(ctx context.Context, p *PushInfo, store pushstore.PushStore, client *gorush.Client) error {
	receivers, err := store.QueryPushTokens(ctx, p.Account)
	if err != nil {
		return err
	}

	return client.Send(ctx, p.Title, p.Message, p.Source, receivers, p.Data, p.LocKey, p.LocArgs, 0, p.Silent)
}
