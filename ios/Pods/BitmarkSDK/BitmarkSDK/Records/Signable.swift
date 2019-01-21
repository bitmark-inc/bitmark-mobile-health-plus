//
//  Signable.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 8/28/18.
//  Copyright © 2018 Bitmark. All rights reserved.
//

import Foundation

public protocol Keypair {
    init(privateKey: Data) throws
    var publicKey: Data { get }
}

public protocol KeypairSignable: Keypair {
    var address: AccountNumber { get }
    func sign(message: Data) throws -> Data
}

public protocol KeypairEncryptable: Keypair {
    func encrypt(message: Data, receiverPublicKey: Data) throws -> Data
    func decrypt(cipher: Data, senderPublicKey: Data) throws -> Data
}
