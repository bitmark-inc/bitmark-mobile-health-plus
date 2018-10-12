//
//  Keypair.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 11/2/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

import Foundation
import TweetNacl

// Just for the information?
enum Algorithm {
    case ed25519
    case curve25519
}

protocol AsymmetricKey {
    var privateKey: Data {get}
    var publicKey: Data {get}
    var algorithm: Algorithm {get}
}

struct EncryptionKey: AsymmetricKey {
    let privateKey: Data
    let publicKey: Data
    let algorithm = Algorithm.curve25519
}

extension EncryptionKey {
    func publicKeyEncrypt(message: Data, withRecipient senderPublicKey: Data) throws -> Data {
        let nonce = Common.randomBytes(length: 24)
        let encryptedMessageWithoutNonce = try TweetNacl.NaclBox.box(message: message, nonce: nonce, publicKey: senderPublicKey, secretKey: privateKey)
        return nonce + encryptedMessageWithoutNonce
    }
    
    func decrypt(encryptedMessage: Data, peerPublicKey: Data) throws -> Data {
        let nonce = encryptedMessage.subdata(in: 0..<24)
        let message = encryptedMessage.subdata(in: 24..<encryptedMessage.count)
        return try TweetNacl.NaclBox.open(message: message, nonce: nonce, publicKey: peerPublicKey, secretKey: privateKey)
    }
}
