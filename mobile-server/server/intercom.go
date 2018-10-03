package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
)

func (s *Server) intercomWebhook(c *gin.Context) {
	header := c.Request.Header
	log.Debug("Intercom request header: ", header)

	var req map[string]interface{}
	if err := c.BindJSON(&req); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusBadRequest, errorInternalServer)
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
