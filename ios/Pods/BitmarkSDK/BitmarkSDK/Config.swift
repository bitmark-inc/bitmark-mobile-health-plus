//
//  Config.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 12/16/16.
//  Copyright © 2016 Bitmark. All rights reserved.
//

import Foundation

public struct KeyType {
    public let name: String
    public let value: Int
    public let publicLength: Int
    public let privateLength: Int
    public let seedLength: Int
}

public enum Network: Int {
    case livenet = 0x00
    case testnet = 0x01
}

public extension KeyType {
    public static let ed25519 = KeyType(name: "ed25519",
                                        value: 0x01,
                                        publicLength: 32,
                                        privateLength: 64,
                                        seedLength: 32)
}

public struct Config {
    static let keyTypes = [KeyType.ed25519]
    
    struct KeyPart {
        static let privateKey = 0x00
        static let publicKey = 0x01
    }
    
    static let checksumLength = 4
    
    // MARK:- Networks
    
    static let networks = [Network.livenet, Network.testnet]
    
    // MARK:- Record
    struct AssetConfig {
        static let value = 0x02
        static let maxName = 64
        static let maxMetadata = 2048
        static let maxFingerprint = 1024
    }
    
    static let issueTag = 0x03
    static let transferUnratifiedTag = 0x04
    static let transferCountersignedTag = 0x05
    
    // MARK:- Currency
    struct CurrencyConfig {
        static let bitcoin = 0x01
    }
    
    public struct SeedConfigV1 {
        public static let magicNumber: [UInt8] = [0x5a, 0xfe]
        public static let length = 32
        public static let checksumLength = 4
        public static let pKeyNonceLength = 24
        public static let pKeyCounterLength = 16
        public static let versionByte = 0x01
        public static let networkLength = 1
    }
    
    public struct SeedConfigV2 {
        public static let magicNumber: [UInt8] = [0x5a, 0xfe, 0x02]
        public static let coreLength = 16
        public static let seedLength = 17
        public static let checksumLength = 4
    }

}
