//
//  Account.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 10/23/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

import Foundation
import TweetNacl

public struct Account {
    
    public let seed: Seedable
    let authKey: AuthKey
    public let encryptionKey: EncryptionKey
    
    // MARK:- Basic init
    
    public init(version: SeedVersion = .v2) throws {
        let seed = try Seed.fromBase58(network: globalConfig.network, version: version)
        try self.init(seed: seed)
    }
    
    public init(keyType: KeyType = KeyType.ed25519, version: SeedVersion = .v2, network: Network) throws {
        let seed = try Seed.fromBase58(network: network, version: version)
        try self.init(seed: seed)
    }
    
    public init(seed: Seedable) throws {
        self.seed = seed
        let (accountPrivateKey, encryptionPrivateKey) = try seed.getKeysData()
        authKey = try AuthKey(fromKeyPair: accountPrivateKey, network: seed.network)
        encryptionKey = try EncryptionKey(privateKey: encryptionPrivateKey)
    }
    
    public var accountNumber: AccountNumber {
        return authKey.address
    }

    
    // MARK:- Seed
    
    public init(fromSeed seedString: String, version: SeedVersion = .v2) throws {
        let seed = try Seed.fromBase58(seedString, version: version)
        try self.init(seed: seed)
    }
    
    public func toSeed() throws -> String {
        return seed.base58String
    }
    
    // MARK:- Recover phrase
    
    public init(recoverPhrase phrases: [String], language: RecoveryLanguage) throws {
        let seed = try Seed.fromRecoveryPhrase(phrases, language: language)
        if seed.network != globalConfig.network {
            throw(SeedError.wrongNetwork)
        }
        
        try self.init(seed: seed)
    }
    
    public func getRecoverPhrase(language: RecoveryLanguage) throws -> [String] {
        return try getRecoverPhrase(withNetwork: authKey.network, language: language)
    }

    public func getRecoverPhrase(withNetwork network: Network, language: RecoveryLanguage) throws -> [String] {
        return try seed.getRecoveryPhrase(language: language)
    }
    
    // MARK:- Sign
    public func sign(withMessage message: Data) throws -> Data {
        return try authKey.sign(message:message)
    }
}

extension Account: KeypairSignable {
    public init(privateKey: Data) throws {
        let seed = try Seed.fromCore(privateKey, version: .v2)
        try self.init(seed: seed)
    }
    
    public func sign(message: Data) throws -> Data {
        return try self.authKey.sign(message: message)
    }
    
    public var publicKey: Data {
        get {
            return self.authKey.publicKey
        }
    }
    
    public var address: AccountNumber {
        get {
            return self.authKey.address
        }
    }
}
