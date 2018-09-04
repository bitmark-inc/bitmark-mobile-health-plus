package websocketstore

import (
	"sync"

	"github.com/gomodule/redigo/redis"
	"github.com/gorilla/websocket"
	log "github.com/sirupsen/logrus"
)

type WSConn struct {
	ID      string
	Account string
	conn    *websocket.Conn
}
type WSStore struct {
	Conns []*WSConn
	sync.Mutex
}

func NewStore() *WSStore {
	return &WSStore{
		Conns: make([]*WSConn, 0),
	}
}

func (s *WSStore) NewConn(connID, account string, conn *websocket.Conn) *WSConn {
	c := &WSConn{
		ID:      connID,
		Account: account,
		conn:    conn,
	}
	s.Lock()
	defer s.Unlock()
	s.Conns = append(s.Conns, c)
	return c
}

func (s *WSStore) DropConn(id string, psc *redis.PubSubConn) {
	for i := len(s.Conns) - 1; i >= 0; i-- {
		c := s.Conns[i]
		if c.ID == id {
			if err := psc.Unsubscribe("id-"+c.ID, "ac-"+c.Account); err != nil {
				log.Error(err)
			}
			if err := c.conn.Close(); err != nil {
				log.Error(err)
			}
			s.Conns = append(s.Conns[:i], s.Conns[i+1:]...)
		}
	}
}

// DropAll drop all active connections and unsubscribe redis
func (s *WSStore) DropAll(psc *redis.PubSubConn) {
	for _, c := range s.Conns {
		if err := psc.Unsubscribe("id-"+c.ID, "ac-"+c.Account); err != nil {
			log.Error(err)
		}
		if err := c.conn.Close(); err != nil {
			log.Error(err)
		}
	}

	s.Conns = s.Conns[:0]
}

func (s *WSStore) DispatchMessageToId(id string, data []byte) {
	for _, c := range s.Conns {
		if c.ID == id {
			log.Debug("Deliver message to id:", id)
			c.conn.WriteMessage(websocket.TextMessage, data)
			return
		}
	}
}

func (s *WSStore) DispatchMessageToAccount(account string, data []byte) {
	for _, c := range s.Conns {
		if c.Account == account {
			log.Debug("Deliver message to account:", account)
			c.conn.WriteMessage(websocket.TextMessage, data)
		}
	}
}
