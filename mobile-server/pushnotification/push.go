package pushnotification

import (
	"context"

	"github.com/bitmark-inc/mobile-app/mobile-server/external/gorush"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/pushstore"
)

type PushInfo struct {
	Title      string
	Message    string
	Data       *map[string]interface{}
	CollapseID string
	Pinned     bool
	Source     string
	Silent     bool
	LocKey     string
	LocArgs    []string
}

func PushByAccount(ctx context.Context, account string, p *PushInfo, store pushstore.PushStore, client *gorush.Client) error {
	receivers, err := store.QueryPushTokensByAccount(ctx, account)
	if err != nil {
		return err
	}

	return client.Send(ctx, p.Title, p.Message, p.Source, p.CollapseID, p.LocKey, p.LocArgs, receivers, p.Data, 0, p.Silent)
}

func PushByIntercomUserID(ctx context.Context, intercomUserID string, p *PushInfo, store pushstore.PushStore, client *gorush.Client) error {
	receivers, err := store.QueryPushTokensByIntercom(ctx, intercomUserID)
	if err != nil {
		return err
	}

	return client.Send(ctx, p.Title, p.Message, p.Source, p.CollapseID, p.LocKey, p.LocArgs, receivers, p.Data, 0, p.Silent)
}
