//
//  Account.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 10/23/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

import Foundation
import TweetNacl

public enum SignMethod: String {
    case Indentity = "identity"
}

public struct Account {
    
    public let core: Data
    let authKey: AuthKey
    let encryptionKey: EncryptionKey
    
    // MARK:- Basic init
    
    public init(keyType: KeyType = KeyType.ed25519, network: Network = Network.livenet) throws {
        let core = Common.randomBytes(length: keyType.seedLength)
        try self.init(core: core, network: network)
    }
    
    public init(core: Data, network: Network = Network.livenet) throws {
        self.core = core
        
        authKey = try AuthKey(fromKeyPair: try Account.deriveAuthKey(seed: core), network: network)
        encryptionKey = try Account.encryptionKeypair(fromSeed: try Account.deriveEncryptionKey(seed: core))
    }
    
    public var accountNumber: AccountNumber {
        return authKey.address
    }

    
    // MARK:- Seed
    
    public init(fromSeed seedString: String, version: Int = Config.SeedConfig.version) throws {
        let seed = try Seed(fromBase58: seedString, version: version)
        try self.init(core: seed.core, network: seed.network)
    }
    
    public func toSeed(version: Int = Config.SeedConfig.version, network: Network = Network.livenet) throws -> String {
        let seed = try Seed(core: core, version: version, network: network)
        return seed.base58String
    }
    
    public func toSeed() throws -> String {
        let seed = try Seed(core: core, version: 1, network: self.accountNumber.network)
        return seed.base58String
    }
    
    // MARK:- Recover phrase
    
    public init(recoverPhrase phrases: [String]) throws {
        let bytes = try RecoverPhrase.recoverSeed(fromPhrase: phrases)
        let networkByte = bytes[0]
        let network = networkByte == Network.livenet.addressValue ? Network.livenet : Network.testnet
        let coreBytes = bytes.subdata(in: 1..<33)
        try self.init(core: coreBytes, network: network)
    }
    
    public func getRecoverPhrase() throws -> [String] {
        return try getRecoverPhrase(withNetwork: authKey.network)
    }

    public func getRecoverPhrase(withNetwork network: Network) throws -> [String] {
        var data = Data(bytes: [UInt8(truncatingIfNeeded: network.addressValue)])
        data.append(core)
        return try RecoverPhrase.createPhrase(fromData: data)
    }
    
    // MARK:- Helpers
    private static func derive(seed: Data, indexData: Data) throws -> Data {
        let nonce = Data(count: 24)
        return try NaclSecretBox.secretBox(message: indexData, nonce: nonce, key: seed)
    }
    
    private static func deriveAuthKey(seed: Data) throws -> Data {
        return try derive(seed: seed, indexData: "000000000000000000000000000003e7".hexDecodedData)
    }
    
    private static func deriveEncryptionKey(seed: Data) throws -> Data {
        return try derive(seed: seed, indexData: "000000000000000000000000000003e8".hexDecodedData)
    }
    
    // MARK:- Sign
    public func sign(withMessage message: String, forAction action: SignMethod) throws -> Data {
        let actualMessage = action.rawValue + "|" + message
        return try authKey.sign(message: actualMessage)
    }
    
    // TODO: Discuss and remove this function
    public func riskySign(withMessage message: String) throws -> Data {
        return try authKey.sign(message:message)
    }
}

internal extension Account {
    
    internal static func encryptionKeypair(fromSeed seed: Data) throws -> EncryptionKey {
        let publicKey = try TweetNacl.NaclScalarMult.base(n: seed)
        return EncryptionKey(privateKey: seed, publicKey: publicKey)
    }
    
}
