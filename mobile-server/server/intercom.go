package server

import (
	"net/http"

	"github.com/bitmark-inc/mobile-app/mobile-server/pushnotification"
	"github.com/gin-gonic/gin"
)

// A ConversationMessage is the message that started the conversation rendered for presentation
type intercomConversationMessage struct {
	Subject string `json:"subject"`
	Body    string `json:"body"`
	URL     string `json:"url"`
}

type intercomConversationParts struct {
	Parts      []intercomConversationPart `json:"conversation_parts"`
	TotalCount int                        `json:"total_count"`
}

// A ConversationPart is a Reply, Note, or Assignment to a Conversation
type intercomConversationPart struct {
	ID         string `json:"id"`
	PartType   string `json:"part_type"`
	Body       string `json:"body"`
	CreatedAt  int64  `json:"created_at"`
	UpdatedAt  int64  `json:"updated_at"`
	NotifiedAt int64  `json:"notified_at"`
}

type intercomUser struct {
	ID     string `json:"id,omitempty"`
	Email  string `json:"email,omitempty"`
	UserID string `json:"user_id,omitempty"`
	Name   string `json:"name,omitempty"`
}

func (s *Server) intercomWebhook(c *gin.Context) {
	var req struct {
		Data struct {
			Item struct {
				ID                  string                      `json:"id"`
				CreatedAt           int64                       `json:"created_at"`
				UpdatedAt           int64                       `json:"updated_at"`
				Open                bool                        `json:"open"`
				Read                bool                        `json:"read"`
				ConversationMessage intercomConversationMessage `json:"conversation_message"`
				ConversationParts   intercomConversationParts   `json:"conversation_parts"`
				User                intercomUser                `json:"user"`
			} `json:"item"`
			Type string `json:"notification_event_data"`
		} `json:"data"`
	}
	if err := c.BindJSON(&req); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusBadRequest, errorInternalServer)
		return
	}

	locKey := "intercom_new_messages"

	go pushnotification.PushByIntercomUserID(c.Copy(), req.Data.Item.User.UserID, &pushnotification.PushInfo{
		Title:   "",
		Message: "You have new messages from Bitmark support team. Tap to view.",
		Data: &map[string]interface{}{
			"event": "intercom_reply",
		},
		CollapseID: "intercom",
		LocKey:     locKey,
	}, s.pushStore, s.pushAPIClient)

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
