//
//  OfferParams.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 9/24/18.
//  Copyright © 2018 Bitmark. All rights reserved.
//

import Foundation

public struct Offer {
    var transfer: TransferRequest
    let extraInfo: [String: Any]?
}

extension Offer: Parameterizable {
    public mutating func sign(_ signable: KeypairSignable) throws {
        var transfer = self.transfer
        transfer.set(fromOwner: signable.address)
        try transfer.sign(signable)
        self.transfer = transfer
    }
    
    public func toJSON() throws -> [String : Any] {
        if let extraInfo = self.extraInfo {
            return ["record": try self.transfer.toJSON(),
                    "extra_info": extraInfo]
        } else {
            return ["record": try self.transfer.toJSON(),
                    "extra_info": [String:String]()]
        }
    }
}

public struct OfferParams {
    var offer: Offer
    
    public mutating func from(bitmarkID: String) throws {
        let api = API()
        let bitmark = try api.get(bitmarkID: bitmarkID)
        self.offer.transfer.set(fromTx: bitmark.head_id)
    }
}

extension OfferParams: Parameterizable {
    public mutating func sign(_ signable: KeypairSignable) throws {
        var offer = self.offer
        try offer.sign(signable)
        self.offer = offer
    }
    
    public func toJSON() throws -> [String : Any] {
        return ["offer": try offer.toJSON()]
    }
}

public enum CountersignedTransferAction: String {
    case accept = "accept"
    case reject = "reject"
}

public struct CountersignedTransferRequest: Codable {
    let link: String
    let owner: String
    let signature: String
    var counterSignature: String?
    let payment: Payment?
    
    internal func packRecord(withReceiver receiver: AccountNumber) throws -> Data {
        var txData: Data
        txData = Data.varintFrom(Config.transferCountersignedTag)
        txData = BinaryPacking.append(toData: txData, withData: link.hexDecodedData)
        
        if let payment = payment {
            txData += Data(bytes: [0x01])
            txData += Data.varintFrom(payment.currencyCode)
            txData = BinaryPacking.append(toData: txData, withString: payment.address)
            txData += Data.varintFrom(payment.amount)
        }
        else {
            txData += Data(bytes: [0x00])
        }
        
        txData = try BinaryPacking.append(toData: txData, withAccount: receiver)
        txData = BinaryPacking.append(toData: txData, withData: signature.hexDecodedData)
        
        return txData
    }

}

extension CountersignedTransferRequest: Parameterizable {
    public mutating func sign(_ signable: KeypairSignable) throws {
        let message = try self.packRecord(withReceiver: signable.address)
        self.counterSignature = try signable.sign(message: message).hexEncodedString
    }
    
    public func toJSON() throws -> [String : Any] {
        guard let counterSignature = counterSignature else {
            throw("Need to sign first")
        }
        
        return ["link": link,
                "owner": owner,
                "signature": signature,
                "counterSignature": counterSignature]
    }
}

public struct OfferResponseParams {
    let id: String
    let action: CountersignedTransferAction
    var record: CountersignedTransferRequest
    var counterSignature: String?
    var apiHeader: [String: String]? = nil
}

extension OfferResponseParams: Parameterizable {
    public mutating func sign(_ signable: KeypairSignable) throws {
        try self.record.sign(signable)
        self.counterSignature = self.record.counterSignature
        let timestamp = Common.timestamp()
        
        let parts = ["updateOffer",
                     self.id,
                     signable.address,
                     timestamp]
        let message = parts.joined(separator: "|")
        let signature = try signable.sign(message: message.data(using: .utf8)!)
        
        apiHeader = ["requester": String(signable.address),
                     "timestamp": timestamp,
                     "signature": signature.hexEncodedString]
    }
    
    public func toJSON() throws -> [String : Any] {
        return ["id": id,
                "action": action.rawValue,
                "countersignature": counterSignature!]
    }
}
