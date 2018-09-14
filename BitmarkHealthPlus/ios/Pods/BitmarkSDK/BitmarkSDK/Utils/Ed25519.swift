//
//  Ed25519.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 12/20/16.
//  Copyright © 2016 Bitmark. All rights reserved.
//

import Foundation
import TweetNacl

class Ed25519 {
    
    static func generateKeyPair() throws -> (publicKey: Data, privateKey: Data) {
        let keyPair = try NaclSign.KeyPair.keyPair()
        return (keyPair.publicKey, keyPair.secretKey)
    }
    
    static func generateKeyPair(fromSeed seed: Data) throws -> (publicKey: Data, privateKey: Data) {
        let keyPair = try NaclSign.KeyPair.keyPair(fromSeed: seed)
        return (keyPair.publicKey, keyPair.secretKey)
    }
    
    static func getSeed(fromPrivateKey privateKey: Data) throws -> Data {
        return privateKey.slice(start: 0, end: KeyType.ed25519.seedLength)
    }
    
    static func generateKeyPair(fromPrivateKey privateKey: Data) throws -> (publicKey: Data, privateKey: Data) {
        let keyPair = try NaclSign.KeyPair.keyPair(fromSecretKey: privateKey)
        return (keyPair.publicKey, keyPair.secretKey)
    }
    
    static func getSignature(message: Data, privateKey: Data) throws -> Data {
        let signature = try NaclSign.signDetached(message: message, secretKey: privateKey)
        return signature
    }
}
