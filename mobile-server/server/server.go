package server

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx"

	"github.com/bitmark-inc/mobile-app/mobile-server/logmodule"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/pushstore"
)

type Server struct {
	router *gin.Engine

	dbConn *pgx.Conn

	// Stores
	pushStore pushstore.PushStore
}

func (s *Server) Run(addr string) error {
	r := s.router
	r.Use(logmodule.Ginrus("Mobile API"))

	api := r.Group("/api")

	pushUUIDs := api.Group("/push_uuids")
	pushUUIDs.Use(authenticate())
	{
		pushUUIDs.POST("", s.AddPushToken)
		pushUUIDs.DELETE("/:token", s.RemovePushToken)
	}

	notifications := api.Group("/notifications")
	notifications.Use(authenticate())
	{
		notifications.GET("", s.NotificationList)
	}

	return s.router.Run(addr)
}

func New(db *pgx.Conn) *Server {
	r := gin.New()

	store := pushstore.NewPGStore(db)

	return &Server{
		router:    r,
		dbConn:    db,
		pushStore: store,
	}
}
