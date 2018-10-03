package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (s *Server) NotificationList(c *gin.Context) {
	account := c.GetString("requester")
	items, err := s.pushStore.QueryPushItems(c, account)
	if err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, errorInternalServer)
		return
	}

	c.JSON(http.StatusOK, gin.H{"notifications": items})
}
