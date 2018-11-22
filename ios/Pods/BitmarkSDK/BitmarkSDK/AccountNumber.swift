//
//  Address.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 12/16/16.
//  Copyright © 2016 Bitmark. All rights reserved.
//

import Foundation

public typealias AccountNumber = String

public extension AccountNumber {
    public func isValid() -> Bool {
        return Account.isValidAccountNumber(accontNumber: self)
    }
    
    public func parse() throws -> (network: Network, pubkey: Data) {
        return try Account.parseAccountNumber(accountNumber: self)
    }
}

internal extension AccountNumber {
    func parseAndVerifyAccountNumber() throws -> (network: Network, prefix: Data, pubkey: Data) {
        guard let addressData = self.base58DecodedData else {
            throw("Address error: unknow address")
        }
        
        let addressBuffer = [UInt8](addressData)
        
        let (_keyVariant, _keyVariantLength) = addressData.toVarint64WithLength()
        guard let keyVariant = _keyVariant,
            let keyVariantLength = _keyVariantLength else {
                throw("Address error: this is not an address")
        }
        
        // check for whether this is an address
        let keyPartVal = Config.KeyPart.publicKey
        if (keyVariant & 1) !=  keyPartVal {
            throw("Address error: this is not an address")
        }
        
        // detect network
        let networkVal = (keyVariant >> 1) & 0x01
        var network: Network
        
        if networkVal == UInt64(Network.livenet.rawValue) {
            network = Network.livenet
        }
        else {
            network = Network.testnet
        }
        
        // key type
        let keyTypeVal = (keyVariant >> 4) & 0x07
        
        guard let keyType = Common.getKey(byValue: keyTypeVal) else {
            throw("Address error: unknow key type")
        }
        
        let addressLength = keyVariantLength + keyType.publicLength + Config.checksumLength
        
        if addressLength != addressBuffer.count{
            throw("Address error: key type " + keyType.name + " must be " +  String(addressLength) + " bytes")
        }
        
        // public key
        let pubKey = addressData.slice(start: keyVariantLength, end: (addressLength - Config.checksumLength))
        
        // check checksum
        let checksumData = addressData.slice(start: 0, end: keyVariantLength + keyType.publicLength)
        let checksum = checksumData.sha3(length: 256).slice(start: 0, end: Config.checksumLength)
        let checksumFromAddress = addressData.slice(start: addressLength - Config.checksumLength, end: addressLength)
        
        if checksum != checksumFromAddress {
            throw("Address error: checksum mismatchs")
        }
        
        let prefix = Data.varintFrom(keyVariant)
        
        return (network, prefix, pubKey)
    }
    
    static func build(fromPubKey pubKey: Data, network: Network, keyType: KeyType = KeyType.ed25519) -> AccountNumber {
        let keyTypeVal = keyType.value
        var keyVariantVal = keyTypeVal << 4
        keyVariantVal |= Config.KeyPart.publicKey // first bit
        keyVariantVal |= (network.rawValue << 1) // second bit indicates net
        let keyVariantData = Data.varintFrom(keyVariantVal)
        
        let checksumData = keyVariantData.concating(data: pubKey).sha3(length: 256).slice(start: 0, end: Config.checksumLength)
        
        let addressData = keyVariantData + pubKey + checksumData
        return addressData.base58EncodedString
    }
    
    func pack() throws -> Data {
        // Parse account number
        let (_, prefix, pubkey) = try self.parseAndVerifyAccountNumber()
        return prefix + pubkey
    }
}

public extension Account {
    public static func parseAccountNumber(accountNumber: AccountNumber) throws -> (network: Network, pubkey: Data) {
        let (network, _, pubkey) = try accountNumber.parseAndVerifyAccountNumber()
        return (network, pubkey)
    }
    
    public static func isValidAccountNumber(accontNumber: AccountNumber) -> Bool {
        do {
            let (network, _) = try parseAccountNumber(accountNumber: accontNumber)
            return network == globalConfig.network
        } catch let e {
            print(e)
            return false
        }
    }
}
