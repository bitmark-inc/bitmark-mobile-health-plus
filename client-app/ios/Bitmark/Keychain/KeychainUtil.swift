//
//  KeychainUtil.swift
//  Bitmark
//
//  Created by Anh Nguyen on 1/29/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

import Foundation
import KeychainAccess

struct KeychainUtil {

  private static let bitmarkSeedCoreKey = "bitmark_core"
  
  static func getKeychain() -> Keychain {
    return Keychain(service: "com.bitmark.bitmarkios.account",
                    accessGroup: "Z5CE7A3A7N.com.bitmark.bitmarkios") // Z5CE7A3A7N is the app prefix
            .accessibility(.whenPasscodeSetThisDeviceOnly, authenticationPolicy: .userPresence)
            .authenticationPrompt("Allow bitmark app access to your account")
  }
  
  static func saveCore(_ core: Data) throws {
    return try getKeychain().set(core, key: bitmarkSeedCoreKey)
  }
  
  static func getCore() throws -> Data? {
    return try getKeychain().getData(bitmarkSeedCoreKey)
  }
  
  static func clearCore() throws {
    return try getKeychain().remove(bitmarkSeedCoreKey)
  }
}
