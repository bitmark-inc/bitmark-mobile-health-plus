package server

import (
	"bytes"
	"net/http"

	"github.com/jackc/pgx"

	"github.com/bitmark-inc/mobile-app/mobile-server/store/bitmarkstore"
	"github.com/gin-gonic/gin"
	jsoniter "github.com/json-iterator/go"
	log "github.com/sirupsen/logrus"
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
		c.AbortWithStatusJSON(http.StatusBadRequest, errorInvalidParameters)
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

	_, err = redisConn.Do("PUBLISH", "ac-"+*sender, buf.Bytes())
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
		"granted_to":   sender,
		"granted_from": receiver,
		"waiting":      awaiting,
	})
}

func (s *Server) revokeRentingBitmartk(c *gin.Context) {
	account := c.GetString("requester")
	id := c.Param("id")

	if err := s.bitmarkStore.DeleteBitmarkRenting(c.Copy(), id, account); err != nil {
		if err == pgx.ErrNoRows {
			c.AbortWithStatusJSON(http.StatusBadRequest, errorNoItems)
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
		c.AbortWithStatusJSON(http.StatusBadRequest, errorInvalidParameters)
		return
	}

	response := make(map[string]interface{})

	if req.UpdateGrantee {
		log.Debug("Update grantee")
		sender, err := s.bitmarkStore.AddBitmarkRentingReceiver(c.Copy(), id, account)
		if err != nil {
			c.Error(err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		if sender == nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, errorNoItems)
			return
		}

		// Notify sender
		redisConn, err := s.redisPool.Dial()
		defer redisConn.Close()
		if err != nil {
			c.Error(err)
			c.AbortWithStatus(http.StatusInternalServerError)
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

		log.Debugf("Sending message to sender: %s", *sender)

		_, err = redisConn.Do("PUBLISH", "ac-"+*sender, buf.Bytes())
		if err != nil {
			c.Error(err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		response["sender"] = sender

	}

	if len(req.Status) > 0 {
		log.Debug("Update status")
		status := bitmarkstore.BitmarkRentingStatus(req.Status)
		if status != bitmarkstore.RentingCompleted {
			c.AbortWithStatusJSON(http.StatusBadRequest, errorInvalidParameters)
			return
		}

		if err := s.bitmarkStore.UpdateBitmarkRentingStatus(c.Copy(), id, status); err != nil {
			if err == pgx.ErrNoRows {
				c.AbortWithStatusJSON(http.StatusBadRequest, errorNoItems)
				return
			} else {
				c.Error(err)
				c.AbortWithStatus(http.StatusInternalServerError)
				return
			}
		}

		response["status"] = status
	}

	c.JSON(http.StatusOK, response)
}
