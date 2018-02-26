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
  
  static func getKeychain(reason: String) -> Keychain {
    return Keychain(service: "com.bitmark.bitmarkios.account",
                    accessGroup: "Z5CE7A3A7N.com.bitmark.bitmarkios") // Z5CE7A3A7N is the app prefix
            .accessibility(.whenPasscodeSetThisDeviceOnly, authenticationPolicy: .userPresence)
            .authenticationPrompt(reason)
  }
  
  static func saveCore(_ core: Data) throws {
    return try getKeychain(reason: "Bitmark app would like to write your account to keychain").set(core, key: bitmarkSeedCoreKey)
  }
  
  static func getCore(reason: String) throws -> Data? {
    return try getKeychain(reason: reason).getData(bitmarkSeedCoreKey)
  }
  
  static func clearCore() throws {
    return try getKeychain(reason: "Bitmark app would like to remove your account from keychain").remove(bitmarkSeedCoreKey)
  }
}
