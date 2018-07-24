package server

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx"

	"github.com/bitmark-inc/mobile-app/mobile-server/logmodule"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/bitmarkstore"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/pushstore"
)

type Server struct {
	router *gin.Engine
	server *http.Server

	// DB instance
	dbConn *pgx.ConnPool

	// Stores
	pushStore    pushstore.PushStore
	bitmarkStore bitmarkstore.BitmarkStore
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

	trackingBitmarks := api.Group("/tracking_bitmarks")
	trackingBitmarks.GET("", s.ListBitmarkTracking)
	trackingBitmarks.Use(authenticate())
	{
		trackingBitmarks.POST("", s.AddBitmarkTracking)
		trackingBitmarks.DELETE("/:bitmarkid", s.DeleteBitmarkTracking)
	}

	notifications := api.Group("/notifications")
	notifications.Use(authenticate())
	{
		notifications.GET("", s.NotificationList)
	}

	api.GET("/healthz", s.HealthCheck)

	srv := &http.Server{
		Addr:    addr,
		Handler: s.router,
	}

	s.server = srv

	return srv.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	return s.server.Shutdown(ctx)
}

func New(pushStore pushstore.PushStore, bitmarkStore bitmarkstore.BitmarkStore, dbConn *pgx.ConnPool) *Server {
	r := gin.New()

	return &Server{
		router:       r,
		pushStore:    pushStore,
		bitmarkStore: bitmarkStore,
		dbConn:       dbConn,
	}
}

func (s *Server) HealthCheck(c *gin.Context) {
	conn, err := s.dbConn.Acquire()
	if err != nil {
		c.AbortWithStatusJSON(500, gin.H{
			"error": "Failed to connect to db.",
		})
		return
	}
	defer conn.Close()

	if err = conn.Ping(c); err != nil {
		c.AbortWithStatusJSON(500, gin.H{
			"error": "Failed to connect to db.",
		})
		return
	}

	c.JSON(200, gin.H{
		"status": "ok",
	})
}
