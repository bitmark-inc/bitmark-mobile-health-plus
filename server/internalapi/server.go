package internalapi

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx"

	"github.com/bitmark-inc/mobile-app/server/external/notification"
	"github.com/bitmark-inc/mobile-app/server/logmodule"
	"github.com/bitmark-inc/mobile-app/server/store/pushuuid"
)

type InternalAPIServer struct {
	router *gin.Engine

	dbConn *pgx.Conn

	// Stores
	pushUUIDStore pushuuid.PushUUIDStore

	// External API
	pushAPIClient *notification.Client
}

func (s *InternalAPIServer) Run(addr string) error {
	r := s.router
	r.Use(logmodule.Ginrus("Internal API"))

	api := r.Group("/api")

	pushNotification := api.Group("/push_notifications")
	pushNotification.POST("", s.PushNotification)

	return s.router.Run(addr)
}

func New(db *pgx.Conn, pushUUIDStore pushuuid.PushUUIDStore, pushClient *notification.Client) *InternalAPIServer {
	r := gin.New()

	return &InternalAPIServer{
		router:        r,
		dbConn:        db,
		pushUUIDStore: pushUUIDStore,
		pushAPIClient: pushClient,
	}
}
