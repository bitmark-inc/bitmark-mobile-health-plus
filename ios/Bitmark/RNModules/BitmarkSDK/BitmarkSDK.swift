//
//  BitmarkSDK.swift
//  Bitmark
//
//  Created by Anh Nguyen on 1/26/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

import Foundation
import BitmarkSDK

@objc(BitmarkSDK)
class BitmarkSDK: NSObject {
  
  func networkWithName(name: String) -> Network {
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
  
  @objc(newAccount::)
  func newAccount(_ network: String, _ callback: @escaping RCTResponseSenderBlock) -> Void {
    do {
      let network = networkWithName(name: network)
      let account = try Account(network: network)
      callback([true, account.core.hexEncodedString, try account.toSeed(), account.accountNumber.string, try account.getRecoverPhrase()])
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
  
  @objc(newAccountFrom24Words::)
  func newAccountFrom24Words(_ pharse: [String], _ callback: @escaping RCTResponseSenderBlock) -> Void {
    do {
      let account = try Account(recoverPhrase: pharse)
      callback([true, account.core.hexEncodedString, try account.toSeed(), account.accountNumber.string, try account.getRecoverPhrase()])
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
  
  @objc(accountInfo:::)
  func accountInfo(_ coreString: String!, _ network: String, _ callback: @escaping RCTResponseSenderBlock) -> Void {
    do {
      let network = networkWithName(name: network)
      let account = try Account(core: coreString.hexDecodedData, network: network)
      callback([true, try account.toSeed(), account.accountNumber.string, try account.getRecoverPhrase()])
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
  
  @objc(registerAccessPublicKey::)
  func registerAccessPublicKey(_ input: [String: Any], _ callback: @escaping RCTResponseSenderBlock) -> Void {
    do {
      let network = networkWithName(name: input["network"] as! String)
      let account = try Account(core: (input["coreString"] as! String).hexDecodedData, network: network)
      callback([try account.registerPublicEncryptionKey()])
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
  
  @objc(issueFile::)
  func issueFile(_ input: [String: Any], _ callback: @escaping RCTResponseSenderBlock) -> Void {
    do {
      let network = networkWithName(name: input["network"] as! String)
      let account = try Account(core: (input["coreString"] as! String).hexDecodedData, network: network)
      let fileURL = input["url"] as! String
      let propertyName = input["property_name"] as! String
      let metadata = input["metadata"] as! [String: String]
      let quantity = input["quantity"] as! Int
      let result = try account.issueBitmarks(assetFile: URL(fileURLWithPath: fileURL), accessibility: .privateAsset, propertyName: propertyName, propertyMetadata: metadata, quantity: quantity)
      if let issues = result?.0 {
        let issueIds = issues.map {$0.txId! }
        callback([true, issueIds])
      }
      else {
        callback([false])
      }
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
  
  @objc(issueThenTransferFile::)
  func issueThenTransferFile(_ input: [String: Any], _ callback: @escaping RCTResponseSenderBlock) -> Void {
    do {
      let network = networkWithName(name: input["network"] as! String)
      let account = try Account(core: (input["coreString"] as! String).hexDecodedData, network: network)
      let fileURL = input["url"] as! String
      let propertyName = input["property_name"] as! String
      let metadata = input["metadata"] as! [String: String]
      let receiver = input["receiver"] as! String
      let result = try account.issueThenTransfer(assetFile: URL(fileURLWithPath: fileURL), accessibility: .privateAsset, propertyName: propertyName, propertyMetadata: metadata, toAccount: receiver)
      if let issue = result?.0 {
        callback([true, issue.txId!])
      }
      else {
        callback([false])
      }
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
  
  @objc(sign::)
  func sign(_ input: [String: Any], _ callback: @escaping RCTResponseSenderBlock) {
    do {
      let network = networkWithName(name: input["network"] as! String)
      let account = try Account(core: (input["coreString"] as! String).hexDecodedData, network: network)
      let message = input["message"] as! String
      let signature = try account.sign(withMessage: message, forAction: .Indentity)
      callback([true, signature.hexEncodedString])
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
  
}
