package server

import (
	"github.com/gin-gonic/gin"
)

func authenticate() gin.HandlerFunc {
	return func(c *gin.Context) {
		// timestamp := c.Request.Header.Get("timestamp")
		// signature := c.Request.Header.Get("signature")
		requester := c.Request.Header.Get("requester")

		// pubkey, err := util.PublicKeyFromAccount(requester)
		// if err != nil {
		// 	c.AbortWithStatusJSON(401, gin.H{"message": "invalid bitmark account number"})
		// 	return
		// }

		// sig, err := hex.DecodeString(signature)
		// if err != nil || !ed25519.Verify(pubkey, []byte(timestamp), sig) {
		// 	c.AbortWithStatusJSON(401, gin.H{"message": "invalid signature"})
		// 	return
		// }

		// t, err := strconv.ParseInt(timestamp, 10, 64)
		// if err != nil {
		// 	c.AbortWithStatusJSON(401, gin.H{"message": "invalid timestamp"})
		// 	return
		// }

		// created := time.Unix(0, t*1000000)
		// now := time.Unix(0, time.Now().UnixNano())
		// duration := now.Sub(created)
		// if duration.Seconds() > float64(60) {
		// 	c.AbortWithStatusJSON(401, gin.H{"message": "request expired"})
		// 	return
		// }

		c.Set("requester", requester)
	}
}
