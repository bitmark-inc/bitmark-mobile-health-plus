package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gomodule/redigo/redis"
	"github.com/gorilla/websocket"
	log "github.com/sirupsen/logrus"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (s *Server) ServeWs(c *gin.Context) {
	jwtid := c.GetString("jwtid")
	account := c.GetString("requester")
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.Error(err)
		return
	}

	ws.SetCloseHandler(func(code int, text string) error {
		s.wsConnStore.DropConn(jwtid, s.redisPubSubConn)
		return nil
	})

	log.Debugf("Subscribe to redis with account %s, id: %s", account, id)
	if err := s.redisPubSubConn.Subscribe("id-"+jwtid, "ac-"+account); err != nil {
		c.Error(err)
		ws.Close()
	}
	s.wsConnStore.NewConn(jwtid, account, ws)
}

func (s *Server) ProcessWSMessage() {
	for {
		switch v := s.redisPubSubConn.Receive().(type) {
		case redis.Message:
			log.Debugf("%s: message: %s\n", v.Channel, v.Data)
			s.dispatchWSMessage(v.Channel, v.Data)
		case redis.Subscription:
			log.Debugf("%s: %s %d\n", v.Channel, v.Kind, v.Count)
		case error:
			log.Error(v)
		}
	}
}

func (s *Server) dispatchWSMessage(channel string, data []byte) {
	if len(channel) <= 3 {
		log.Error("Invalid channel:", channel)
		return
	}

	left := channel[:3]
	right := channel[3:]

	if left == "id-" {
		s.wsConnStore.DispatchMessageToId(right, data)
	} else if left == "ac-" {
		s.wsConnStore.DispatchMessageToAccount(right, data)
	} else {
		log.Error("Invalid channel:", channel)
	}
}
