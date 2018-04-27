package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// AddPushToken will add the push notification token
// from mobile app
func (s *Server) AddPushToken(c *gin.Context) {
	var req struct {
		Token    string `json:"token"`
		Platform string `json:"platform"`
		Client   string `json:"client"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.Error(err)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	account := c.GetString("requester")
	if err := s.pushStore.AddPushToken(account, req.Token, req.Platform, req.Client); err != nil {
		c.Error(err)
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

// RemovePushToken will remove the push notification token
// from mobile app
func (s *Server) RemovePushToken(c *gin.Context) {
	pushToken := c.Param("token")

	account := c.GetString("requester")
	success, err := s.pushStore.RemovePushToken(account, pushToken)
	if err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	if success == false {
		c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"message": "push token is not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}
