//
//  Address.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 12/16/16.
//  Copyright © 2016 Bitmark. All rights reserved.
//

import Foundation

public struct AccountNumber {
    
    public let prefix: Data
    public let pubKey: Data
    public let network: Network
    public let string: String
    public let keyType: KeyType
    
    public init(fromPubKey pubKey: Data, network: Network = Network.livenet, keyType: KeyType = KeyType.ed25519) {
        self.pubKey = pubKey
        self.network = network
        
        let keyTypeVal = keyType.value
        var keyVariantVal = keyTypeVal << 4
        keyVariantVal |= Config.KeyPart.publicKey // first bit
        keyVariantVal |= (network.addressValue << 1) // second bit indicates net
        let keyVariantData = Data.varintFrom(keyVariantVal)
        
        let checksumData = keyVariantData.concating(data: pubKey).sha3(length: 256).slice(start: 0, end: Config.checksumLength)
        
        let addressData = keyVariantData + pubKey + checksumData
        let base58Address = addressData.base58EncodedString
        self.string = base58Address
        self.prefix = keyVariantData
        self.keyType = keyType
    }
    
    public init(address: String) throws {
        guard let addressData = address.base58DecodedData else {
            throw(BMError("Address error: unknow address"))
        }
        
        let addressBuffer = [UInt8](addressData)
        
        self.string = address
        
        let (_keyVariant, _keyVariantLength) = addressData.toVarint64WithLength()
        guard let keyVariant = _keyVariant,
            let keyVariantLength = _keyVariantLength else {
            throw(BMError("Address error: this is not an address"))
        }
        
        // check for whether this is an address
        let keyPartVal = Config.KeyPart.publicKey
        if (keyVariant & 1) !=  keyPartVal {
            throw(BMError("Address error: this is not an address"))
        }
        
        // detect network
        let networkVal = (keyVariant >> 1) & 0x01
        
        if networkVal == UInt64(Network.livenet.addressValue) {
            self.network = Network.livenet
        }
        else {
            self.network = Network.testnet
        }
        
        // key type
        let keyTypeVal = (keyVariant >> 4) & 0x07
        
        guard let keyType = Common.getKey(byValue: keyTypeVal) else {
            throw(BMError("Address error: unknow key type"))
        }
        
        let addressLength = keyVariantLength + keyType.publicLength + Config.checksumLength
        
        if addressLength != addressBuffer.count{
            throw(BMError("Address error: key type " + keyType.name + " must be " +  String(addressLength) + " bytes"))
        }
        
        // public key
        self.pubKey = addressData.slice(start: keyVariantLength, end: (addressLength - Config.checksumLength))
        
        // check checksum
        let checksumData = addressData.slice(start: 0, end: keyVariantLength + keyType.publicLength)
        let checksum = checksumData.sha3(length: 256).slice(start: 0, end: Config.checksumLength)
        let checksumFromAddress = addressData.slice(start: addressLength - Config.checksumLength, end: addressLength)
        
        if checksum != checksumFromAddress {
            throw(BMError("Address error: checksum mismatchs"))
        }
        
        self.prefix = Data.varintFrom(keyVariant)
        self.keyType = keyType
    }
    
    public func pack() -> Data {
        return prefix + pubKey
    }
}
