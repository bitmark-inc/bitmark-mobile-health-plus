//
//  BitmarkSDK.swift
//  Bitmark
//
//  Created by Anh Nguyen on 1/26/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

import Foundation
import BitmarkSDK
import KeychainAccess

@objc(BitmarkSDK)
class BitmarkSDK: NSObject {
  
  enum BitmarkSDKError: Error {
    case accountNotFound
  }
  
  @objc(newAccount::)
  func newAccount(_ network: String, _ callback: @escaping RCTResponseSenderBlock) -> Void {
    do {
      let network = BitmarkSDK.networkWithName(name: network)
      let account = try Account(network: network)
      try KeychainUtil.saveCore(account.core)
      callback([true, account.accountNumber.string, try account.getRecoverPhrase()])
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
      try KeychainUtil.saveCore(account.core)
      callback([true, account.accountNumber.string, try account.getRecoverPhrase()])
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
  
  @objc(try24Words::)
  func try24Words(_ pharse: [String], _ callback: @escaping RCTResponseSenderBlock) -> Void {
    do {
      let account = try Account(recoverPhrase: pharse)
      callback([true, account.accountNumber.string, try account.getRecoverPhrase()])
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
  
  @objc(accountInfo::)
  func accountInfo(_ network: String, _ callback: @escaping RCTResponseSenderBlock) -> Void {
    do {
      let account = try BitmarkSDK.getAccount(network: network)
      callback([true, account.accountNumber.string, try account.getRecoverPhrase()])
    }
    catch let e {
      if let error = e as? BitmarkSDKError,
        error == BitmarkSDKError.accountNotFound {
        callback([true])
        return
      }
      
      print(e)
      callback([false])
    }
  }
  
  @objc(removeAccount:)
  func removeAccount(callback: @escaping RCTResponseSenderBlock) {
    do {
      try KeychainUtil.clearCore()
      callback([true])
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
  
  @objc(registerAccessPublicKey::)
  func registerAccessPublicKey(_ input: [String: Any], _ callback: @escaping RCTResponseSenderBlock) -> Void {
    do {
      let account = try BitmarkSDK.getAccount(network: input["network"] as! String)
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
      let account = try BitmarkSDK.getAccount(network: input["network"] as! String)
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
      let account = try BitmarkSDK.getAccount(network: input["network"] as! String)
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
      let account = try BitmarkSDK.getAccount(network: input["network"] as! String)
      let message = input["message"] as! String
      let signature = try account.sign(withMessage: message, forAction: .Indentity)
      callback([true, signature.hexEncodedString])
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
  
  @objc(sign1stForTransfer::::)
  func sign1stForTransfer(_ network: String, _ bitmarkId: String, _ address: String, _ callback: @escaping RCTResponseSenderBlock) {
    do {
      let account = try BitmarkSDK.getAccount(network: network)
      guard let offer = try account.createTransferOffer(bitmarkId: bitmarkId, recipient: address) else {
        callback([false])
        return
      }
      
      callback([true, offer.txId, offer.receiver, offer.signature!.hexEncodedString])
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
  
  @objc(sign2ndForTransfer:::::)
  func sign2ndForTranfer(_ network: String, _ txId: String, _ address: String, _ signature: String, _ callback: @escaping RCTResponseSenderBlock) {
    do {
      let account = try BitmarkSDK.getAccount(network: network)
      let offer = TransferOffer(txId: txId, receiver: try AccountNumber(address: address), signature: signature.hexDecodedData)
      let counterSignature = try account.createSignForTransferOffer(offer: offer)
      callback([true, counterSignature.counterSignature!.hexEncodedString])
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
}

extension BitmarkSDK {
  
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
  
  static func getAccount(network: String) throws -> Account {
    let network = networkWithName(name: network)
    guard let core = try KeychainUtil.getCore() else {
      throw BitmarkSDKError.accountNotFound
    }
    
    return try Account(core: core, network: network)
  }
}
