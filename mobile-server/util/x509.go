package util

import (
	"crypto/tls"
	"crypto/x509"
	"encoding/pem"
	"io/ioutil"
)

func DecryptPrivateKey(keyBytes []byte, password string) ([]byte, error) {
	pemBlock, _ := pem.Decode(keyBytes)

	decrypted, err := x509.DecryptPEMBlock(pemBlock, []byte(password))
	if err != nil {
		return nil, err
	}

	var keyBlock pem.Block
	keyBlock.Type = pemBlock.Type
	keyBlock.Bytes = decrypted
	return pem.EncodeToMemory(&keyBlock), nil
}

func LoadX509KeyPairWithPrivKey(certFile, keyFile, password string) (tls.Certificate, error) {
	certPEMBlock, err := ioutil.ReadFile(certFile)
	if err != nil {
		return tls.Certificate{}, err
	}

	encKeyPEMBlock, err := ioutil.ReadFile(keyFile)
	if err != nil {
		return tls.Certificate{}, err
	}

	keyPEMBlock, err := DecryptPrivateKey(encKeyPEMBlock, password)
	if err != nil {
		return tls.Certificate{}, err
	}

	return tls.X509KeyPair(certPEMBlock, keyPEMBlock)
}
