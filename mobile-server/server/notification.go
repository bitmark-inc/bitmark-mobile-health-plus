package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (s *Server) NotificationList(c *gin.Context) {
	account := c.GetString("requester")
	items, err := s.pushStore.QueryPushItems(account)
	if err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"notifications": items})
}
