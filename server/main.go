package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/bitmark-inc/mobile-app/server/store/pushuuid"

	"github.com/bitmark-inc/mobile-app/server/external/notification"
	"github.com/bitmark-inc/mobile-app/server/internalapi"
	"github.com/bitmark-inc/mobile-app/server/logmodule"
	"github.com/bitmark-inc/mobile-app/server/server"

	"github.com/bitmark-inc/mobile-app/server/watcher"
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
		CoreAPIServer string `hcl:"coreAPIServer"`
		MessageQueue  string `hcl:"messageQueue"`
		IFTTTServer   string `hcl:"iftttServer"`
		PushServer    string `hcl:"pushServer"`
	}
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

func openDb(host string, port uint16, dbname, user, passwd string) (*pgx.Conn, error) {
	logger := logmodule.NewPgxLogger()
	dbconfig := pgx.ConnConfig{
		Host:     host,
		Port:     port,
		Database: dbname,
		User:     user,
		Password: passwd,
		Logger:   logger,
	}

	c, err := pgx.Connect(dbconfig)
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

func main() {
	var configFile string
	var config Configuration

	flag.StringVar(&configFile, "conf", "./mobile-server.conf", "mobile server configuration")
	flag.Parse()

	initializeLog()

	if err := config.Load(configFile); err != nil {
		log.Panic("can not open config file", err)
	}

	log.Debug(config)

	dbConn, err := openDb(config.DB.Host, uint16(config.DB.Port), config.DB.DBName, config.DB.Username, config.DB.Password)
	if err != nil {
		log.Panic("cannot connect to db", err)
	}

	mobileAPIServer := server.New(dbConn)

	pushClient := notification.New(config.External.PushServer)
	pushStore := pushuuid.NewPGStore(dbConn)

	internalAPIServer := internalapi.New(dbConn, pushStore, pushClient)

	w := watcher.New(config.External.MessageQueue, pushStore, pushClient)
	w.Connect(config.External.MessageQueue)

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
