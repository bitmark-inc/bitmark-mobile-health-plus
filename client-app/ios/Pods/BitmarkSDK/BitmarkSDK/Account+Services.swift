//
//  Account+Services.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 10/31/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

import Foundation

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
    
    public func transferBitmark(bitmarkId: String,
                                toAccount recipient: String) throws -> Bool {
        
        let network = self.authKey.network
        let api = API(network: network)
        
        // Get asset's access information
        guard let assetAccess = try api.getAssetAccess(account: self, bitmarkId: bitmarkId) else {
            return false
        }
        
        if assetAccess.sessionData != nil {
            let senderEncryptionPublicKey = self.encryptionKey.publicKey.hexEncodedString
            
            let assetEnryption = try AssetEncryption.encryptionKey(fromSessionData: assetAccess.sessionData!,
                                                                   account: self,
                                                                   senderEncryptionPublicKey: senderEncryptionPublicKey.hexDecodedData)
            
            guard let recipientEncrPubkey = try api.getEncryptionPublicKey(accountNumber: recipient) else {
                return false
            }
            
            let sessionData = try SessionData.createSessionData(account: self,
                                                                sessionKey: assetEnryption.key, forRecipient: recipientEncrPubkey.hexDecodedData)
            
            let result = try api.updateSession(account: self, bitmarkId: bitmarkId, recipient: recipient, sessionData: sessionData)
            if result == false {
                print("Fail to update session data")
                return false
            }
        }
        
        var transfer = Transfer()
        transfer.set(from: bitmarkId)
        try transfer.set(to: try AccountNumber(address: recipient))
        try transfer.sign(privateKey: self.authKey)
        
        return try api.transfer(withData: transfer)
    }
    
    public func issueThenTransfer(assetFile url: URL,
                                  accessibility: Accessibility = .publicAsset,
                                  propertyName name: String,
                                  propertyMetadata metadata: [String: String]? = nil,
                                  toAccount recipient: String) throws -> (Issue, Asset)? {
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
            print("Failed to upload assets")
            return nil
        }
        
        // Generate the bitmark issue object with the dedicated assets.
        var issue = Issue()
        issue.set(nonce: UInt64(arc4random()))
        issue.set(asset: asset)
        try issue.sign(privateKey: self.authKey)
        
        guard let bitmarkId = issue.txId else {
            return nil
        }
        
        // create session data for the receiver, and set session data from the `/v2/session` api.
        if let sessionData = sessionData,
            accessibility == .privateAsset {
            
            let senderEncryptionPublicKey = self.encryptionKey.publicKey.hexEncodedString
            
            let assetEnryption = try AssetEncryption.encryptionKey(fromSessionData: sessionData,
                                                                   account: self,
                                                                   senderEncryptionPublicKey: senderEncryptionPublicKey.hexDecodedData)
            
            guard let recipientEncrPubkey = try api.getEncryptionPublicKey(accountNumber: recipient) else {
                return nil
            }
            
            let sessionData = try SessionData.createSessionData(account: self,
                                                                sessionKey: assetEnryption.key, forRecipient: recipientEncrPubkey.hexDecodedData)
            
            let result = try api.updateSession(account: self, bitmarkId: bitmarkId, recipient: recipient, sessionData: sessionData, withIssue: issue)
            if result == false {
                print("Fail to update session data")
                return nil
            }
        }
        
        // Transfer records
        var transfer = Transfer()
        transfer.set(from: bitmarkId)
        try transfer.set(to: try AccountNumber(address: recipient))
        try transfer.sign(privateKey: self.authKey)
        
        let issueSuccess = try api.issue(withIssues: [issue], assets: [asset], transfer: transfer)
        if !issueSuccess {
            return nil
        }
        
        return (issue, asset)
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
            var senderEncryptionPublicKey = self.encryptionKey.publicKey.hexEncodedString
            
            if let sender = assetAccess.sender,
             let senderEncryptionPublicKeyFromAPI = try api.getEncryptionPublicKey(accountNumber: sender) {
                senderEncryptionPublicKey = senderEncryptionPublicKeyFromAPI
            }

            let assetEnryption = try AssetEncryption.encryptionKey(fromSessionData: assetAccess.sessionData!,
                                                                   account: self,
                                                                   senderEncryptionPublicKey: senderEncryptionPublicKey.hexDecodedData)

            guard let recipientEncrPubkey = try api.getEncryptionPublicKey(accountNumber: recipient) else {
                throw("Fail to parse receiver's encryption public key")
            }

            let sessionData = try SessionData.createSessionData(account: self,
                                                                sessionKey: assetEnryption.key, forRecipient: recipientEncrPubkey.hexDecodedData)

            let result = try api.updateSession(account: self, bitmarkId: bitmarkId, recipient: recipient, sessionData: sessionData)
            if result == false {
                throw("Fail to update session data")
            }
        }
        
        guard let bitmarkInfo = try api.bitmarkInfo(bitmarkId: bitmarkId) else {
            throw("Fail to get bitmark info")
        }
        
        var transfer = TransferOffer(txId: bitmarkInfo.headId, receiver: try AccountNumber(address: recipient))
        try transfer.sign(withSender: self)
        
        return transfer;
    }
    
    public func createSignForTransferOffer(offer: TransferOffer) throws -> CountersignedTransferRecord {
        var counterSign = CountersignedTransferRecord(offer: offer)
        try counterSign.sign(withReceiver: self)
        return counterSign
    }
    
    public func processTransferOffer(offer: TransferOffer) throws -> String {
        let countersign = try createSignForTransferOffer(offer: offer)
        
        let network = self.authKey.network
        let api = API(network: network)
        
        return try api.transfer(withData: countersign)
    }
}

extension String: Error {
    
}
