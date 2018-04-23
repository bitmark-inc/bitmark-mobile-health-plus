package pushnotification

import (
	"github.com/bitmark-inc/mobile-app/mobile-server/external/gorush"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/pushstore"
)

type PushInfo struct {
	Account string
	Title   string
	Message string
	Data    map[string]interface{}
	Pinned  bool
	Source  string
	Silent  bool
}

func Push(p PushInfo, store pushstore.PushStore, client *gorush.Client) error {
	receivers, err := store.QueryPushTokens(p.Account)
	if err != nil {
		return err
	}

	if !p.Silent {
		if err := store.AddPushItem(p.Account, p.Source, p.Title, p.Message, p.Data, p.Pinned); err != nil {
			return err
		}
	} else {
		p.Data["app_silent"] = true
	}

	badge, err := store.QueryBadgeCount(p.Account)
	if err != nil {
		return err
	}

	return client.Send(p.Title, p.Message, receivers, p.Data, badge)
}
