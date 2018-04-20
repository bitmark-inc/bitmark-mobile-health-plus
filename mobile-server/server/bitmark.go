package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (s *Server) AddBitmarkTracking(c *gin.Context) {
	var req struct {
		BitmarkID string `json:"bitmark_id"`
		TxID      string `json:"tx_id"`
		Status    string `json:"status"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	account := c.GetString("requester")
	if err := s.pushStore.AddAccount(account); err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	if err := s.bitmarkStore.AddTrackingBitmark(account, req.BitmarkID, req.TxID, req.Status); err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

func (s *Server) DeleteBitmarkTracking(c *gin.Context) {
	bitmarkID := c.Param("bitmarkid")

	account := c.GetString("requester")
	found, err := s.bitmarkStore.DeleteTrackingBitmark(account, bitmarkID)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	if !found {
		c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"message": "not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

func (s *Server) ListBitmarkTracking(c *gin.Context) {
	account := c.GetString("requester")

	bitmarks, err := s.bitmarkStore.GetTrackingBitmarks(account)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"bitmarks": bitmarks})
}
