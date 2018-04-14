package server

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx"

	"github.com/bitmark-inc/mobile-app/server/logmodule"
	"github.com/bitmark-inc/mobile-app/server/store/pushuuid"
)

type Server struct {
	router *gin.Engine

	dbConn *pgx.Conn

	// Stores
	pushUUIDStore pushuuid.PushUUIDStore
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

	return s.router.Run(addr)
}

func New(db *pgx.Conn) *Server {
	r := gin.New()

	pushUUIDPGStore := pushuuid.NewPGStore(db)

	return &Server{
		router:        r,
		dbConn:        db,
		pushUUIDStore: pushUUIDPGStore,
	}
}
