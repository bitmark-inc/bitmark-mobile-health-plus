//
//  PrivateKey.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 12/19/16.
//  Copyright © 2016 Bitmark. All rights reserved.
//

import Foundation
import TweetNacl

public struct AuthKey: AsymmetricKey {
    
    public let address: AccountNumber
    public let privateKey: Data
    public let publicKey: Data
    public let type: KeyType
    public let network: Network
    public let kif: String
    
    public init(fromKIF kifString: String) throws {
        guard let kifBuffer = kifString.base58DecodedData else {
            throw(BMError("Can not convert base58"))
        }
        self.kif = kifString
        
        let (_keyVariant, _keyVariantBufferLength) = kifBuffer.toVarint64WithLength()
        guard let keyVariant = _keyVariant,
            let keyVariantLength = _keyVariantBufferLength else {
                throw(BMError("Private key error: can not parse the kif string"))
        }
        
        // check for whether this is a kif
        let keyPartVal = Config.KeyPart.privateKey
        if keyVariant & 1 != keyPartVal {
            throw(BMError("Private key error: can not parse the kif string"))
        }
        
        // detect network
        let networkVal = (keyVariant >> 1) & 0x01
        guard let network = Common.getNetwork(byAddressValue: networkVal) else {
            throw(BMError("Unknow network"))
        }
        self.network = network
        
        // key type
        let keyTypeVal = (keyVariant >> 4) & 0x07
        guard let keyType = Common.getKey(byValue: keyTypeVal) else {
            throw(BMError("Unknow key type"))
        }
        self.type = keyType
        
        // check the length of kif
        let kifLength = keyVariantLength + keyType.seedLength + Config.checksumLength
        if kifLength != kifBuffer.count {
            throw(BMError("Private key error: KIF for"  + keyType.name + " must be " + String(kifLength) + " bytes"))
        }
        
        // get private key
        let seed = kifBuffer.slice(start: keyVariantLength, end: kifLength - Config.checksumLength)
        
        // check checksum
        let checksumData = kifBuffer.slice(start: 0, end: kifLength - Config.checksumLength)
        let checksum = checksumData.sha3(length: 256).slice(start: 0, end: Config.checksumLength)
        
        if checksum != kifBuffer.slice(start: kifLength - Config.checksumLength, end: kifLength) {
            throw(BMError("Private key error: checksum mismatch"))
        }
        
        // get address
        let keyPair = try Ed25519.generateKeyPair(fromSeed: seed)
        self.privateKey = keyPair.privateKey
        self.publicKey = keyPair.publicKey
        self.address = AccountNumber(fromPubKey: keyPair.publicKey, network: network, keyType: type)
    }
    
    public init(fromKeyPair keyPairData: Data, network: Network = Network.livenet, type: KeyType = KeyType.ed25519) throws {
        // Check length to determine the keypair
        
        var keyPair: (publicKey: Data, privateKey: Data)
        var seed: Data
        
        if keyPairData.count == type.privateLength {
            let keyPairResult = try Ed25519.generateKeyPair(fromPrivateKey: keyPairData)
            
            keyPair = keyPairResult
            seed = try Ed25519.getSeed(fromPrivateKey: keyPair.privateKey)
        }
        else if keyPairData.count == type.seedLength {
            seed = keyPairData
            
            let keyPairResult = try Ed25519.generateKeyPair(fromSeed: seed)
            keyPair = keyPairResult
        }
        else {
            throw(BMError("Unknown cases"))
        }
        
        let keyPartVal = UInt8(Config.KeyPart.privateKey)
        let networkVal = UInt8(network.addressValue)
        let keyTypeVal = UInt8(type.value)
        
        var keyVariantVal = (keyTypeVal << 3) | networkVal
        keyVariantVal = keyVariantVal << 1 | keyPartVal
        let keyVariantData = Data(bytes: [keyVariantVal])
        
        var checksum = keyVariantData.concating(data: seed).sha3(length: 256)
        checksum = checksum.slice(start: 0, end: Config.checksumLength)
        let kifData = keyVariantData + seed + checksum
        
        // Set data
        self.kif = kifData.base58EncodedString
        self.network = network
        self.type = type
        self.privateKey = keyPair.privateKey
        self.publicKey = keyPair.publicKey
        self.address = AccountNumber(fromPubKey: keyPair.publicKey, network: network, keyType: type)
    }
    
    public init(fromKeyPairString keyPairString: String, network: Network = Network.livenet, type: KeyType = KeyType.ed25519) throws {
        let keyPairData = keyPairString.hexDecodedData
        try self.init(fromKeyPair: keyPairData, network: network, type: type)
    }
    
    public func sign(message: String) throws -> Data {
        return try NaclSign.signDetached(message: message.data(using: .utf8)!, secretKey: privateKey)
    }
    
    public func sign(message: Data) throws -> Data {
        return try NaclSign.signDetached(message: message, secretKey: privateKey)
    }
    
    var algorithm: Algorithm {
        return .ed25519
    }
}
