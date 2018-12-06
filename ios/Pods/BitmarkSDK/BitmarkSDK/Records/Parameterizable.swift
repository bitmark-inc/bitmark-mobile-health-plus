//
//  Parameterizable.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 8/28/18.
//  Copyright © 2018 Bitmark. All rights reserved.
//

import Foundation

public protocol Parameterizable {
    mutating func sign(_ signable: KeypairSignable) throws
    func toJSON() throws -> [String: Any]
}
