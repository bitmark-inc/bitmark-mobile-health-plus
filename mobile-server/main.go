package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"os/signal"
	"syscall"

	"github.com/bitmark-inc/mobile-app/mobile-server/external/gateway"
	"github.com/bitmark-inc/mobile-app/mobile-server/external/gorush"
	"github.com/bitmark-inc/mobile-app/mobile-server/internalapi"
	"github.com/bitmark-inc/mobile-app/mobile-server/logmodule"
	"github.com/bitmark-inc/mobile-app/mobile-server/server"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/bitmarkstore"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/pushstore"
	"github.com/bitmark-inc/mobile-app/mobile-server/watcher"
	"github.com/bitmark-inc/mobile-app/mobile-server/watcher/twosigs"
	nsq "github.com/nsqio/go-nsq"

	"github.com/hashicorp/hcl"
	"github.com/jackc/pgx"
	log "github.com/sirupsen/logrus"
	"golang.org/x/sync/errgroup"
)

var (
	g errgroup.Group
)

type Configuration struct {
	Network string `hcl:"network"`
	Listen  struct {
		MobileAPI   int `hcl:"mobileAPI"`
		InternalAPI int `hcl:"internalAPI"`
	} `hcl:"listen"`
	DB struct {
		Host     string `hcl:"host"`
		Port     int    `hcl:"port"`
		Username string `hcl:"username"`
		Password string `hcl:"password"`
		DBName   string `hcl:"dbname"`
		SSLMode  string `hcl:"sslmode"`
	} `hcl:"db"`
	External struct {
		CoreAPIServer  string `hcl:"coreAPIServer"`
		MessageQueue   string `hcl:"messageQueue"`
		MessageChannel string `hcl:"messageChannel"`
		IFTTTServer    string `hcl:"iftttServer"`
		PushServer     string `hcl:"pushServer"`
		PushServerBeta string `hcl:"pushServerBeta"`
	} `hcl:"external"`
	DataDonation struct {
		ResearcherAccounts map[string]string `hcl:"researchers"`
	} `hcl:"data-donation"`
}

func (config *Configuration) Load(configFile string) error {
	f, err := os.Open(configFile)
	if err != nil {
		return err
	}

	b, err := ioutil.ReadAll(f)
	if err != nil {
		return err
	}

	if err = hcl.Unmarshal(b, config); nil != err {
		return err
	}

	return nil
}

func openDb(host string, port uint16, dbname, user, passwd string) (*pgx.ConnPool, error) {
	logger := logmodule.NewPgxLogger()
	dbconfig := pgx.ConnConfig{
		Host:     host,
		Port:     port,
		Database: dbname,
		User:     user,
		Password: passwd,
		Logger:   logger,
		LogLevel: pgx.LogLevelWarn,
	}

	poolConfig := pgx.ConnPoolConfig{
		ConnConfig:     dbconfig,
		MaxConnections: 25,
	}

	c, err := pgx.NewConnPool(poolConfig)
	if err != nil {
		return nil, err
	}

	return c, nil
}

func initializeLog() {
	log.SetFormatter(&log.TextFormatter{})
	log.SetOutput(os.Stdout)
	log.SetLevel(log.DebugLevel)
}

func initializeWatcher(c *Configuration, store pushstore.PushStore, pushAPIClient *gorush.Client, gatewayClient *gateway.Client) *watcher.NotifyClient {
	nc := &watcher.NotifyClient{
		Queues: make([]*nsq.Consumer, 0),
		Stop:   make(chan struct{}),
	}

	twosigsHandler := twosigs.New(store, pushAPIClient, gatewayClient, c.DataDonation.ResearcherAccounts)
	nc.Add("transfer-offer", c.External.MessageChannel, twosigsHandler)
	nc.Connect(c.External.MessageQueue)

	return nc
}

func main() {
	var configFile string
	var config Configuration

	flag.StringVar(&configFile, "conf", "./mobile-server.conf", "mobile server configuration")
	flag.Parse()

	initializeLog()

	if err := config.Load(configFile); err != nil {
		log.Panic("can not open config file", err)
	}

	dbConn, err := openDb(config.DB.Host, uint16(config.DB.Port), config.DB.DBName, config.DB.Username, config.DB.Password)
	if err != nil {
		log.Panic("cannot connect to db", err)
	}

	pushStore := pushstore.NewPGStore(dbConn)
	bitmarkStore := bitmarkstore.New(dbConn)

	log.Debug("config.External.PushServerBeta: ", config.External.PushServerBeta)

	pushClient := gorush.New(map[string]string{
		"primary": config.External.PushServer,
		"beta":    config.External.PushServerBeta,
	})
	gatewayClient := gateway.New(config.External.CoreAPIServer)

	if !pushClient.Ping() {
		log.Panic("Failed to ping to push server")
	}
	if !gatewayClient.Ping() {
		log.Panic("Failed to ping to gateway server")
	}

	nc := initializeWatcher(&config, pushStore, pushClient, gatewayClient)

	c := make(chan os.Signal, 2)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		log.Info("Server is preparing to stop")
		dbConn.Close()
		nc.Close()
		os.Exit(1)
	}()

	mobileAPIServer := server.New(pushStore, bitmarkStore)
	internalAPIServer := internalapi.New(pushStore, pushClient)

	g.Go(func() error {
		return mobileAPIServer.Run(fmt.Sprintf(":%d", config.Listen.MobileAPI))
	})

	g.Go(func() error {
		return internalAPIServer.Run(fmt.Sprintf(":%d", config.Listen.InternalAPI))
	})

	if err := g.Wait(); err != nil {
		log.Fatal(err)
	}
}
