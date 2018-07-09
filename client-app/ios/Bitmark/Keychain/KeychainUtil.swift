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
      
      DispatchQueue.main.async {
        UIApplication.shared.delegate?.window??.rootViewController?.present(alert, animated: true, completion: nil)
      }
      _ = semaphore.wait(timeout: .distantFuture)
      
      DispatchQueue.main.async {
        alert.dismiss(animated: true, completion: nil)
      }
      
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
  
  static func saveCore(_ core: Data) throws {
    return try getKeychain(reason: "Touch/Face ID or a passcode is required to authorize your transactions.").set(core, key: bitmarkSeedCoreKey)
  }
  
  static func getCore(reason: String) throws -> Data? {
    return try getKeychain(reason: reason).getData(bitmarkSeedCoreKey)
  }
  
  static func clearCore() throws {
    return try getKeychain(reason: "Bitmark app would like to remove your account from keychain").remove(bitmarkSeedCoreKey)
  }
}
