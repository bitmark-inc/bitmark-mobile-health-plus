package server

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	influx "github.com/influxdata/influxdb/client/v2"
	log "github.com/sirupsen/logrus"
)

func (s *Server) AddMetrics(c *gin.Context) {
	var req struct {
		Metrics []struct {
			Tags   map[string]string      `json:"tags"`
			Fields map[string]interface{} `json:"fields"`
		} `json:"metrics"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	bp, err := influx.NewBatchPoints(influx.BatchPointsConfig{
		Database:  "bitmark",
		Precision: "s",
	})
	if err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, errorInternalServer)
		return
	}

	for _, metric := range req.Metrics {
		pt, err := influx.NewPoint("mobile-events", metric.Tags, metric.Fields, time.Now())
		if err != nil {
			c.Error(err)
			c.AbortWithStatusJSON(http.StatusInternalServerError, errorInternalServer)
			return
		}
		bp.AddPoint(pt)
	}

	if err := s.influxDBClient.Write(bp); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, errorInternalServer)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

func (s *Server) AddRegisterAccountEvent(c *gin.Context) {
	account := c.GetString("requester")

	log.Info("Register a new account:", account)
	if err := s.gatewayClient.RegisterAccount(c, account); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, errorInternalServer)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}
