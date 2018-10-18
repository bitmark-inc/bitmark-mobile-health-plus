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
  private static let versionKey = "bitmark_account_version"
  
  static func getKeychain(reason: String) throws -> Keychain {
    #if (arch(i386) || arch(x86_64)) && os(iOS)
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

    return Keychain(service: bundleIdentifier) // Z5CE7A3A7N is the app prefix
            .accessibility(.whenPasscodeSetThisDeviceOnly, authenticationPolicy: .userPresence)
            .authenticationPrompt(reason)
  }
  
  static func saveCore(_ core: Data, version: String) throws {
    DispatchQueue.main.async {
      UserDefaults().set(version, forKey: versionKey)
    }
    return try getKeychain(reason: NSLocalizedString("info_plist_touch_face_id", comment: "")).set(core, key: bitmarkSeedCoreKey)
  }
  
  static func getCore(reason: String) throws -> Data? {
    return try getKeychain(reason: reason).getData(bitmarkSeedCoreKey)
  }
  
  static func clearCore() throws {
    return try getKeychain(reason: "Health + app would like to remove your account from keychain").remove(bitmarkSeedCoreKey)
  }
  
  static func getAccountVersion() -> SeedVersion {
    let versionValue = DispatchQueue.main.sync {
      UserDefaults().string(forKey: versionKey)
    }
    if let v = versionValue {
      if v == "v2" {
        return SeedVersion.v2
      } else {
        return SeedVersion.v1
      }
    } else {
      return SeedVersion.v1
    }
  }
}
