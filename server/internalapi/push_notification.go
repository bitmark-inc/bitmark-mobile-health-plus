package internalapi

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (s *InternalAPIServer) PushNotification(c *gin.Context) {
	var req struct {
		Account string                 `json:"account"`
		Titlle  string                 `json:"title,omitempty"`
		Message string                 `json:"message"`
		Data    map[string]interface{} `json:"data,omitempty"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	tokens, err := s.pushUUIDStore.QueryPushTokens(req.Account)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
	}

	if err := s.pushAPIClient.Send(req.Titlle, req.Message, tokens, req.Data); err != nil {
		c.AbortWithStatusJSON(http.StatusBadGateway, gin.H{"message": err.Error()})
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}
