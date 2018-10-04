package server

import (
	"fmt"
	"io"
	"net/http"

	"github.com/jackc/pgx"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/bitmark-inc/mobile-app/mobile-server/pushnotification"
	"github.com/bitmark-inc/mobile-app/mobile-server/util"
	"github.com/gin-gonic/gin"
	"github.com/satori/go.uuid"
	log "github.com/sirupsen/logrus"
)

func (s *Server) uploadAssetForIssueRequest(c *gin.Context) {
	// bitmark info
	account := c.GetString("requester")

	issuer := c.PostForm("issuer")
	assetName := c.PostForm("asset_name")
	assetMetadataString := c.PostForm("asset_metadata")

	if len(issuer) == 0 || len(assetName) == 0 {
		c.AbortWithStatusJSON(http.StatusBadRequest, errorInvalidParameters)
		return
	}

	var assetMetadata map[string]string
	if len(assetMetadataString) > 0 {
		if err := json.UnmarshalFromString(assetMetadataString, &assetMetadata); err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, errorInvalidParameters)
			return
		}
	}

	// prepare file reader
	header, err := c.FormFile("file")
	if err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusBadRequest, errorInvalidFileParameters)
		return
	}

	file, err := header.Open()
	if err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusBadRequest, errorInvalidFileParameters)
		return
	}

	token := uuid.NewV4().String()
	assetDir := "mobile_issuance/" + token

	defer func() {
		file.Close()
	}()

	conf := aws.Config{Region: aws.String(s.conf.FileUpload.S3Region)}
	sess := session.New(&conf)
	svc := s3manager.NewUploader(sess)

	_, err = svc.Upload(&s3manager.UploadInput{
		Bucket: aws.String(s.conf.FileUpload.S3Bucket),
		Key:    aws.String(assetDir),
		Body:   file,
		Metadata: map[string]*string{
			"filename": aws.String(header.Filename),
		},
	})
	if err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusBadGateway, errorInvalidFileParameters)
		return
	}

	if err := s.bitmarkStore.AddIssueRequest(c.Copy(), token, account, issuer, assetName, header.Filename, assetMetadata); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, errorInternalServer)
		return
	}

	// Notify receiver
	go pushnotification.PushByAccount(c.Copy(), issuer, &pushnotification.PushInfo{
		Title:   "Issue request",
		Message: fmt.Sprintf("%s has added a new health record to your account. Please examine the record and sign to claim ownership.", util.ShortenAccountNumber(account)),
		Data: &map[string]interface{}{
			"event":      "issue_request",
			"registrant": account,
		},
	}, s.pushStore, s.pushAPIClient)

	c.JSON(http.StatusOK, gin.H{"status": "ok"})

}

func (s *Server) downloadAsset(c *gin.Context) {
	token := c.Param("id")

	key := aws.String("mobile_issuance/" + token)

	conf := aws.Config{Region: aws.String(s.conf.FileUpload.S3Region)}
	sess := session.New(&conf)

	downloadsvc := s3manager.NewDownloader(sess)
	buff := &aws.WriteAtBuffer{}
	_, err := downloadsvc.Download(buff, &s3.GetObjectInput{
		Bucket: aws.String(s.conf.FileUpload.S3Bucket),
		Key:    key,
	})

	if err != nil {
		log.Error(err)
		c.AbortWithStatusJSON(http.StatusBadGateway, errorInternalServer)
		return
	}

	c.Stream(func(w io.Writer) bool {
		w.Write(buff.Bytes())
		return true
	})
}

func (s *Server) deleteIssueRequest(c *gin.Context) {
	token := c.Param("token")
	account := c.GetString("requester")

	if err := s.bitmarkStore.RemoveIssueRequest(c.Copy(), token, account); err != nil {
		if err == pgx.ErrNoRows {
			c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": "invalid token"})
		} else {
			c.Error(err)
			c.AbortWithStatusJSON(http.StatusInternalServerError, errorInternalServer)
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})
}

func (s *Server) queryIssueRequest(c *gin.Context) {
	account := c.GetString("requester")

	issueRequests, err := s.bitmarkStore.QueryIssueRequest(c.Copy(), account)
	if err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, errorInternalServer)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"issue_requests": issueRequests,
	})
}
