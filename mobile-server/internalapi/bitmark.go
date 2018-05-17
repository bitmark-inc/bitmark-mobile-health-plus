package internalapi

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (s *InternalAPIServer) AddBitmarkTracking(c *gin.Context) {
	var req struct {
		BitmarkID string `json:"bitmark_id"`
		TxID      string `json:"tx_id"`
		Status    string `json:"status"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	account := c.GetString("requester")
	if err := s.pushStore.AddAccount(c, account); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	if err := s.bitmarkStore.AddTrackingBitmark(c, account, req.BitmarkID, req.TxID, req.Status); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

func (s *InternalAPIServer) ListBitmarkTracking(c *gin.Context) {
	account := c.Request.Header.Get("requester")

	bitmarks, err := s.bitmarkStore.GetTrackingBitmarks(c, account)
	if err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"bitmarks": bitmarks})
}
