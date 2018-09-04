package server

import (
	"encoding/hex"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
)

func (s *Server) RequestJWT(c *gin.Context) {
	var req struct {
		Timestamp string `json:"timestamp"`
		Signature string `json:"signature"`
		Requester string `json:"requester"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	// pubkey, err := util.PublicKeyFromAccount(req.Requester)
	// if err != nil {
	// 	c.AbortWithStatusJSON(401, gin.H{"message": "invalid bitmark account number"})
	// 	return
	// }

	// sig, err := hex.DecodeString(req.Signature)
	// if err != nil || !ed25519.Verify(pubkey, []byte(req.Timestamp), sig) {
	// 	c.AbortWithStatusJSON(401, gin.H{"message": "invalid signature"})
	// 	return
	// }

	// t, err := strconv.ParseInt(req.Timestamp, 10, 64)
	// if err != nil {
	// 	c.AbortWithStatusJSON(401, gin.H{"message": "invalid timestamp"})
	// 	return
	// }

	// created := time.Unix(0, t*1000000)
	now := time.Unix(0, time.Now().UnixNano())
	// duration := now.Sub(created)
	// if duration.Seconds() > float64(60) {
	// 	c.AbortWithStatusJSON(401, gin.H{"message": "request expired"})
	// 	return
	// }

	exp := now.Add(time.Duration(s.conf.JWT.Expire) * time.Hour)

	// Create a new token object, specifying signing method and the claims
	// you would like it to contain.
	token := jwt.NewWithClaims(jwt.SigningMethodHS384, jwt.MapClaims{
		"aud": req.Requester,
		"exp": exp.Unix(),
		// "nbf": created.Unix(),
		"iat": now.Unix(),
		"jti": uuid.NewV4().String(),
	})

	secretByte, _ := hex.DecodeString(s.conf.JWT.SecretKey)
	tokenString, err := token.SignedString(secretByte)
	if err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": "cannot create jwt"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"jwt_token": tokenString,
	})
}
