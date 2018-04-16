package util

import (
	"bytes"
	"fmt"

	"golang.org/x/crypto/sha3"
)

const (
	variantPrivateKey = 0x00
	variantPublicKey  = 0x01

	variantLivenet = 0x00
	variantTestnet = 0x01

	variantKeyTypeED25519 = 0x01
)

const (
	seedLength     = 32
	checksumLength = 4
)

func PublicKeyFromAccount(acct string) ([]byte, error) {
	keyByte := FromBase58(acct)
	if len(keyByte) != 37 {
		return nil, fmt.Errorf("invalid base58 string")
	}
	checksumStart := len(keyByte) - checksumLength
	keyLeft := keyByte[:checksumStart]

	// verify the checksum of public key
	checksum := sha3.Sum256(keyLeft)
	if !bytes.Equal(checksum[:checksumLength], keyByte[checksumStart:]) {
		return nil, fmt.Errorf("checksum mismatch")
	}

	variant := keyLeft[0]
	key := keyLeft[1:]

	if variant&0x01 != variantPublicKey {
		return nil, fmt.Errorf("invalid key type")
	}
	// test := variant&0x02 != 0

	variant = variant >> 4
	switch variant & 0x01 {
	case variantKeyTypeED25519:
	default:
		return nil, fmt.Errorf("invalid key algorithm")
	}

	return key, nil
}
