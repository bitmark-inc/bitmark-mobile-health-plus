//
//  IssueRequest.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 9/21/18.
//  Copyright © 2018 Bitmark. All rights reserved.
//

import Foundation

public struct IssueRequest {
    
    private(set) var assetId: String?
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
    
    internal func packRecord() throws -> Data {
        var txData: Data
        txData = Data.varintFrom(Config.issueTag)
        txData = BinaryPacking.append(toData: txData, withData: self.assetId?.hexDecodedData)
        txData = BinaryPacking.append(toData: txData, withData: try self.owner?.pack())
        
        if let nonce = self.nonce {
            
            return txData + Data.varintFrom(nonce)
        }
        else {
            return txData
        }
    }
    
    internal mutating func set(assetId: String) {
        self.assetId = assetId
        resetSignState()
    }
    
    internal mutating func set(nonce: Data) {
        self.nonce = nonce.toVarint64()
        resetSignState()
    }
    
    internal mutating func set(nonce: UInt64) {
        self.nonce = nonce
        resetSignState()
    }
    
    // MARK:- Public methods
    
    public init() {}
}

extension IssueRequest: Parameterizable {
    public mutating func sign(_ signable: KeypairSignable) throws {
        if self.assetId == nil {
            throw("Issue error: missing asset")
        }
        if self.nonce == nil {
            throw("Issue error: missing nonce")
        }
        
        self.owner = signable.address
        
        var recordPacked = try packRecord()
        self.signature = try signable.sign(message: recordPacked)
        
        recordPacked = BinaryPacking.append(toData: recordPacked, withData: self.signature)
        self.txId = recordPacked.sha3(length: 256).hexEncodedString
        self.isSigned = true
    }
    
    public func toJSON() throws -> [String : Any] {
        if !self.isSigned {
            throw("Issue error: need to sign the record before getting RPC param")
        }
        
        return ["owner": self.owner!,
                "signature": self.signature!.hexEncodedString,
                "asset_id": self.assetId!,
                "nonce": self.nonce!]
    }
}

public struct IssuanceParams {
    var issuances: [IssueRequest]
}

extension IssuanceParams: Parameterizable {
    public mutating func sign(_ signable: KeypairSignable) throws {
        var signedIssuances = [IssueRequest]()
        for issueRequest in issuances {
            var signIssueRequest = issueRequest
            try signIssueRequest.sign(signable)
            signedIssuances.append(signIssueRequest)
        }
        self.issuances = signedIssuances
    }
    
    public func toJSON() throws -> [String : Any] {
        let issuePayloads = try issuances.map {try $0.toJSON()}
        return ["issues": issuePayloads]
    }
}
