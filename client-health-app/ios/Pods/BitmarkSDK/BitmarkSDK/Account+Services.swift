//
//  Account+Services.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 10/31/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

import Foundation

public enum TransferOfferAction: String {
    case accept = "accept"
    case reject = "reject"
}

public extension Account {
    
    public func issueBitmarks(assetFile url: URL,
                              accessibility: Accessibility = .publicAsset,
                              propertyName name: String,
                              propertyMetadata metadata: [String: String]? = nil,
                              quantity: Int = 1) throws -> ([Issue], Asset) {
        let data = try Data(contentsOf: url)
        let fileName = url.lastPathComponent
        let network = self.authKey.network
        let fingerprint = FileUtil.Fingerprint.computeFingerprint(data: data)
        var asset = Asset()
        try asset.set(name: name)
        try asset.set(fingerPrint: fingerprint)
        if let metadata = metadata {
            try asset.set(metadata: metadata)
        }
        try asset.sign(withPrivateKey: self.authKey)
        
        var issues = [Issue]()
        for _ in 0..<quantity {
            var issue = Issue()
            issue.set(nonce: UInt64(arc4random()))
            issue.set(asset: asset)
            try issue.sign(privateKey: self.authKey)
            issues.append(issue)
        }
        
        // Upload asset
        let api = API(network: network)
        
        let (_, uploadSuccess) = try api.uploadAsset(data: data, fileName: fileName, assetId: asset.id!, accessibility: accessibility, fromAccount: self)
        
        if !uploadSuccess {
            throw("Failed to upload assets")
        }
        
        let issueSuccess = try api.issue(withIssues: issues, assets: [asset])
        if !issueSuccess {
            throw("Fail to issue bitmark")
        }
        
        return (issues, asset)
    }
    
    public func issueBitmarks(fingerprint: String,
                              propertyName name: String,
                              propertyMetadata metadata: [String: String]? = nil,
                              quantity: Int = 1) throws -> ([Issue], Asset) {
        var asset = Asset()
        try asset.set(name: name)
        try asset.set(fingerPrint: fingerprint)
        if let metadata = metadata {
            try asset.set(metadata: metadata)
        }
        try asset.sign(withPrivateKey: self.authKey)
        
        var issues = [Issue]()
        for _ in 0..<quantity {
            var issue = Issue()
            issue.set(nonce: UInt64(arc4random()))
            issue.set(asset: asset)
            try issue.sign(privateKey: self.authKey)
            issues.append(issue)
        }
        
        let network = self.authKey.network
        let api = API(network: network)
        let issueSuccess = try api.issue(withIssues: issues, assets: [asset])
        if !issueSuccess {
            throw("Fail to issue bitmark")
        }
        
        return (issues, asset)
    }
    
    public func transferBitmark(bitmarkId: String,
                                toAccount recipient: String) throws -> Bool {
        
        let network = self.authKey.network
        let api = API(network: network)
        
        // Get asset's access information
        guard let assetAccess = try api.getAssetAccess(account: self, bitmarkId: bitmarkId) else {
            return false
        }
        
        if assetAccess.sessionData != nil {
            try updateSessionData(bitmarkId: bitmarkId, sessionData: assetAccess.sessionData!, sender: assetAccess.sender!, recipient: recipient)
        }
        
        var transfer = Transfer()
        guard let bitmarkInfo = try api.bitmarkInfo(bitmarkId: bitmarkId) else {
            throw("Cannot find bitmark with id:" + bitmarkId)
        }
        transfer.set(from: bitmarkInfo.headId)
        try transfer.set(to: try AccountNumber(address: recipient))
        try transfer.sign(privateKey: self.authKey)
        
        return try api.transfer(withData: transfer)
    }
    
    public func createGiveawayIssue(assetFile url: URL,
                                    accessibility: Accessibility = .publicAsset,
                                    propertyName name: String,
                                    propertyMetadata metadata: [String: String]? = nil,
                                    toAccount recipient: String) throws -> (SessionData?, TransferOffer) {
        let data = try Data(contentsOf: url)
        let fileName = url.lastPathComponent
        let network = self.authKey.network
        let fingerprint = FileUtil.Fingerprint.computeFingerprint(data: data)
        var asset = Asset()
        try asset.set(name: name)
        try asset.set(fingerPrint: fingerprint)
        if let metadata = metadata {
            try asset.set(metadata: metadata)
        }
        try asset.sign(withPrivateKey: self.authKey)
        
        // upload the assets with the owner’s session data attached.
        let api = API(network: network)
        
        let (sessionData, uploadSuccess) = try api.uploadAsset(data: data, fileName: fileName, assetId: asset.id!, accessibility: accessibility, fromAccount: self)
        
        if !uploadSuccess {
            throw("Failed to upload assets")
        }
        
        // Generate the bitmark issue object with the dedicated assets.
        var issue = Issue()
        issue.set(nonce: UInt64(arc4random()))
        issue.set(asset: asset)
        try issue.sign(privateKey: self.authKey)
        
        let issueSuccess = try api.issue(withIssues: [issue], assets: [asset])
        if !issueSuccess {
            throw("Fail to issue bitmark")
        }
        
        guard let bitmarkId = issue.txId else {
            throw("Fail to get bitmark id")
        }
        
        var newSessionData = sessionData
        if let sessionData = sessionData {
            newSessionData = try updatedSessionData(bitmarkId: bitmarkId, sessionData: sessionData, sender: self.accountNumber.string, recipient: recipient)
        }
        
        // Transfer records
        var transfer = TransferOffer(txId: bitmarkId, receiver: try AccountNumber(address: recipient))
        try transfer.sign(withSender: self)
        
        return (newSessionData, transfer)
    }
    
    public func createAndSubmitGiveawayIssue(assetFile url: URL,
                                             accessibility: Accessibility = .publicAsset,
                                             propertyName name: String,
                                             propertyMetadata metadata: [String: String]? = nil,
                                             toAccount recipient: String,
                                             extraInfo: [String: Any]? = nil) throws -> String {
        let data = try Data(contentsOf: url)
        let fileName = url.lastPathComponent
        let network = self.authKey.network
        let fingerprint = FileUtil.Fingerprint.computeFingerprint(data: data)
        var asset = Asset()
        try asset.set(name: name)
        try asset.set(fingerPrint: fingerprint)
        if let metadata = metadata {
            try asset.set(metadata: metadata)
        }
        try asset.sign(withPrivateKey: self.authKey)
        
        // upload the assets with the owner’s session data attached.
        let api = API(network: network)
        
        let (sessionData, uploadSuccess) = try api.uploadAsset(data: data, fileName: fileName, assetId: asset.id!, accessibility: accessibility, fromAccount: self)
        
        if !uploadSuccess {
            throw("Failed to upload assets")
        }
        
        // Generate the bitmark issue object with the dedicated assets.
        var issue = Issue()
        issue.set(nonce: UInt64(arc4random()))
        issue.set(asset: asset)
        try issue.sign(privateKey: self.authKey)
        
        guard let bitmarkId = issue.txId else {
            throw("Fail to get bitmark id")
        }
        
        var newSessionData = sessionData
        if let sessionData = sessionData {
            newSessionData = try updatedSessionData(bitmarkId: bitmarkId, sessionData: sessionData, sender: self.accountNumber.string, recipient: recipient)
        }
        
        // Transfer records
        var transfer = TransferOffer(txId: bitmarkId, receiver: try AccountNumber(address: recipient))
        try transfer.sign(withSender: self)
        
        let ressult = try api.issueV2(withAccount: self, issues: [issue], assets: [asset], transferOffer: transfer, sessionData: newSessionData, extraInfo: extraInfo)
        if !ressult {
            throw("fail to give away issue")
        }
        
        return bitmarkId
    }
    
    public func downloadAsset(bitmarkId: String) throws -> (String?, Data?) {
        let network = self.authKey.network
        let api = API(network: network)
        guard let access = try api.getAssetAccess(account: self, bitmarkId: bitmarkId) else {
            return (nil, nil)
        }
        
        let r = try api.getAssetContent(url: access.url)
        guard let content = r.1 else {
                return (nil, nil)
        }
        let filename = r.0
        
        guard let sessionData = access.sessionData,
            let sender = access.sender else {
                return (filename, content)
        }
        
        let senderEncryptionPublicKey = try api.getEncryptionPublicKey(accountNumber: sender)
        let dataKey = try AssetEncryption.encryptionKey(fromSessionData: sessionData, account: self, senderEncryptionPublicKey: senderEncryptionPublicKey!.hexDecodedData)
        let decryptedData = try dataKey.decypt(data: content)
        return (filename, decryptedData)
    }
    
    public func registerPublicEncryptionKey() throws -> Bool {
        let network = self.authKey.network
        let api = API(network: network)
        return try api.registerEncryptionPublicKey(forAccount: self)
    }
    
    public func createTransferOffer(bitmarkId: String, recipient: String) throws -> TransferOffer {
        let network = self.authKey.network
        let api = API(network: network)
        
        // Get asset's access information
        guard let assetAccess = try api.getAssetAccess(account: self, bitmarkId: bitmarkId) else {
            throw("Fail to get asset's access")
        }

        if assetAccess.sessionData != nil {
            try updateSessionData(bitmarkId: bitmarkId, sessionData: assetAccess.sessionData!, sender: assetAccess.sender!, recipient: recipient)
        }
        
        guard let bitmarkInfo = try api.bitmarkInfo(bitmarkId: bitmarkId) else {
            throw("Fail to get bitmark info")
        }
        
        var transfer = TransferOffer(txId: bitmarkInfo.headId, receiver: try AccountNumber(address: recipient))
        try transfer.sign(withSender: self)
        
        return transfer;
    }
    
    public func createAndSubmitTransferOffer(bitmarkId: String, recipient: String, extraInfo: [String: Any]? = nil) throws -> String {
        let network = self.authKey.network
        let api = API(network: network)
        
        let offer = try createTransferOffer(bitmarkId: bitmarkId, recipient: recipient)
        
        return try api.submitTransferOffer(withSender: self, offer: offer, extraInfo: extraInfo)
    }
    
    public func cancelTransferOffer(offerId: String) throws -> Bool {
        let network = self.authKey.network
        let api = API(network: network)
        
        let offer = try api.getTransferOffer(withId: offerId)
        
        let counterSign = try createCounterSign(offer: offer)
        
        return try api.completeTransferOffer(withAccount: self,
                                             offerId: offerId,
                                             action: "cancel",
                                             counterSignature: counterSign.counterSignature!.hexEncodedString)
    }
    
    public func createCounterSign(offer: TransferOffer) throws -> CountersignedTransferRecord {
        var counterSign = CountersignedTransferRecord(offer: offer)
        try counterSign.sign(withReceiver: self)
        return counterSign
    }
    
    public func signForTransferOfferAndSubmit(offerId: String, action: TransferOfferAction) throws -> Bool {
        let network = self.authKey.network
        let api = API(network: network)
        
        let offer = try api.getTransferOffer(withId: offerId)
        
        let counterSign = try createCounterSign(offer: offer)
        
        return try api.completeTransferOffer(withAccount: self, offerId: offerId, action: action.rawValue, counterSignature: counterSign.counterSignature!.hexEncodedString)
    }
    
    public func signForTransferOfferAndSubmit(offerId: String, offer: TransferOffer, action: String) throws -> Bool {
        let network = self.authKey.network
        let api = API(network: network)
        
        let counterSign = try createCounterSign(offer: offer)
        
        return try api.completeTransferOffer(withAccount: self, offerId: offerId, action: action, counterSignature: counterSign.counterSignature!.hexEncodedString)
    }
    
    public func processTransferOffer(offer: TransferOffer) throws -> String {
        let countersign = try createCounterSign(offer: offer)
        
        let network = self.authKey.network
        let api = API(network: network)
        
        return try api.transfer(withData: countersign)
    }
    
    public func createSessionData(encryptionKey: String)throws -> [String: String] {
        let network = self.authKey.network
        let api = API(network: network)
        
        let key = encryptionKey.hexDecodedData
        
        let sessionData = try api.createSessionData(key: key, fromAccount: self)
        return sessionData.serialize()
    }
}

extension Account {
    private func updateSessionData(bitmarkId: String, sessionData: SessionData, sender: String, recipient: String) throws {
        let network = self.authKey.network
        let api = API(network: network)
        
        let updatedSession = try self.updatedSessionData(bitmarkId: bitmarkId, sessionData: sessionData, sender: sender, recipient: recipient)
        
        let result = try api.updateSession(account: self, bitmarkId: bitmarkId, recipient: recipient, sessionData: updatedSession)
        if result == false {
            throw("Fail to update session data")
        }
    }
    
    private func updatedSessionData(bitmarkId: String, sessionData: SessionData, sender: String, recipient: String) throws -> SessionData {
        let network = self.authKey.network
        let api = API(network: network)
        
        var senderEncryptionPublicKey = self.encryptionKey.publicKey.hexEncodedString
        
        if let senderEncryptionPublicKeyFromAPI = try api.getEncryptionPublicKey(accountNumber: sender) {
            senderEncryptionPublicKey = senderEncryptionPublicKeyFromAPI
        }
        
        let assetEnryption = try AssetEncryption.encryptionKey(fromSessionData: sessionData,
                                                               account: self,
                                                               senderEncryptionPublicKey: senderEncryptionPublicKey.hexDecodedData)
        
        guard let recipientEncrPubkey = try api.getEncryptionPublicKey(accountNumber: recipient) else {
            throw("Fail to parse receiver's encryption public key")
        }
        
        let sessionData = try SessionData.createSessionData(account: self,
                                                            sessionKey: assetEnryption.key, forRecipient: recipientEncrPubkey.hexDecodedData)
        
        return sessionData
    }
}

extension String: Error {
    
}
