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
  }
  
  static func saveCore(_ core: Data) throws {
    let keychain = getKeychain()
    try keychain.accessibility(.whenPasscodeSetThisDeviceOnly, authenticationPolicy: .userPresence)
    .set(core, key: bitmarkSeedCoreKey)
  }
  
  static func getCore() throws -> Data? {
    let keychain = getKeychain()
    return try keychain.authenticationPrompt("Allow bitmark app access to your account")
    .getData(bitmarkSeedCoreKey)
  }
  
  static func clearCore() throws {
    try getKeychain().remove(bitmarkSeedCoreKey)
  }
}
