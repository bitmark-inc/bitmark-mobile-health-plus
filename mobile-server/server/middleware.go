package server

import (
	"encoding/hex"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/bitmark-inc/mobile-app/mobile-server/util"
	jwt "github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"golang.org/x/crypto/ed25519"
)

func (s *Server) authenticate() gin.HandlerFunc {
	return func(c *gin.Context) {
		timestamp := c.Request.Header.Get("timestamp")
		signature := c.Request.Header.Get("signature")
		requester := c.Request.Header.Get("requester")

		pubkey, err := util.PublicKeyFromAccount(requester)
		if err != nil {
			c.AbortWithStatusJSON(401, gin.H{"message": "invalid bitmark account number"})
			return
		}

		sig, err := hex.DecodeString(signature)
		if err != nil || !ed25519.Verify(pubkey, []byte(timestamp), sig) {
			c.AbortWithStatusJSON(401, gin.H{"message": "invalid signature"})
			return
		}

		t, err := strconv.ParseInt(timestamp, 10, 64)
		if err != nil {
			c.AbortWithStatusJSON(401, gin.H{"message": "invalid timestamp"})
			return
		}

		created := time.Unix(0, t*1000000)
		now := time.Unix(0, time.Now().UnixNano())
		duration := now.Sub(created)
		if duration.Seconds() > float64(60) {
			c.AbortWithStatusJSON(401, gin.H{"message": "request expired"})
			return
		}

		c.Set("requester", requester)
	}
}

func (s *Server) authenticateJWT() gin.HandlerFunc {
	return func(c *gin.Context) {
		authorization := c.GetHeader("Authorization")
		if len(authorization) == 0 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "no authorization header found"})
			return
		}

		authParts := strings.Split(authorization, " ")
		if len(authParts) != 2 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "invalid authorization format, should be Authorization:Bearer XXX_TOKEN_XXX"})
			return
		}

		if authParts[0] != "Bearer" || len(authParts[1]) == 0 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "invalid authorization format, should be Authorization:Bearer XXX_TOKEN_XXX"})
			return
		}

		tokenString := authParts[1]
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Don't forget to validate the alg is what you expect:
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
			}

			secretByte, _ := hex.DecodeString(s.conf.JWT.SecretKey)

			return secretByte, nil
		})
		if err != nil {
			c.Error(err)
			c.AbortWithStatusJSON(401, gin.H{"message": "invalid authorization signature"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "cannot parse authorization"})
			return
		}

		if !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "invalid authorization"})
			return
		}

		if !claims.VerifyExpiresAt(time.Now().Unix(), true) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "authorization expired"})
			return
		}

		if !claims.VerifyNotBefore(time.Now().Unix(), false) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "authorization not before"})
			return
		}

		requester, ok := claims["aud"]
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "invalid authorization audience"})
			return
		}

		jwtID, ok := claims["jti"]
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "invalid authorization jti"})
			return
		}

		c.Set("requester", requester)
		c.Set("jwtid", jwtID)
	}
}

// TODO: Remove this method when migration is done.
func (s *Server) authenticateBoth() gin.HandlerFunc {
	return func(c *gin.Context) {
		timestamp := c.Request.Header.Get("timestamp")
		signature := c.Request.Header.Get("signature")
		requester := c.Request.Header.Get("requester")
		authorization := c.GetHeader("Authorization")

		if len(authorization) > 0 {
			log.Debug("Authenticate using JWT")
			authParts := strings.Split(authorization, " ")
			if len(authParts) != 2 {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "invalid authorization format, should be Authorization:Bearer XXX_TOKEN_XXX"})
				return
			}

			if authParts[0] != "Bearer" || len(authParts[1]) == 0 {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "invalid authorization format, should be Authorization:Bearer XXX_TOKEN_XXX"})
				return
			}

			tokenString := authParts[1]
			token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
				// Don't forget to validate the alg is what you expect:
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
				}

				secretByte, _ := hex.DecodeString(s.conf.JWT.SecretKey)

				return secretByte, nil
			})
			if err != nil {
				c.Error(err)
				c.AbortWithStatusJSON(401, gin.H{"message": "invalid authorization signature"})
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "cannot parse authorization"})
				return
			}

			if !token.Valid {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "invalid authorization"})
				return
			}

			if !claims.VerifyExpiresAt(time.Now().Unix(), true) {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "authorization expired"})
				return
			}

			if !claims.VerifyNotBefore(time.Now().Unix(), false) {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "authorization not before"})
				return
			}

			requester, ok := claims["aud"]
			if !ok {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "invalid authorization audience"})
				return
			}

			log.Debug("Requester:", requester)
			c.Set("requester", requester)
		} else {
			log.Debug("Authenticate using tranditional way")
			pubkey, err := util.PublicKeyFromAccount(requester)
			if err != nil {
				c.AbortWithStatusJSON(401, gin.H{"message": "invalid bitmark account number"})
				return
			}

			sig, err := hex.DecodeString(signature)
			if err != nil || !ed25519.Verify(pubkey, []byte(timestamp), sig) {
				c.AbortWithStatusJSON(401, gin.H{"message": "invalid signature"})
				return
			}

			t, err := strconv.ParseInt(timestamp, 10, 64)
			if err != nil {
				c.AbortWithStatusJSON(401, gin.H{"message": "invalid timestamp"})
				return
			}

			created := time.Unix(0, t*1000000)
			now := time.Unix(0, time.Now().UnixNano())
			duration := now.Sub(created)
			if duration.Seconds() > float64(60) {
				c.AbortWithStatusJSON(401, gin.H{"message": "request expired"})
				return
			}

			log.Debug("Requester:", requester)
			c.Set("requester", requester)
		}
	}
}
