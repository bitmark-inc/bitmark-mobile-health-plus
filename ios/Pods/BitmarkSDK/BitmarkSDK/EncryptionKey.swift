//
//  EncryptionKey.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 12/7/18.
//  Copyright © 2018 Bitmark. All rights reserved.
//

import Foundation
import TweetNacl

public struct EncryptionKey: KeypairEncryptable {
    let privateKey: Data
    public let publicKey: Data
    
    public init(privateKey: Data) throws {
        self.privateKey = privateKey
        self.publicKey = try TweetNacl.NaclScalarMult.base(n: privateKey)
    }
    
    public func encrypt(message: Data, receiverPublicKey: Data) throws -> Data {
        let nonce = Common.randomBytes(length: 24)
        let encryptedMessageWithoutNonce = try TweetNacl.NaclBox.box(message: message, nonce: nonce, publicKey: receiverPublicKey, secretKey: privateKey)
        return nonce + encryptedMessageWithoutNonce
    }
    
    public func decrypt(cipher: Data, senderPublicKey: Data) throws -> Data {
        let nonce = cipher.subdata(in: 0..<24)
        let message = cipher.subdata(in: 24..<cipher.count)
        return try TweetNacl.NaclBox.open(message: message, nonce: nonce, publicKey: senderPublicKey, secretKey: privateKey)
    }
}
