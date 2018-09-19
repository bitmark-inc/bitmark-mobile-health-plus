package server

import (
	"io"
	"net/http"

	"github.com/jackc/pgx"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
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
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid parameters"})
		return
	}

	var assetMetadata map[string]string
	if len(assetMetadataString) > 0 {
		if err := json.UnmarshalFromString(assetMetadataString, &assetMetadata); err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid metadata"})
			return
		}
	}

	// prepare file reader
	header, err := c.FormFile("file")
	if err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "No file found"})
		return
	}

	file, err := header.Open()
	if err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Unable to read file"})
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
		c.AbortWithStatusJSON(http.StatusBadGateway, gin.H{"error": "Unable to upload file"})
		return
	}

	if err := s.bitmarkStore.AddIssueRequest(c.Copy(), token, account, issuer, assetName, header.Filename, assetMetadata); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Fail to add asset"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (s *Server) downloadAsset(c *gin.Context) {
	token := c.Param("token")

	key := aws.String("mobile_issuance/" + token)

	conf := aws.Config{Region: aws.String(s.conf.FileUpload.S3Region)}
	sess := session.New(&conf)

	c.Stream(func(w io.Writer) bool {
		downloadsvc := s3manager.NewDownloader(sess)
		buff := &aws.WriteAtBuffer{}
		_, err := downloadsvc.Download(buff, &s3.GetObjectInput{
			Bucket: aws.String(s.conf.FileUpload.S3Bucket),
			Key:    key,
		})

		if err != nil {
			log.Error(err)
		}
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
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "cannot query asset info"})
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
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Unable to query issue request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"issue_requests": issueRequests,
	})
}