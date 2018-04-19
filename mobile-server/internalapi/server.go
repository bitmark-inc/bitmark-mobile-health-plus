package internalapi

import (
	"github.com/gin-gonic/gin"

	"github.com/bitmark-inc/mobile-app/mobile-server/external/gorush"
	"github.com/bitmark-inc/mobile-app/mobile-server/logmodule"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/pushstore"
)

type InternalAPIServer struct {
	router *gin.Engine

	// Stores
	pushStore pushstore.PushStore

	// External API
	pushAPIClient *gorush.Client
}

func (s *InternalAPIServer) Run(addr string) error {
	r := s.router
	r.Use(logmodule.Ginrus("Internal API"))

	api := r.Group("/api")

	pushNotification := api.Group("/push_notifications")
	pushNotification.POST("", s.PushNotification)

	return s.router.Run(addr)
}

func New(pushStore pushstore.PushStore, pushClient *gorush.Client) *InternalAPIServer {
	r := gin.New()

	return &InternalAPIServer{
		router:        r,
		pushStore:     pushStore,
		pushAPIClient: pushClient,
	}
}
