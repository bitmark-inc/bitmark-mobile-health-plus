package server

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gomodule/redigo/redis"
	influx "github.com/influxdata/influxdb/client/v2"
	"github.com/jackc/pgx"
	log "github.com/sirupsen/logrus"

	"github.com/bitmark-inc/mobile-app/mobile-server/config"
	"github.com/bitmark-inc/mobile-app/mobile-server/external/gateway"
	"github.com/bitmark-inc/mobile-app/mobile-server/logmodule"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/bitmarkstore"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/pushstore"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/websocketstore"
)

type Server struct {
	router *gin.Engine
	server *http.Server

	// DB instance
	dbConn          *pgx.ConnPool
	redisPool       *redis.Pool
	redisPubSubConn *redis.PubSubConn
	wsConnStore     *websocketstore.WSStore
	influxDBClient  influx.Client
	gatewayClient   *gateway.Client

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
	pushUUIDs.Use(s.authenticateBoth())
	{
		pushUUIDs.POST("", s.AddPushToken)
		pushUUIDs.DELETE("/:token", s.RemovePushToken)
	}

	trackingBitmarks := api.Group("/tracking_bitmarks")
	trackingBitmarks.GET("", s.ListBitmarkTracking)
	trackingBitmarks.Use(s.authenticateBoth())
	{
		trackingBitmarks.POST("", s.AddBitmarkTracking)
		trackingBitmarks.DELETE("/:bitmarkid", s.DeleteBitmarkTracking)
	}

	notifications := api.Group("/notifications")
	notifications.Use(s.authenticateBoth())
	{
		notifications.GET("", s.NotificationList)
	}

	api.POST("/metrics", s.AddMetrics)

	eventsGroup := api.Group("/events")
	eventsGroup.Use(s.authenticateBoth())
	{
		eventsGroup.POST("/register-account", s.AddRegisterAccountEvent)
	}

	grantingBitmarksGroup := api.Group("/granting_bitmarks")
	grantingBitmarksGroup.Use(s.authenticateJWT())
	{
		grantingBitmarksGroup.POST("", s.registerRenting)
		grantingBitmarksGroup.PATCH("/:id", s.updateRenting)
		grantingBitmarksGroup.GET("", s.queryRentingBitmark)
		grantingBitmarksGroup.DELETE("/:id", s.revokeRentingBitmartk)
	}

	accountGroup := api.Group("/accounts")
	accountGroup.Use(s.authenticateJWT())
	{
		accountGroup.DELETE("", s.deleteAccount)
	}

	api.GET("/healthz", s.HealthCheck)

	api.GET("/app-versions/:app", s.GetSupportedVersion)

	api.POST("/auth", s.RequestJWT)

	issueRequestGroup := api.Group("/issue_requests")
	issueRequestGroup.Use(s.authenticateJWT())
	{
		issueRequestGroup.POST("", s.uploadAssetForIssueRequest)
		issueRequestGroup.GET("/:id/download", s.downloadAsset)
		issueRequestGroup.DELETE("/:id", s.deleteIssueRequest)
		issueRequestGroup.GET("", s.queryIssueRequest)
	}

	feedbackGroup := api.Group("/feedbacks")
	feedbackGroup.Use(s.authenticateJWT())
	{
		feedbackGroup.POST("/:app", s.addFeedback)
		feedbackGroup.GET("/version", s.getCurrentFeedbackVersion)
	}

	r.Use(s.authenticateJWT()).GET("/ws", s.ServeWs)

	srv := &http.Server{
		Addr:    addr,
		Handler: s.router,
	}

	s.server = srv

	return srv.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	s.wsConnStore.DropAll(s.redisPubSubConn)
	s.redisPubSubConn.Close()
	return s.server.Shutdown(ctx)
}

func New(conf *config.Configuration, pushStore pushstore.PushStore, bitmarkStore bitmarkstore.BitmarkStore, dbConn *pgx.ConnPool, redisPool *redis.Pool, influxClient influx.Client, gatewayClient *gateway.Client) *Server {
	r := gin.New()
	wsConnStore := websocketstore.NewStore()
	redisConn, err := redisPool.Dial()
	if err != nil {
		log.Panic(err)
	}
	psc := &redis.PubSubConn{
		Conn: redisConn,
	}

	return &Server{
		router:          r,
		pushStore:       pushStore,
		bitmarkStore:    bitmarkStore,
		dbConn:          dbConn,
		redisPool:       redisPool,
		redisPubSubConn: psc,
		wsConnStore:     wsConnStore,
		influxDBClient:  influxClient,
		gatewayClient:   gatewayClient,
		conf:            conf,
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
