package internalapi

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/bitmark-inc/mobile-app/mobile-server/external/gorush"
	"github.com/bitmark-inc/mobile-app/mobile-server/logmodule"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/bitmarkstore"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/pushstore"
)

type InternalAPIServer struct {
	router *gin.Engine
	server *http.Server

	// Stores
	pushStore    pushstore.PushStore
	bitmarkStore bitmarkstore.BitmarkStore

	// External API
	pushAPIClient *gorush.Client
}

func (s *InternalAPIServer) Run(addr string) error {
	r := s.router
	r.Use(logmodule.Ginrus("Internal API"))

	api := r.Group("/api")

	pushNotification := api.Group("/push_notifications")
	pushNotification.POST("", s.PushNotification)

	trackingBitmarks := api.Group("/tracking_bitmarks")
	trackingBitmarks.GET("", s.ListBitmarkTracking)
	trackingBitmarks.Use(authenticate())
	{
		trackingBitmarks.POST("", s.AddBitmarkTracking)
	}

	srv := &http.Server{
		Addr:    addr,
		Handler: s.router,
	}

	s.server = srv

	return srv.ListenAndServe()
}

func (s *InternalAPIServer) Shutdown(ctx context.Context) error {
	return s.server.Shutdown(ctx)
}

func New(pushStore pushstore.PushStore, bitmarkStore bitmarkstore.BitmarkStore, pushClient *gorush.Client) *InternalAPIServer {
	r := gin.New()

	return &InternalAPIServer{
		router:        r,
		pushStore:     pushStore,
		bitmarkStore:  bitmarkStore,
		pushAPIClient: pushClient,
	}
}
