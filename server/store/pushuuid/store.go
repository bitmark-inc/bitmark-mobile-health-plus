package pushuuid

type PushUUIDStore interface {
	AddPushToken(account, uuid, platform, client string) error
	RemovePushToken(account, uuid string) (bool, error)
	QueryPushTokens(account string) (map[string]map[string][]string, error)
}
