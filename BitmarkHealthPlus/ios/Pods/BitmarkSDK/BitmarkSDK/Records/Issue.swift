//
//  Issue.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 12/23/16.
//  Copyright © 2016 Bitmark. All rights reserved.
//

import Foundation

public struct Issue {
    
    private(set) var asset: Asset?
    private(set) var nonce: UInt64?
    private(set) var signature: Data?
    private(set) var isSigned = false
    private(set) public var txId: String?
    private(set) var owner: AccountNumber?
    
    // MARK:- Internal methods
    
    internal mutating func resetSignState() {
        self.txId = nil
        self.isSigned = false
    }
    
    internal func packRecord() -> Data {
        var txData: Data
        txData = Data.varintFrom(Config.issueTag)
        txData = BinaryPacking.append(toData: txData, withData: self.asset?.id?.hexDecodedData)
        txData = BinaryPacking.append(toData: txData, withData: self.owner?.pack())
        
        if let nonce = self.nonce {
            
            return txData + Data.varintFrom(nonce)
        }
        else {
            return txData
        }
    }
    
    // MARK:- Public methods
    
    public init() {}
    
    public mutating func set(asset: Asset) {
        self.asset = asset
        resetSignState()
    }
    
    public mutating func set(nonce: Data) {
        self.nonce = nonce.toVarint64()
        resetSignState()
    }
    
    public mutating func set(nonce: UInt64) {
        self.nonce = nonce
        resetSignState()
    }
    
    public mutating func sign(privateKey: AuthKey) throws {
        if self.asset == nil {
            throw(BMError("Issue error: missing asset"))
        }
        if self.nonce == nil {
            throw(BMError("Issue error: missing nonce"))
        }
        
        self.owner = privateKey.address
        
        var recordPacked = packRecord()
        self.signature = try Ed25519.getSignature(message: recordPacked, privateKey: privateKey.privateKey)
        
        recordPacked = BinaryPacking.append(toData: recordPacked, withData: self.signature)
        self.txId = recordPacked.sha3(.sha256).hexEncodedString
        self.isSigned = true
    }
}

extension Issue {
    public func getRPCParam() throws -> [String : Any] {
        if !self.isSigned {
            throw(BMError("Issue error: need to sign the record before getting RPC param"))
        }
        
        return ["owner": self.owner!.string,
                "signature": self.signature!.hexEncodedString,
                "asset": self.asset!.id!,
                "nonce": self.nonce!]
    }
}
