package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/bitmark-inc/mobile-app/mobile-server/config"
	"github.com/bitmark-inc/mobile-app/mobile-server/watcher/blockchain"

	"github.com/bitmark-inc/mobile-app/mobile-server/external/gateway"
	"github.com/bitmark-inc/mobile-app/mobile-server/external/gorush"
	"github.com/bitmark-inc/mobile-app/mobile-server/internalapi"
	"github.com/bitmark-inc/mobile-app/mobile-server/logmodule"
	"github.com/bitmark-inc/mobile-app/mobile-server/server"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/bitmarkstore"
	"github.com/bitmark-inc/mobile-app/mobile-server/store/pushstore"
	"github.com/bitmark-inc/mobile-app/mobile-server/watcher"
	"github.com/bitmark-inc/mobile-app/mobile-server/watcher/twosigs"
	"github.com/gomodule/redigo/redis"
	influx "github.com/influxdata/influxdb/client/v2"
	nsq "github.com/nsqio/go-nsq"

	"github.com/jackc/pgx"
	log "github.com/sirupsen/logrus"
	"golang.org/x/sync/errgroup"
)

var (
	g   errgroup.Group
	ctx context.Context = context.Background()
)

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

func newRedisPool(uri string) *redis.Pool {
	return &redis.Pool{
		Dial: func() (redis.Conn, error) {
			c, err := redis.Dial("tcp", uri)
			if err != nil {
				return nil, err
			}
			return c, nil
		},
	}
}

func initializeLog(conf *config.Configuration) {
	log.SetFormatter(&log.TextFormatter{})
	log.SetOutput(os.Stdout)
	log.SetLevel(log.DebugLevel)

	if len(conf.Log.FluentdHost) == 0 {
		return
	}
	hook := logmodule.NewFluentdHook(conf.Log.Tag, conf.Log.FluentdHost, conf.Log.FluentdPort)

	log.AddHook(hook)
}

func initializeWatcher(c *config.Configuration, pushStore pushstore.PushStore, bitmarkStore bitmarkstore.BitmarkStore, pushAPIClient *gorush.Client, gatewayClient *gateway.Client) *watcher.NotifyClient {
	nc := &watcher.NotifyClient{
		Queues:   make([]*nsq.Consumer, 0),
		Stop:     make(chan struct{}),
		CertPath: c.External.MessageQueue.CrtFile,
		KeyFile:  c.External.MessageQueue.KeyFile,
	}

	twosigsHandler := twosigs.New(pushStore, pushAPIClient, gatewayClient, c.DataDonation.ResearcherAccounts)
	nc.Add("transfer-offer", c.External.MessageChannel, twosigsHandler)

	blockchainHandler := blockchain.New(pushStore, bitmarkStore, pushAPIClient, gatewayClient)
	nc.Add("new-block", c.External.MessageChannel, blockchainHandler)

	nc.Connect(c.External.MessageQueue.Server)

	return nc
}

func main() {
	var configFile string

	flag.StringVar(&configFile, "conf", "./mobile-server.conf", "mobile server configuration")
	flag.Parse()

	conf, err := config.LoadConfig(configFile)
	if err != nil {
		panic("can not open config file:" + err.Error())
	}

	initializeLog(conf)

	// Open influx db
	influxDBClient, err := influx.NewHTTPClient(influx.HTTPConfig{
		Addr:     conf.Influx.Addr,
		Username: conf.Influx.Username,
		Password: conf.Influx.Password,
	})
	if err != nil {
		log.Fatal(err)
	}

	dbConn, err := openDb(conf.DB.Host, uint16(conf.DB.Port), conf.DB.DBName, conf.DB.Username, conf.DB.Password)
	if err != nil {
		log.Panic("cannot connect to db", err)
	}

	redisPool := newRedisPool(conf.Redis.URI)

	pushStore := pushstore.NewPGStore(dbConn)
	bitmarkStore := bitmarkstore.New(dbConn)

	// push api client
	pushClient := gorush.New(conf.PushClients)
	gatewayClient := gateway.New(conf.External.CoreAPIServer)

	// if !pushClient.Ping(ctx) {
	// 	log.Panic("Failed to ping to push server")
	// }
	// if !gatewayClient.Ping(ctx) {
	// 	log.Panic("Failed to ping to gateway server")
	// }

	nc := initializeWatcher(conf, pushStore, bitmarkStore, pushClient, gatewayClient)

	mobileAPIServer := server.New(conf, pushStore, bitmarkStore, dbConn, redisPool, influxDBClient, gatewayClient, pushClient)
	internalAPIServer := internalapi.New(pushStore, bitmarkStore, pushClient)

	c := make(chan os.Signal, 2)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		log.Info("Server is preparing to shutdown")

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		log.Info("Shutdown mobile api server")
		if err := mobileAPIServer.Shutdown(ctx); err != nil {
			log.Fatal("Server Shutdown:", err)
		}

		log.Info("Shutdown internal api server")
		if err := internalAPIServer.Shutdown(ctx); err != nil {
			log.Fatal("Server Shutdown:", err)
		}

		log.Info("Disconnect nsq")
		nc.Close()

		log.Info("Disconnect postgres")
		dbConn.Close()

		log.Info("Disconnect redis")
		redisPool.Close()

		log.Info("Disconnect influxdb")
		log.Error(influxDBClient.Close())

		os.Exit(1)
	}()

	g.Go(func() error {
		return mobileAPIServer.Run(fmt.Sprintf(":%d", conf.Listen.MobileAPI))
	})

	g.Go(func() error {
		return internalAPIServer.Run(fmt.Sprintf(":%d", conf.Listen.InternalAPI))
	})

	g.Go(func() error {
		mobileAPIServer.ProcessWSMessage()
		return nil
	})

	if err := g.Wait(); err != nil {
		log.Fatal(err)
	}

	quit := make(chan os.Signal)
	signal.Notify(quit, os.Interrupt)
	<-quit
}
