//
//  Account+Keychain.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 1/3/19.
//  Copyright © 2019 Bitmark. All rights reserved.
//

import Foundation
import KeychainAccess

public extension Account {
    private static let keychainAccountPrefix = "bitmark_core_"
    private static let keychainMetadataPrefix = "bitmark_account_metadata_"
    
    private static func getKeychain(service: String, reason: String?) throws -> Keychain {
        if let reason = reason {
            return Keychain(service: service)
                .accessibility(.whenPasscodeSetThisDeviceOnly, authenticationPolicy: .userPresence)
                .authenticationPrompt(reason)
        } else {
            return Keychain(service: service)
        }
    }
    
    public static func loadFromKeychain(service: String, alias: String, requireAuthenticationWithMessage message: String? = nil) throws -> Account {
        let keychain = try Account.getKeychain(service: service, reason: message)
        guard let seedCore = try keychain.getData(Account.keychainAccountPrefix + alias),
            let accountMetadata = try keychain.getData(Account.keychainMetadataPrefix + alias) else {
                throw("Alias not found")
        }
        let accountMeta = try JSONDecoder().decode([String:Int].self, from: accountMetadata)
        guard let versionValue = accountMeta["version"],
            let version = SeedVersion(rawValue: versionValue) else {
                throw("Invalid account format")
        }
        
        let seed = try Seed.fromCore(seedCore, version: version)
        return try Account(seed: seed)
    }
    
    public func saveToKeychain(service: String, alias: String? = nil, requireAuthenticationWithMessage message: String? = nil) throws {
        let keychain = try Account.getKeychain(service: service, reason: message)
        let accountMeta = ["version": self.seed.version.rawValue,
                        "network": self.seed.network.rawValue]
        let accountMetadata = try JSONEncoder().encode(accountMeta)
        try keychain.set(self.seed.core, key: Account.keychainAccountPrefix + (alias ?? self.accountNumber))
        try keychain.set(accountMetadata, key: Account.keychainMetadataPrefix + (alias ?? self.accountNumber))
    }
}
