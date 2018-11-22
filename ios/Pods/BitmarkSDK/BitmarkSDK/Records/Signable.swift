//
//  Signable.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 8/28/18.
//  Copyright © 2018 Bitmark. All rights reserved.
//

import Foundation

public protocol KeypairSignable {
    func sign(message: Data) throws -> Data
    var publicKey: Data { get }
    var address: AccountNumber { get }
}
