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
    
    public let seed: Seedable
    let authKey: AuthKey
    let encryptionKey: EncryptionKey
    
    // MARK:- Basic init
    
    public init(keyType: KeyType = KeyType.ed25519, version: SeedVersion, network: Network = Network.livenet) throws {
        let core = Common.randomBytes(length: keyType.seedLength)
        try self.init(core: core, version: version, network: network)
    }
    
    public init(core: Data, version: SeedVersion, network: Network = Network.livenet) throws {
        let seed = try Seed.fromCore(core, version: version, network: network)
        try self.init(fromSeed: seed, version: version)
    }
    
    public var accountNumber: AccountNumber {
        return authKey.address
    }

    
    // MARK:- Seed
    
    public init(fromSeed seed: Seedable, version: SeedVersion) throws {
        self.seed = seed
        authKey = try AuthKey(fromKeyPair: try seed.getAuthKeyData(), network: seed.network)
        encryptionKey = try Account.encryptionKeypair(fromSeed: try seed.getEncKeyData())
    }
    
    public init(fromSeed seedString: String, version: SeedVersion) throws {
        let seed = try Seed.fromBase58(seedString, version: version)
        try self.init(core: seed.core, version: version, network: seed.network)
    }
    
    public func toSeed() throws -> String {
        return seed.base58String
    }
    
    // MARK:- Recover phrase
    
    public init(recoverPhrase phrases: [String]) throws {
        let seed = try Seed.fromRecoveryPhrase(phrases)
        try self.init(fromSeed: seed, version: seed.version)
    }
    
    public func getRecoverPhrase() -> [String] {
        return seed.recoveryPhrase
    }
    
    // MARK:- Helpers
    private static func derive(seed: Data, indexData: Data) throws -> Data {
        let nonce = Data(count: 24)
        return try NaclSecretBox.secretBox(message: indexData, nonce: nonce, key: seed)
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
