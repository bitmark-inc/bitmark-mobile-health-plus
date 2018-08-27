package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (s *Server) GetSupportedVersion(c *gin.Context) {
	appName := c.Param("app")

	supportedVersion, ok := s.conf.SupportedVersion[appName]
	if !ok {
		c.AbortWithStatusJSON(http.StatusNotFound, gin.H{
			"error": "invalid app name",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"version": supportedVersion})
}