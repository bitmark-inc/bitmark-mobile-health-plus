package internalapi

import (
	"github.com/gin-gonic/gin"
)

func authenticate() gin.HandlerFunc {
	return func(c *gin.Context) {
		requester := c.Request.Header.Get("requester")

		if len(requester) == 0 {
			c.AbortWithStatusJSON(401, gin.H{"message": "requester is required"})
			return
		}

		c.Set("requester", requester)
	}
}
