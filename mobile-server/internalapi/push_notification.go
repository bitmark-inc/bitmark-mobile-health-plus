package internalapi

import (
	"net/http"

	"github.com/bitmark-inc/mobile-app/mobile-server/pushnotification"
	"github.com/gin-gonic/gin"
)

func (s *InternalAPIServer) PushNotification(c *gin.Context) {
	var req struct {
		Account string                  `json:"account"`
		Title   string                  `json:"title,omitempty"`
		Message string                  `json:"message"`
		Data    *map[string]interface{} `json:"data"`
		Source  string                  `json:"source"`
		Pinned  bool                    `json:"pinned"`
		Silent  bool                    `json:"silent"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	receivers, err := s.pushStore.QueryPushTokens(req.Account)
	if err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	if len(receivers) == 0 {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusOK, gin.H{"message": "account does not register push uuid"})
		return
	}

	if err := pushnotification.Push(&pushnotification.PushInfo{
		Account: req.Account,
		Title:   req.Title,
		Message: req.Message,
		Data:    req.Data,
		Pinned:  req.Pinned,
		Source:  req.Source,
		Silent:  req.Silent,
	}, s.pushStore, s.pushAPIClient); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusBadGateway, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}
