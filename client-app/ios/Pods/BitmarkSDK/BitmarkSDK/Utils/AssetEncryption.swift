//
//  AssetEncryption.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 11/2/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

import Foundation
import CryptoSwift
import TweetNacl

struct AssetEncryption {

    let key: Data
    private let nonce = Data(bytes: Array<UInt8>(repeating: 0x00, count: 12))
    
    init() throws {
        let key = Common.randomBytes(length: 32)
        try self.init(key: key)
    }
    
    init(key: Data) throws {
        if key.count != 32 {
            throw(BMError("Invalid key length for chacha20, actual count: \(key.count)"))
        }
        self.key = key
    }
    
    func encrypt(data: Data, signWithAccount account: Account) throws -> (encryptedData: Data, sessionData: SessionData) {
        let encryptedData = try Chacha20Poly1305.seal(withKey: key, nonce: nonce, plainText: data, additionalData: nil)
        
        return (encryptedData,
                try SessionData.createSessionData(account: account,
                                      sessionKey: key,
                                      forRecipient: account.encryptionKey.publicKey))
    }
    
    func decypt(data: Data) throws -> Data {
        return try Chacha20Poly1305.open(withKey: key, nonce: nonce, cipherText: data, additionalData: nil)
    }
}

extension AssetEncryption {
    static func encryptionKey(fromSessionData sessionData: SessionData, account: Account, senderEncryptionPublicKey: Data) throws -> AssetEncryption {
        // Decrypt message
        let key = try account.encryptionKey.decrypt(encryptedMessage: sessionData.encryptedDataKey, peerPublicKey: senderEncryptionPublicKey)
        
        return try AssetEncryption(key: key)
    }
}
