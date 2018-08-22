package server

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	influx "github.com/influxdata/influxdb/client/v2"
	"github.com/jackc/pgx"
	log "github.com/sirupsen/logrus"

	"github.com/bitmark-inc/mobile-app/mobile-server/config"
	"github.com/bitmark-inc/mobile-app/mobile-server/external/gateway"
	"github.com/bitmark-inc/mobile-app/mobile-server/logmodule"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/bitmarkstore"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/pushstore"
)

type Server struct {
	router *gin.Engine
	server *http.Server

	// DB instance
	dbConn         *pgx.ConnPool
	influxDBClient influx.Client
	gatewayClient  *gateway.Client

	// Stores
	pushStore    pushstore.PushStore
	bitmarkStore bitmarkstore.BitmarkStore

	conf *config.Configuration
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

	api.POST("/metrics", s.AddMetrics)

	eventsGroup := api.Group("/events")
	eventsGroup.Use(authenticate())
	{
		eventsGroup.POST("/register-account", s.AddRegisterAccountEvent)
	}

	api.GET("/healthz", s.HealthCheck)

	api.GET("/app-versions/:app", s.GetSupportedVersion)

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

func New(conf *config.Configuration, pushStore pushstore.PushStore, bitmarkStore bitmarkstore.BitmarkStore, dbConn *pgx.ConnPool, influxClient influx.Client, gatewayClient *gateway.Client) *Server {
	r := gin.New()

	return &Server{
		router:         r,
		pushStore:      pushStore,
		bitmarkStore:   bitmarkStore,
		dbConn:         dbConn,
		influxDBClient: influxClient,
		gatewayClient:  gatewayClient,
		conf:           conf,
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
	defer s.dbConn.Release(conn)

	ctx, cancel := context.WithTimeout(c, 2*time.Second)
	defer cancel()

	errChan := make(chan error)

	go func() {
		errChan <- conn.Ping(ctx)
	}()

	select {
	case <-ctx.Done():
		if ctx.Err() != nil {
			log.Error(ctx.Err())
			c.AbortWithStatusJSON(500, gin.H{
				"error": "Timeout connect to db.",
			})
			return
		}
	case err := <-errChan:
		if err != nil {
			c.AbortWithStatusJSON(500, gin.H{
				"error": "Failed to connect to db.",
			})
			return
		}
	}

	c.JSON(200, gin.H{
		"status": "ok",
	})
}
