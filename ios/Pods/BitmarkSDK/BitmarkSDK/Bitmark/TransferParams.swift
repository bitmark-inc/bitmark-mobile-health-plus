//
//  TransferParams.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 9/23/18.
//  Copyright © 2018 Bitmark. All rights reserved.
//

import Foundation

public struct Payment: Codable {
    let currencyCode: Int
    let address: String
    let amount: Int
}

public struct TransferRequest {

    private(set) public var txId: String?          // sha3_256 of the packed record
    private(set) var preTxId: String?
    private(set) var owner: AccountNumber?        // address without checksum
    private(set) var preOwner: AccountNumber?
    private(set) var payment: Payment?
    private(set) var signature: Data?
    private(set) var isSigned = false
    private(set) var requireCountersignature = false
    
    // MARK:- Internal methods
    
    internal mutating func resetSignState() {
        self.txId = nil
        self.isSigned = false
    }
    
    internal func packRecord() throws -> Data {
        var txData: Data
        if requireCountersignature {
            txData = Data.varintFrom(Config.transferCountersignedTag)
        } else {
            txData = Data.varintFrom(Config.transferUnratifiedTag)
        }
        txData = BinaryPacking.append(toData: txData, withData: self.preTxId?.hexDecodedData)
        
        if let payment = self.payment {
            txData += Data(bytes: [0x01])
            txData += Data.varintFrom(payment.currencyCode)
            txData = BinaryPacking.append(toData: txData, withString: payment.address)
            txData += Data.varintFrom(payment.amount)
        }
        else {
            txData += Data(bytes: [0x00])
        }
        
        txData = try BinaryPacking.append(toData: txData, withData: self.owner?.pack())
        
        return txData
    }
    
    internal mutating func set(fromTx preTxId: String) {
        self.preTxId = preTxId
        resetSignState()
    }
    
    internal mutating func set(fromOwner preOwner: AccountNumber) {
        self.preOwner = preOwner
        resetSignState()
    }
    
    internal mutating func set(to address: AccountNumber) throws {
        self.owner = address
        resetSignState()
    }
    
    internal mutating func set(payment: Payment) {
        self.payment = payment
        resetSignState()
    }
    
    internal mutating func set(requireCountersignature: Bool) {
        self.requireCountersignature = requireCountersignature
        resetSignState()
    }
    
    // MARK:- Public methods
    
    public init() {}
}

extension TransferRequest: Parameterizable {
    public mutating func sign(_ signable: KeypairSignable) throws {
        if self.preTxId == nil {
            throw("Transfer error: missing previous transaction")
        }
        if self.owner == nil {
            throw( "Transfer error: missing new owner")
        }
        
        if let preOwner = preOwner {
            if preOwner != signable.address {
                throw("Transfer error: wrong key")
            }
        } else {
            self.preOwner = signable.address
        }
        
        let (networkForOwner, _) = try self.owner!.parse()
        let (networkForPreOwner, _) = try self.preOwner!.parse()
        if networkForOwner != networkForPreOwner {
            throw("Transfer error: trying to transfer bitmark to different network")
        }
        
        let packedRecord = try packRecord()
        self.signature = try signable.sign(message: packedRecord)
        let recordWithSignature = packedRecord + self.signature!
        self.txId = recordWithSignature.sha3(length: 256).hexEncodedString
        self.isSigned = true
    }
    
    public func toJSON() throws -> [String : Any] {
        if !self.isSigned {
            throw("Issue error: need to sign the record before getting RPC param")
        }
        
        return ["owner": self.owner!,
                "signature": self.signature!.hexEncodedString,
                "link": self.preTxId!]
    }
}

public struct TransferParams {
    var transfer: TransferRequest
    
    public mutating func from(bitmarkID: String) throws {
        let api = API()
        let bitmark = try api.get(bitmarkID: bitmarkID)
        self.transfer.set(fromTx: bitmark.head_id)
    }
}

extension TransferParams: Parameterizable {
    public mutating func sign(_ signable: KeypairSignable) throws {
        self.transfer.set(fromOwner: signable.address)
        try self.transfer.sign(signable)
    }
    
    public func toJSON() throws -> [String : Any] {
        let transferPayload = try self.transfer.toJSON()
        return ["transfer": transferPayload]
    }
}
