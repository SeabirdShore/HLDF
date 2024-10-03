package main

import (
	"crypto/md5"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
	"github.com/hyperledger/fabric-sdk-go/pkg/client/channel"
	"github.com/hyperledger/fabric-sdk-go/pkg/core/config"
	"github.com/hyperledger/fabric-sdk-go/pkg/fabsdk"
)

// 定义结构体保存文件的哈希值
type Evidence struct {
	EvidenceID  string `json:"evidenceID"`
	Timestamp   string `json:"timestamp"`
	Collector   string `json:"collector"`
	MD5Hash     string `json:"md5Hash"`
	SHA1Hash    string `json:"sha1Hash"`
	SHA256Hash  string `json:"sha256Hash"`
	SHA512Hash  string `json:"sha512Hash"`
	Description string `json:"description"`
}

var (
	SDK           *fabsdk.FabricSDK
	channelClient *channel.Client
	channelName   = "mychannel"
	chaincodeName = "fdf"
	orgName       = "Org1"
	orgAdmin      = "Admin"
)

func ChannelExecute(funcName string, args [][]byte) (channel.Response, error) {
	configPath := "./config.yaml"
	configProvider := config.FromFile(configPath)
	var err error

	SDK, err = fabsdk.New(configProvider)
	if err != nil {
		log.Fatalf("Failed to create new SDK: %s", err)
	}

	ctx := SDK.ChannelContext(channelName, fabsdk.WithOrg(orgName), fabsdk.WithUser(orgAdmin))
	channelClient, err = channel.New(ctx)
	if err != nil {
		return channel.Response{}, err
	}

	response, err := channelClient.Execute(channel.Request{
		ChaincodeID: chaincodeName,
		Fcn:         funcName,
		Args:        args,
	})
	if err != nil {
		return response, err
	}

	SDK.Close()
	return response, nil
}

// 计算文件的哈希值
func calculateHashes(file *os.File) (string, string, string, string, error) {
	md5Hash := md5.New()
	sha1Hash := sha1.New()
	sha256Hash := sha256.New()
	sha512Hash := sha512.New()

	if _, err := io.Copy(io.MultiWriter(md5Hash, sha1Hash, sha256Hash, sha512Hash), file); err != nil {
		return "", "", "", "", err
	}

	return hex.EncodeToString(md5Hash.Sum(nil)),
		hex.EncodeToString(sha1Hash.Sum(nil)),
		hex.EncodeToString(sha256Hash.Sum(nil)),
		hex.EncodeToString(sha512Hash.Sum(nil)), nil
}

func main() {
	r := gin.Default()
	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000"}, // 前端的地址
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
	}))

	// 保存证据
	r.POST("/saveEvidence", func(c *gin.Context) {
		evidenceID := c.PostForm("evidenceID")
		timestamp := c.PostForm("timestamp")
		collector := c.PostForm("collector")
		description := c.PostForm("description")

		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "File upload failed"})
			return
		}

		src, err := file.Open()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to open file"})
			return
		}
		defer src.Close()

		tempFile, err := os.CreateTemp("", "uploaded-")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create temp file"})
			return
		}
		defer os.Remove(tempFile.Name())
		defer tempFile.Close()

		if _, err := io.Copy(tempFile, src); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
			return
		}

		tempFile, err = os.Open(tempFile.Name())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reopen file"})
			return
		}
		defer tempFile.Close()

		md5Hash, sha1Hash, sha256Hash, sha512Hash, err := calculateHashes(tempFile)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate hashes"})
			return
		}

		_, err = ChannelExecute("SaveEvidence", [][]byte{
			[]byte(evidenceID),
			[]byte(timestamp),
			[]byte(collector),
			[]byte(md5Hash),
			[]byte(sha1Hash),
			[]byte(sha256Hash),
			[]byte(sha512Hash),
			[]byte(description),
		})

		if err != nil {
			log.Fatalf("Failed to submit transaction: %s\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save evidence on blockchain"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"code":    "200",
			"message": "Evidence saved successfully!",
			"md5":     md5Hash,
			"sha1":    sha1Hash,
			"sha256":  sha256Hash,
			"sha512":  sha512Hash,
		})
	})

	// 查询最新版本证据
	r.GET("/queryEvidence/:evidenceID", func(c *gin.Context) {
		evidenceID := c.Param("evidenceID")
		response, err := ChannelExecute("QueryEvidence", [][]byte{[]byte(evidenceID)})

		if err != nil {
			log.Fatalf("Failed to evaluate transaction: %s\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query evidence"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"code":    "200",
			"message": "Query successful!",
			"result":  string(response.Payload),
		})
	})

	// 查询所有证据条目
	r.GET("/queryAllEvidence", func(c *gin.Context) {
		response, err := ChannelExecute("QueryAllEvidence", [][]byte{})

		if err != nil {
			log.Fatalf("Failed to evaluate transaction: %s\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query all evidence"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"code":    "200",
			"message": "Query successful!",
			"result":  string(response.Payload),
		})
	})

	// 查询证据历史版本
	r.GET("/queryEvidenceHistory/:evidenceID", func(c *gin.Context) {
		evidenceID := c.Param("evidenceID")
		response, err := ChannelExecute("QueryEvidenceHistory", [][]byte{[]byte(evidenceID)})

		if err != nil {
			log.Fatalf("Failed to evaluate transaction: %s\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query evidence history"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"code":    "200",
			"message": "Query successful!",
			"result":  string(response.Payload),
		})
	})

	r.Run(":9099")
}
