package server

import (
	"bytes"
	"net/http"

	"github.com/jackc/pgx"

	"github.com/bitmark-inc/mobile-app/mobile-server/store/bitmarkstore"
	"github.com/gin-gonic/gin"
	jsoniter "github.com/json-iterator/go"
)

var json = jsoniter.ConfigCompatibleWithStandardLibrary

func (s *Server) registerRenting(c *gin.Context) {
	account := c.GetString("requester")

	id, err := s.bitmarkStore.AddBitmarkRenting(c.Copy(), account)
	if err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": id})
}

func (s *Server) updateRentingReceiver(c *gin.Context) {
	account := c.GetString("requester")
	id := c.Param("id")

	sender, err := s.bitmarkStore.AddBitmarkRentingReceiver(c.Copy(), id, account)
	if err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	// Notify sender
	redisConn, err := s.redisPool.Dial()
	if err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	if sender == nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
			"error": "cannot find grantor with that id",
		})
		return
	}

	buf := &bytes.Buffer{}
	enc := json.NewEncoder(buf)
	if err := enc.Encode(map[string]string{
		"event":   "bitmarks_grant_access",
		"id":      id,
		"grantee": account,
	}); err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	_, err = redisConn.Do("PUBLISH", "id-"+*sender, buf.Bytes())
	if err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	c.JSON(http.StatusOK, gin.H{"sender": sender})
}

func (s *Server) queryRentingBitmark(c *gin.Context) {
	account := c.GetString("requester")

	sender, receiver, awaiting, err := s.bitmarkStore.QueryBitmarkRenting(c.Copy(), account)
	if err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"granting_to":      sender,
		"granting_from":    receiver,
		"granting_waiting": awaiting,
	})
}

func (s *Server) revokeRentingBitmartk(c *gin.Context) {
	account := c.GetString("requester")
	id := c.Param("id")

	if err := s.bitmarkStore.DeleteBitmarkRenting(c.Copy(), id, account); err != nil {
		if err == pgx.ErrNoRows {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error": "invalid id or id does not belong to account",
			})
			return
		} else {
			c.Error(err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ok",
	})
}

func (s *Server) updateRenting(c *gin.Context) {
	account := c.GetString("requester")
	id := c.Param("id")

	var req struct {
		UpdateGrantee bool   `json:"update_grantee"`
		Status        string `json:"status"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	response := make(map[string]interface{})

	if req.UpdateGrantee {
		sender, err := s.bitmarkStore.AddBitmarkRentingReceiver(c.Copy(), id, account)
		if err != nil {
			c.Error(err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		// Notify sender
		redisConn, err := s.redisPool.Dial()
		if err != nil {
			c.Error(err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		if sender == nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
				"error": "cannot find grantor with that id",
			})
			return
		}

		buf := &bytes.Buffer{}
		enc := json.NewEncoder(buf)
		if err := enc.Encode(map[string]string{
			"event":   "bitmarks_grant_access",
			"id":      id,
			"grantee": account,
		}); err != nil {
			c.Error(err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		_, err = redisConn.Do("PUBLISH", "id-"+*sender, buf.Bytes())
		if err != nil {
			c.Error(err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		response["sender"] = sender

	}

	if len(req.Status) > 0 {
		status := bitmarkstore.BitmarkRentingStatus(req.Status)
		if status != bitmarkstore.RentingCompleted {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid status"})
		}

		if err := s.bitmarkStore.UpdateBitmarkRentingStatus(c.Copy(), id, status); err != nil {
			c.Error(err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		response["status"] = status
	}

	c.JSON(http.StatusOK, response)
}
