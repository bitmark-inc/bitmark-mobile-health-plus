package server

import (
	"net/http"

	"github.com/bitmark-inc/mobile-app/mobile-server/store/bitmarkstore"

	"github.com/gin-gonic/gin"
)

func (s *Server) addFeedback(c *gin.Context) {
	app := c.Param("app")
	account := c.GetString("requester")
	feedbackApp := bitmarkstore.FeedbackApp(app)

	if feedbackApp != bitmarkstore.Health && feedbackApp != bitmarkstore.HealthPlus && feedbackApp != bitmarkstore.Registry {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid app"})
		return
	}

	var req struct {
		Feedback map[string]interface{} `json:"feedback"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "cannot parse request"})
		return
	}

	if err := s.bitmarkStore.AddFeedback(c.Copy(), account, feedbackApp, s.conf.Feedback.Version, req.Feedback); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "cannot parse request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (s *Server) getCurrentFeedbackVersion(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"version": s.conf.Feedback.Version})
}
