//
//  AccountSession.swift
//  Bitmark
//
//  Created by Anh Nguyen on 2/8/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

import Foundation
import BitmarkSDK

class AccountSession {
  static let shared = AccountSession()
  
  private var sessionMap = [String: Account]()
  
  func requestSession(reason: String, network: String) throws -> String? {
    let uuid = UUID().uuidString.lowercased()
    guard let account = try AccountSession.getAccount(reason: reason, network: network) else {
      return nil
    }
    
    sessionMap[uuid] = account
    
    return uuid
  }
  
  func addSessionForAccount(_ account: Account) -> String {
    let uuid = UUID().uuidString.lowercased()
    sessionMap[uuid] = account
    return uuid
  }
  
  func getAccount(sessionId: String) -> Account? {
    return sessionMap[sessionId]
  }
  
  func disposeSession(sessionId: String) {
    _ = sessionMap.removeValue(forKey: sessionId)
  }
}

extension AccountSession {
  static func networkWithName(name: String) -> Network {
    switch(name) {
    case "livenet":
      return Network.livenet
    case "testnet":
      return Network.testnet
    default:
      var network = Network.testnet
      network.setEndpoint(api: URL(string: "https://api.devel.bitmark.com")!, asset: URL(string: "https://assets.devel.bitmark.com")!)
      return network
    }
  }
  
  static func getAccount(reason: String, network: String) throws -> Account? {
    let network = networkWithName(name: network)
    guard let core = try KeychainUtil.getCore(reason: reason) else {
      return nil
    }
    
    return try Account(core: core, network: network)
  }
}
