//
//  KeychainUtil.swift
//  Bitmark
//
//  Created by Anh Nguyen on 1/29/18.
//  Copyright © 2018 Bitmark Inc. All rights reserved
//

import Foundation
import KeychainAccess
import BitmarkSDK

struct KeychainUtil {

  private static let bitmarkSeedCoreKey = "bitmark_core"
  private static let bitmarkSeedCoreWithoutAuthenticartion = "bitmark_core_no_authentication"
  private static let authenticationKey = "authentication"
  private static let versionKey = "bitmark_account_version"
  
  static func getKeychain(reason: String, authentication: Bool) throws -> Keychain {
    #if (arch(i386) || arch(x86_64)) && os(iOS) && authentication
    let semaphore = DispatchSemaphore(value: 0)
    var cancel = false
    
    let alert = UIAlertController(title: "Keychain access request", message: reason, preferredStyle: .alert)
    alert.addAction(UIAlertAction(title: "Ok", style: .default, handler: { _ in
      semaphore.signal()
    }))
    alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: { _ in
      cancel = true
      semaphore.signal()
    }))
    
    UIApplication.shared.delegate?.window??.rootViewController?.present(alert, animated: true, completion: nil)
    
    _ = semaphore.wait(timeout: .distantFuture)
    
    alert.dismiss(animated: true, completion: nil)
    
    if cancel {
      throw KeychainAccess.Status.userCanceled
    }
    #endif
    
    guard let bundleIdentifier = Bundle.main.bundleIdentifier else {
      throw("Cannot get app information")
    }
    
    if authentication {
      return Keychain(service: bundleIdentifier) // Z5CE7A3A7N is the app prefix
        .accessibility(.whenPasscodeSetThisDeviceOnly, authenticationPolicy: .userPresence)
        .authenticationPrompt(reason)
    } else {
      return Keychain(service: bundleIdentifier)
    }
  }
  
  static func saveCore(_ core: Data, version: String, authentication: Bool) throws {
    UserDefaults.standard.set(authentication, forKey: authenticationKey)
    UserDefaults.standard.set(version, forKey: versionKey)
    let keychain = try getKeychain(reason: NSLocalizedString("info_plist_touch_face_id", comment: ""), authentication: authentication)
    try? keychain.removeAll()
    try keychain.set(core, key: bitmarkSeedCoreKey(authentication: authentication))
  }
  
  static func getCore(reason: String) throws -> Data? {
    guard let authentication = UserDefaults.standard.object(forKey: authenticationKey) as? Bool else {
      // Try to get both options
      let result = try getKeychain(reason: reason, authentication: false)
        .getData(bitmarkSeedCoreKey(authentication: false))
      if result != nil {
        return result
      } else {
        return try getKeychain(reason: reason, authentication: true)
          .getData(bitmarkSeedCoreKey(authentication: true))
      }
    }
    return try getKeychain(reason: reason, authentication: authentication)
      .getData(bitmarkSeedCoreKey(authentication: authentication))
  }
  
  static func clearCore() throws {
    let authentication = UserDefaults.standard.bool(forKey: authenticationKey)
    try getKeychain(reason: "Bitmark app would like to remove your account from keychain.", authentication: authentication)
      .remove(bitmarkSeedCoreKey(authentication: authentication))
    UserDefaults.standard.removeObject(forKey: authenticationKey)
  }
  
  static func getAccountVersion() -> SeedVersion {
    if let versionValue = UserDefaults.standard.string(forKey: versionKey) {
      if versionValue == "v2" {
        return SeedVersion.v2
      } else {
        return SeedVersion.v1
      }
    }
    else {
      return SeedVersion.v1
    }
  }
  
  static func bitmarkSeedCoreKey(authentication: Bool) -> String {
    if authentication {
      return bitmarkSeedCoreKey
    } else {
      return bitmarkSeedCoreWithoutAuthenticartion
    }
  }
}
