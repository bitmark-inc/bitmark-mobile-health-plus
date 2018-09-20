//
//  Transfer.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 12/23/16.
//  Copyright © 2016 Bitmark. All rights reserved.
//

import Foundation

public struct Transfer {
    
    private(set) public var txId: String?          // sha3_256 of the packed record
    private(set) var preTxId: String?
    private(set) var owner: AccountNumber?        // address without checksum
    private(set) var preOwner: AccountNumber?
    private(set) var payment: Payment?
    private(set) var signature: Data?
    private(set) var isSigned = false
    
    // MARK:- Internal methods
    
    internal mutating func resetSignState() {
        self.txId = nil
        self.isSigned = false
    }
    
    internal func packRecord() -> Data {
        var txData: Data
        txData = Data.varintFrom(Config.transferUnratifiedTag)
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
        
        txData = BinaryPacking.append(toData: txData, withData: self.owner?.pack())
        
        return txData
    }
    
    // MARK:- Public methods
    
    public init() {}
    
    public mutating func set(from preTxId: String) {
        self.preTxId = preTxId
        resetSignState()
    }
    
    public mutating func set(from preTx: Issue) {
        self.preTxId = preTx.txId
        self.preOwner = preTx.owner
        resetSignState()
    }
    
    public mutating func set(from preTx: Transfer) {
        self.preTxId = preTx.txId
        self.preOwner = preTx.owner
        resetSignState()
    }
    
    public mutating func set(to address: AccountNumber) throws {
        if let preOwner = self.preOwner {
            if address.network != preOwner.network {
                throw(BMError("Transfer error: trying to transfer bitmark to different network"))
            }
        }
        
        self.owner = address
        resetSignState()
    }
    
    public mutating func set(payment: Payment) {
        self.payment = payment
        resetSignState()
    }
    
    public mutating func sign(privateKey: AuthKey) throws {
        if self.preTxId == nil {
            throw(BMError("Transfer error: missing previous transaction"))
        }
        if self.owner == nil {
            throw(BMError( "Transfer error: missing new owner"))
        }
        
        let preOwnerFromPrivateKey = privateKey.address
        
        if let preOwner = preOwner {
            if preOwner != preOwnerFromPrivateKey {
                throw(BMError("Transfer error: wrong key"))
            }
        } else {
            self.preOwner = preOwnerFromPrivateKey
        }
        if self.owner?.network != self.preOwner?.network {
            throw(BMError("Transfer error: trying to transfer bitmark to different network"))
        }
        
        
        var recordPacked = packRecord()
        do {
            self.signature = try Ed25519.getSignature(message: recordPacked, privateKey: privateKey.privateKey)
            self.isSigned = true
            
            recordPacked = BinaryPacking.append(toData: recordPacked, withData: self.signature)
            self.txId = recordPacked.sha3(.sha256).hexEncodedString
        }
        catch {
            resetSignState()
        }
    }
}

extension Transfer {
    public func getRPCParam() throws -> [String : Any] {
        if !self.isSigned {
            throw(BMError("Transfer error: need to sign the record before getting RPC param"))
        }
        
        return ["transfer": ["owner": self.owner!.string,
                             "signature": self.signature!.hexEncodedString,
                             "link": self.preTxId!]]
    }
}

public struct Payment {
    
    let currencyCode: Int
    let address: String
    let amount: Int
    
}

public struct TransferOffer {
    internal(set) public var txId: String
    internal(set) public var payment: Payment? = nil
    internal(set) public var receiver: AccountNumber
    private(set) public var signature: Data? = nil
    
    public init(txId: String, payment: Payment? = nil, receiver: AccountNumber, signature: Data? = nil) {
        self.txId = txId
        self.payment = payment
        self.receiver = receiver
        self.signature = signature
    }
    
    internal func packRecord() -> Data {
        var txData: Data
        txData = Data.varintFrom(Config.transferCountersignedTag)
        txData = BinaryPacking.append(toData: txData, withData: self.txId.hexDecodedData)
        
        if let payment = self.payment {
            txData += Data(bytes: [0x01])
            txData += Data.varintFrom(payment.currencyCode)
            txData = BinaryPacking.append(toData: txData, withString: payment.address)
            txData += Data.varintFrom(payment.amount)
        }
        else {
            txData += Data(bytes: [0x00])
        }
        
        txData = BinaryPacking.append(toData: txData, withAccount: self.receiver)
        
        return txData
    }
    
    internal mutating func sign(withSender senderAccount: Account) throws {
        let pack = self.packRecord()
        self.signature = try senderAccount.authKey.sign(message: pack)
    }
}

extension TransferOffer {
    public func serialize() throws -> [String : String] {
        return ["link": self.txId,
                "owner": self.receiver.string,
                "signature": self.signature!.hexEncodedString]
    }
}

extension TransferOffer: Encodable {
    enum TransferOfferKeys: String, CodingKey {
        case link = "link"
        case owner = "owner"
        case signature = "signature"
    }
    
    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: TransferOfferKeys.self)
        try container.encode(self.txId, forKey: .link)
        try container.encode(self.receiver.string, forKey: .owner)
        try container.encode(self.signature!.hexEncodedString, forKey: .signature)
    }
}

public struct CountersignedTransferRecord {
    internal(set) public var offer: TransferOffer
    private(set) public var counterSignature: Data? = nil
    
    public init(offer: TransferOffer) {
        self.offer = offer
    }
    
    internal func packRecord() -> Data {
        var txData: Data
        txData = Data.varintFrom(Config.transferCountersignedTag)
        txData = BinaryPacking.append(toData: txData, withData: offer.txId.hexDecodedData)
        
        if let payment = offer.payment {
            txData += Data(bytes: [0x01])
            txData += Data.varintFrom(payment.currencyCode)
            txData = BinaryPacking.append(toData: txData, withString: payment.address)
            txData += Data.varintFrom(payment.amount)
        }
        else {
            txData += Data(bytes: [0x00])
        }
        
        txData = BinaryPacking.append(toData: txData, withAccount: offer.receiver)
        txData = BinaryPacking.append(toData: txData, withData: offer.signature)
        
        return txData
    }
    
    internal mutating func sign(withReceiver receiverAccount: Account) throws {
        let pack = self.packRecord()
        self.counterSignature = try receiverAccount.authKey.sign(message: pack)
    }
}

extension CountersignedTransferRecord: Encodable {
    enum SessionDataKeys: String, CodingKey {
        case link = "link"
        case owner = "owner"
        case signature = "signature"
        case countersignature = "countersignature"
    }
    
    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: SessionDataKeys.self)
        try container.encode(self.offer.txId, forKey: .link)
        try container.encode(self.offer.receiver.string, forKey: .owner)
        try container.encode(self.offer.signature?.hexEncodedString, forKey: .signature)
        try container.encode(self.counterSignature?.hexEncodedString, forKey: .countersignature)
    }
}
