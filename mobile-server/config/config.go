package config

import (
	"io/ioutil"
	"os"

	"github.com/hashicorp/hcl"
)

type PushServerInfo struct {
	URI   string `hcl:"uri"`
	Topic string `hcl:"topic"`
}

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
	Influx struct {
		Addr     string `hcl:"addr"`
		Username string `hcl:"username"`
		Password string `hcl:"password"`
	} `hcl:"influx"`
	PushClients map[string]PushServerInfo `hcl:"push-notification"`
	External    struct {
		CoreAPIServer string `hcl:"coreAPIServer"`
		MessageQueue  struct {
			Server  string `hcl:"server"`
			CrtFile string `hcl:"crtFile"`
			KeyFile string `hcl:"keyFile"`
		} `hcl:"messageQueue"`
		MessageChannel string `hcl:"messageChannel"`
		IFTTTServer    string `hcl:"iftttServer"`
		PushServer     string `hcl:"pushServer"`
		PushServerBeta string `hcl:"pushServerBeta"`
	} `hcl:"external"`
	DataDonation struct {
		ResearcherAccounts map[string]string `hcl:"researchers"`
	} `hcl:"data-donation"`
}

func LoadConfig(configFile string) (*Configuration, error) {
	var c Configuration
	f, err := os.Open(configFile)
	if err != nil {
		return nil, err
	}

	b, err := ioutil.ReadAll(f)
	if err != nil {
		return nil, err
	}

	if err = hcl.Unmarshal(b, &c); nil != err {
		return nil, err
	}

	return &c, nil
}
