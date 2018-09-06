package server

import (
	"bytes"
	"net/http"

	"github.com/jackc/pgx"

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

	sender, err := s.bitmarkStore.UpdateReceiverBitmarkRenting(c.Copy(), id, account)
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

	_, err = redisConn.Do("PUBLISH", "ac-"+account, buf.Bytes())
	if err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	c.JSON(http.StatusOK, gin.H{"sender": sender})
}

func (s *Server) queryRentingBitmark(c *gin.Context) {
	account := c.GetString("requester")

	sender, receiver, err := s.bitmarkStore.QueryBitmarkRenting(c.Copy(), account)
	if err != nil {
		c.Error(err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"granting":   sender,
		"is_granted": receiver,
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
