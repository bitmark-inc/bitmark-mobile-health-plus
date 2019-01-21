//
//  Seed.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 10/10/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

import Foundation
import TweetNacl

public enum SeedError: Error {
    case randomError
    case wrongBase58
    case checksumFailed
    case wrongMagicNumber
    case wrongVersion
    case wrongSeedLength
    case wrongNetwork
}

public enum SeedVersion: Int {
    case v1 = 1
    case v2 = 2
}

public protocol Seedable {
    init(network: Network) throws
    init(core: Data) throws
    init(fromBase58 base58String: String) throws
    init(fromRecoveryPhrase recoveryPhrase: [String], language: RecoveryLanguage) throws
    var base58String: String { get }
    var network: Network { get }
    var version: SeedVersion { get }
    var core: Data { get }
    func getKeysData() throws -> (Data, Data)
    func getRecoveryPhrase(language: RecoveryLanguage) throws -> [String]
}

public struct SeedV1: Seedable {
    public let core: Data
    public let network: Network
    public let version: SeedVersion
    
    public init(network: Network) throws {
        let core = Common.randomBytes(length: Config.SeedConfigV1.length)
        try self.init(core: core)
    }
    
    public init(core: Data) throws {
        if core.count != Config.SeedConfigV1.length {
            throw(SeedError.wrongSeedLength)
        }
        
        self.core = core
        self.network = globalConfig.network
        self.version = .v1
    }
    
    public init(fromBase58 base58String: String) throws {
        guard let codeBuffer = base58String.base58DecodedData else {
            throw(SeedError.wrongBase58)
        }
        
        let checksum = codeBuffer.slice(start: codeBuffer.count - Config.SeedConfigV1.checksumLength, end: codeBuffer.count)
        let rest = codeBuffer.slice(start: 0, end: codeBuffer.count - Config.SeedConfigV1.checksumLength)
        
        // Verify the checksum
        let checksumVerification = rest.sha3(length: 256).slice(start: 0, end: Config.SeedConfigV1.checksumLength)
        if checksum != checksumVerification {
            throw SeedError.checksumFailed
        }
        
        // Verify magic number
        let magicNumber = rest.slice(start: 0, end: Config.SeedConfigV1.magicNumber.count)
        if magicNumber != Data(bytes: Config.SeedConfigV1.magicNumber) {
            throw SeedError.wrongMagicNumber
        }
        
        let seedVersionEncoded = Data.varintFrom(Config.SeedConfigV1.versionByte)
        
        // Verify version
        let versionData = rest.slice(start: Config.SeedConfigV1.magicNumber.count, end: Config.SeedConfigV1.magicNumber.count + seedVersionEncoded.count)
        guard let versionValue = versionData.toVarint64() else {
            throw SeedError.wrongVersion
        }
        
        if versionValue != Config.SeedConfigV1.versionByte {
            throw SeedError.wrongVersion
        }
        
        // Verify current network
        let networkData = rest.slice(start: Config.SeedConfigV1.magicNumber.count + seedVersionEncoded.count,
                                     end: Config.SeedConfigV1.magicNumber.count + seedVersionEncoded.count + Config.SeedConfigV1.networkLength)
        
        guard let networkValue = networkData.toVarint64() else {
            throw SeedError.wrongNetwork
        }
        
        guard let network = Common.getNetwork(byAddressValue: networkValue) else {
            throw SeedError.wrongNetwork
        }
        
        // Get seed
        let core = rest.slice(start: Config.SeedConfigV1.magicNumber.count + seedVersionEncoded.count + Config.SeedConfigV1.networkLength,
                              end: rest.count)
        if core.count != Config.SeedConfigV1.length {
            throw SeedError.wrongSeedLength
        }
        
        self.core = core
        self.network = network
        self.version = .v1
    }
    
    public init(fromRecoveryPhrase recoveryPhrase: [String], language: RecoveryLanguage) throws {
        let bytes = try RecoverPhrase.V1.recoverSeed(fromPhrase: recoveryPhrase, language: language)
        let networkByte = bytes[0]
        let network = networkByte == Network.livenet.rawValue ? Network.livenet : Network.testnet
        let coreBytes = bytes.subdata(in: 1..<33)
        self.core = coreBytes
        self.network = network
        self.version = .v1
    }
    
    public var base58String: String {
        // Contruct parts
        let magicNumber = Data(bytes: Config.SeedConfigV1.magicNumber)
        let currentNetwork = Data.varintFrom(self.network.rawValue)
        let seedVersionEncoded = Data.varintFrom(Config.SeedConfigV1.versionByte)
        var exportedSeed = magicNumber + seedVersionEncoded + currentNetwork + self.core
        
        // Add checksum
        let checksum = exportedSeed.sha3(length: 256).slice(start: 0, end: Config.SeedConfigV1.checksumLength)
        exportedSeed += checksum
        return exportedSeed.base58EncodedString
    }
    
    public func getRecoveryPhrase(language: RecoveryLanguage) throws -> [String] {
        var data = Data(bytes: [UInt8(truncatingIfNeeded: network.rawValue)])
        data.append(core)
        return try RecoverPhrase.V1.createPhrase(fromData: data, language: language)
    }
    
    public func getKeysData() throws -> (Data, Data) {
        return (try SeedV1.derive(core: core, indexData: "000000000000000000000000000003e7".hexDecodedData),
        try SeedV1.derive(core: core, indexData: "000000000000000000000000000003e8".hexDecodedData))
    }
}

extension SeedV1 {
    private static func derive(core: Data, indexData: Data) throws -> Data {
        let nonce = Data(count: 24)
        return try NaclSecretBox.secretBox(message: indexData, nonce: nonce, key: core)
    }
}

public struct SeedV2: Seedable {
    public let core: Data
    public let network: Network
    public let version: SeedVersion
    
    public init(network: Network) throws {
        var bytes = [UInt8](Common.randomBytes(length: Config.SeedConfigV2.coreLength))
        
        // extend to 132 bits
        bytes.append(bytes[15] & 0xf0) // bits 7654xxxx  where x=zero
        
        // encode test/live flag
        var mode = bytes[0] & 0x80 | bytes[1] & 0x40 | bytes[2] & 0x20 | bytes[3] & 0x10
        if network == .testnet {
            mode = mode ^ 0xf0
        }
        bytes[15] = mode | bytes[15] & 0x0f
        
        try self.init(core: Data(bytes: bytes))
    }
    
    public init(core: Data) throws {
        // this ensures last nibble is zeroed
        if 0 != core[16] & 0x0f {
            throw(SeedError.wrongSeedLength)
        }
        
        var parsedNetwork: Network
        
        let mode = core[0] & 0x80 | core[1] & 0x40 | core[2] & 0x20 | core[3] & 0x10
        if mode == core[15] & 0xf0 {
            parsedNetwork = .livenet
        } else if mode == core[15] & 0xf0 ^ 0xf0 {
            parsedNetwork = .testnet
        } else {
            throw(SeedError.wrongNetwork)
        }
        
        self.core = core
        self.network = parsedNetwork
        self.version = .v2
    }
    
    public init(fromRecoveryPhrase recoveryPhrase: [String], language: RecoveryLanguage) throws {
        let core = try RecoverPhrase.V2.recoverSeed(fromPhrase: recoveryPhrase, language: language)
        var parsedNetwork: Network
        
        let mode = core[0] & 0x80 | core[1] & 0x40 | core[2] & 0x20 | core[3] & 0x10
        if mode == core[15] & 0xf0 {
            parsedNetwork = .livenet
        } else if mode == core[15] & 0xf0 ^ 0xf0 {
            parsedNetwork = .testnet
        } else {
            throw(SeedError.wrongNetwork)
        }
        self.core = core
        self.network = parsedNetwork
        self.version = .v2
    }
    
    public init(fromBase58 base58String: String) throws {
        guard let seed = base58String.base58DecodedData else {
            throw(SeedError.wrongBase58)
        }
        
        // Compute seed length
        let keyLength = seed.count - Config.SeedConfigV2.magicNumber.count - Config.SeedConfigV2.checksumLength
        if keyLength != Config.SeedConfigV2.seedLength {
            throw SeedError.wrongSeedLength
        }
        
        // Check seed header
        if Config.SeedConfigV2.magicNumber != [UInt8](seed.subdata(in: 0..<Config.SeedConfigV2.magicNumber.count)) {
            throw SeedError.wrongMagicNumber
        }
        
        // Checksum
        let checksumStart = seed.count - Config.SeedConfigV2.checksumLength
        let exportedSeed = seed.subdata(in: 0..<checksumStart)
        let checksum = exportedSeed.sha3(length: 256).slice(start: 0, end: Config.SeedConfigV2.checksumLength)
        if checksum != seed.slice(start: checksumStart, end: seed.count) {
            throw SeedError.checksumFailed
        }
        
        let core = exportedSeed.subdata(in: Config.SeedConfigV2.magicNumber.count..<exportedSeed.count)
        
        // Network
        var parsedNetwork: Network
        
        let mode = core[0] & 0x80 | core[1] & 0x40 | core[2] & 0x20 | core[3] & 0x10
        if mode == core[15] & 0xf0 {
            parsedNetwork = .livenet
        } else if mode == core[15] & 0xf0 ^ 0xf0 {
            parsedNetwork = .testnet
        } else {
            throw(SeedError.wrongNetwork)
        }
        
        self.core = core
        self.network = parsedNetwork
        self.version = .v2
    }
    
    public var base58String: String {
        // Contruct parts
        let magicNumber = Data(bytes: Config.SeedConfigV2.magicNumber)
        var exportedSeed = magicNumber + self.core
        
        // Add checksum
        let checksum = exportedSeed.sha3(length: 256).slice(start: 0, end: Config.SeedConfigV2.checksumLength)
        exportedSeed += checksum
        return exportedSeed.base58EncodedString
    }
    
    public func getRecoveryPhrase(language: RecoveryLanguage) throws -> [String] {
        return try RecoverPhrase.V2.createPhrase(fromData: core, language: language)
    }
    
    public func getKeysData() throws -> (Data, Data) {
        let (result, _) = try SeedV2.seedToKeys(seed: core, keyCount: 2, keySize: 32)
        return (result[0], result[1])
    }
}

extension SeedV2 {
    internal static func seedToKeys(seed: Data, keyCount: Int, keySize: Int) throws -> ([Data], Network) {
        if seed.count != Config.SeedConfigV2.seedLength {
            throw("Invalid seed v2 length")
        }
        
        let bytes = [UInt8](seed)
        let network: Network
        let mode = bytes[0] & 0x80 | bytes[1] & 0x40 | bytes[2] & 0x20 | bytes[3] & 0x10
        if mode == bytes[15]&0xf0 {
            network = .livenet
        } else if mode == seed[15]&0xf0^0xf0 {
            network = .testnet
        } else {
            throw("network flag not found")
        }
        
        let hash = SHA3Compute.computeSHAKE256(data: seed, repeatCount: 4, length: keySize, count: keyCount)
        var results = [Data]()
        if keyCount * keySize > hash.count {
            throw("Exceed length limit")
        }
        for i in 0..<keyCount {
            let start = i * keySize
            let end = start + keySize
            results.append(hash.subdata(in: start..<end))
        }
        
        return (results, network)
    }
}

public struct Seed {
    
    public static func fromBase58(network: Network, version: SeedVersion) throws -> Seedable {
        switch version {
        case .v1:
            return try SeedV1(network: network)
        case .v2:
            return try SeedV2(network: network)
        }
    }
    
    public static func fromBase58(_ base58: String, version: SeedVersion) throws -> Seedable {
        switch version {
        case .v1:
            return try SeedV1(fromBase58: base58)
        case .v2:
            return try SeedV2(fromBase58: base58)
        }
    }
    
    public static func fromCore(_ core: Data, version: SeedVersion) throws -> Seedable {
        switch version {
        case .v1:
            return try SeedV1(core: core)
        case .v2:
            return try SeedV2(core: core)
        }
    }
    
    public static func fromRecoveryPhrase(_ recoveryPhrase: [String], language: RecoveryLanguage) throws -> Seedable {
        switch recoveryPhrase.count {
        case 24:
            return try SeedV1(fromRecoveryPhrase: recoveryPhrase, language: language)
        case 12:
            return try SeedV2(fromRecoveryPhrase: recoveryPhrase, language: language)
        default:
            throw("Invalid recovery phrase length")
        }
    }
}
