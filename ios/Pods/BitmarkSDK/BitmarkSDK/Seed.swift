//
//  Seed.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 10/10/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

import Foundation
import TweetNacl

public struct Seed {
    
    public enum SeedError: Error {
        case randomError
        case wrongBase58
        case checksumFailed
        case wrongMagicNumber
        case wrongVersion
        case wrongSeedLength
        case wrongNetwork
    }
    
    public let core: Data
    public let network: Network
    public let version: Int
    
    public init(version: Int = Config.SeedConfig.version, network: Network = Network.livenet) throws {
        let core = Common.randomBytes(length: Config.SeedConfig.length)
        
        try self.init(core: core, version: version, network: network)
    }
    
    public init(core: Data, version: Int = Config.SeedConfig.version, network: Network = Network.livenet) throws {
        if version != Config.SeedConfig.version {
            throw(SeedError.wrongVersion)
        }
        
        self.core = core
        self.network = network
        self.version = version
    }
    
    public init(fromBase58 base58String: String, version: Int = Config.SeedConfig.version) throws {
        guard let codeBuffer = base58String.base58DecodedData else {
            throw(SeedError.wrongBase58)
        }
        
        let checksum = codeBuffer.slice(start: codeBuffer.count - Config.SeedConfig.checksumLength, end: codeBuffer.count)
        let rest = codeBuffer.slice(start: 0, end: codeBuffer.count - Config.SeedConfig.checksumLength)
        
        // Verify the checksum
        let checksumVerification = rest.sha3(length: 256).slice(start: 0, end: Config.SeedConfig.checksumLength)
        if checksum != checksumVerification {
            throw SeedError.checksumFailed
        }
        
        // Verify magic number
        let magicNumber = rest.slice(start: 0, end: Config.SeedConfig.magicNumber.count)
        if magicNumber != Data(bytes: Config.SeedConfig.magicNumber) {
            throw SeedError.wrongMagicNumber
        }
        
        let seedVersionEncoded = Data.varintFrom(Config.SeedConfig.version)
        
        // Verify version
        let versionData = rest.slice(start: Config.SeedConfig.magicNumber.count, end: Config.SeedConfig.magicNumber.count + seedVersionEncoded.count)
        guard let versionValue = versionData.toVarint64() else {
            throw SeedError.wrongVersion
        }
        
        if versionValue != version {
            throw SeedError.wrongVersion
        }
        
        // Verify current network
        let networkData = rest.slice(start: Config.SeedConfig.magicNumber.count + seedVersionEncoded.count,
                                 end: Config.SeedConfig.magicNumber.count + seedVersionEncoded.count + Config.SeedConfig.networkLength)
        
        guard let networkValue = networkData.toVarint64() else {
            throw SeedError.wrongNetwork
        }
        
        guard let network = Common.getNetwork(byAddressValue: networkValue) else {
            throw SeedError.wrongNetwork
        }
        
        // Get seed
        let core = rest.slice(start: Config.SeedConfig.magicNumber.count + seedVersionEncoded.count + Config.SeedConfig.networkLength,
                              end: rest.count)
        if core.count != Config.SeedConfig.length {
            throw SeedError.wrongSeedLength
        }
        
        self.core = core
        self.network = network
        self.version = version
    }
    
    public var base58String: String {
        // Contruct parts
        let magicNumber = Data(bytes: Config.SeedConfig.magicNumber)
        let currentNetwork = Data.varintFrom(self.network.addressValue)
        let seedVersionEncoded = Data.varintFrom(self.version)
        var exportedSeed = magicNumber + seedVersionEncoded + currentNetwork + self.core
        
        // Add checksum
        let checksum = exportedSeed.sha3(length: 256).slice(start: 0, end: Config.SeedConfig.checksumLength)
        exportedSeed += checksum
        return exportedSeed.base58EncodedString
    }
}

extension Seed: RawRepresentable {
    public typealias RawValue = String
    
    public init?(rawValue: String) {
        try? self.init(fromBase58: rawValue)
    }
    
    public var rawValue: String {
        return base58String
    }
}
