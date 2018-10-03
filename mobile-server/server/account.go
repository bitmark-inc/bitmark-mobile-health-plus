package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (s *Server) deleteAccount(c *gin.Context) {
	account := c.GetString("requester")

	if err := s.bitmarkStore.DeleteBitmarkRentingByAccount(c.Copy(), account); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, errorDeleteAccountRenting)
		return
	}

	if err := s.bitmarkStore.DeleteTrackingBitmarkByAccount(c.Copy(), account); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, errorDeleteAccountTracking)
		return
	}

	if err := s.pushStore.RemovePushTokenByAccount(c.Copy(), account); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, errorDeleteAccountPushToken)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ok",
	})
}
