//
//  KeychainUtil.swift
//  Bitmark
//
//  Created by Anh Nguyen on 1/29/18.
//  Copyright © 2018 Bitmark Inc. All rights reserved
//

import Foundation
import KeychainAccess

struct KeychainUtil {

  private static let bitmarkSeedCoreKey = "bitmark_account"
  
  
  static func getKeychain(reason: String) throws -> Keychain {
    guard let bundleIdentifier = Bundle.main.bundleIdentifier else {
        throw("Cannot get app information")
    }
    
    // Parse bundle id
    let components = bundleIdentifier.split(separator: ".")
    var version = "appstore"
    if components.count == 4 {
      version = String(components[3])
    }
    
    let appIdentifierPrefix =
      Bundle.main.infoDictionary!["AppIdentifierPrefix"] as! String

    return Keychain(service: "com.bitmark.keychain" + "." + version, accessGroup: appIdentifierPrefix + "shared")
            .accessibility(.always)
            .synchronizable(true)
  }
  
  static func saveCore(_ core: Data) throws {
    return try getKeychain(reason: NSLocalizedString("info_plist_touch_face_id", comment: "")).set(core, key: bitmarkSeedCoreKey)
  }
  
  static func getCore(reason: String) throws -> Data? {
    return try getKeychain(reason: reason).getData(bitmarkSeedCoreKey)
  }
  
  static func clearCore() throws {
    return try getKeychain(reason: "Health + app would like to remove your account from keychain").remove(bitmarkSeedCoreKey)
  }
  
  static func migrateNewKeychain() throws {
    if !contains("bitmark_core") {
      return
    }
    
    guard let bundleIdentifier = Bundle.main.bundleIdentifier else {
      throw("Cannot get app information")
    }
    
    let oldKeychain = Keychain(service: bundleIdentifier) // Z5CE7A3A7N is the app prefix
      .accessibility(.whenPasscodeSetThisDeviceOnly, authenticationPolicy: .userPresence)
      .authenticationPrompt("We will remove touch / faceid prompt out of the app. Please confirm with your touch / faceid at the last time to do that action.")
    
    guard let core = try oldKeychain.getData(bitmarkSeedCoreKey) else {
      return
    }
    
    try oldKeychain.remove(bitmarkSeedCoreKey)
    try saveCore(core)
  }
  
  static func contains(_ key: String) -> Bool {    let keychainQuery: [AnyHashable: Any] = [
      kSecClass as AnyHashable: kSecClassGenericPassword,
      kSecAttrService as AnyHashable: Bundle.main.bundleIdentifier!,
      kSecAttrAccount as AnyHashable: key,
      kSecUseAuthenticationUI as AnyHashable: kSecUseAuthenticationUIFail
    ]
    
    var result: AnyObject?
    let status = SecItemCopyMatching(keychainQuery as CFDictionary, &result)
    
    return status == errSecInteractionNotAllowed
  }

}
