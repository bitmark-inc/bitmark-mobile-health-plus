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
      _ = try account.registerPublicEncryptionKey()
      let sessionId = AccountSession.shared.addSessionForAccount(account)
      callback([true, sessionId])
    }
    catch let e {
      if let status = e as? KeychainAccess.Status,
        status == KeychainAccess.Status.userCanceled {
        callback([true])
      }
      else {
        print(e)
        callback([false])
      }
    }
  }
  
  @objc(newAccountFrom24Words:::)
  func newAccountFrom24Words(_ pharse: [String], _ network: String, _ callback: @escaping RCTResponseSenderBlock) -> Void {
    do {
      let network = BitmarkSDK.networkWithName(name: network)
      let account = try Account(recoverPhrase: pharse)
      
      if account.accountNumber.network != network {
        callback([false])
        return
      }
      
      try KeychainUtil.saveCore(account.core)
      _ = try account.registerPublicEncryptionKey()
      let sessionId = AccountSession.shared.addSessionForAccount(account)
      callback([true, sessionId])
    }
    catch let e {
      if let status = e as? KeychainAccess.Status,
        status == KeychainAccess.Status.userCanceled {
        callback([true])
      }
      else {
        print(e)
        callback([false])
      }
    }
  }
  
  @objc(try24Words:::)
  func try24Words(_ pharse: [String], _ network: String, _ callback: @escaping RCTResponseSenderBlock) -> Void {
    do {
      let network = BitmarkSDK.networkWithName(name: network)
      let account = try Account(recoverPhrase: pharse)
      
      if account.accountNumber.network != network {
        callback([false])
        return
      }

      callback([true, account.accountNumber.string])
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
  
  @objc(accountInfo::)
  func accountInfo(_ sessionId: String, _ callback: @escaping RCTResponseSenderBlock) -> Void {
    do {
      let account = try BitmarkSDK.getAccount(sessionId: sessionId)
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
  func registerAccessPublicKey(_ sessionId: String, _ callback: @escaping RCTResponseSenderBlock) -> Void {
    do {
      let account = try BitmarkSDK.getAccount(sessionId: sessionId)
      callback([try account.registerPublicEncryptionKey()])
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
  
  @objc(issueFile:::)
  func issueFile(_ sessionId: String, _ input: [String: Any], _ callback: @escaping RCTResponseSenderBlock) -> Void {
    do {
      let account = try BitmarkSDK.getAccount(sessionId: sessionId)
      let fileURL = input["url"] as! String
      let propertyName = input["property_name"] as! String
      let metadata = input["metadata"] as! [String: String]
      let quantity = input["quantity"] as! Int
      let isPublicAsset = input["is_public_asset"] as! Bool
      
      var accessibility = Accessibility.privateAsset
      if isPublicAsset {
        accessibility = Accessibility.publicAsset
      }
      
      let result = try account.issueBitmarks(assetFile: URL(fileURLWithPath: fileURL), accessibility: accessibility, propertyName: propertyName, propertyMetadata: metadata, quantity: quantity)
      let issues = result.0
      let issueIds = issues.map {$0.txId! }
      callback([true, issueIds])
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
  
  @objc(downloadBitmark:::)
  func downloadBitmark(_ sessionId: String, _ bitmarkId: String, _ callback: @escaping RCTResponseSenderBlock) -> Void {
    do {
      let account = try BitmarkSDK.getAccount(sessionId: sessionId)
      let (f, d) = try account.downloadAsset(bitmarkId: bitmarkId)
      guard let filename = f,
        let data = d else {
          callback([false])
          return
      }
      
      let paths = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
      let documentsDirectory = paths[0]
      let filePath = documentsDirectory.appendingPathComponent(filename)
      try data.write(to: filePath)
      
      callback([true, filePath.absoluteString])
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
  
  @objc(getAssetInfo::)
  func getAssetInfo(_ filePath: String, _ callback: @escaping RCTResponseSenderBlock) -> Void {
    do {
      let url = URL(fileURLWithPath: filePath)
      let data = try Data(contentsOf: url)
      let fingerprint = FileUtil.Fingerprint.computeFingerprint(data: data)
      
      guard let fingerprintData = fingerprint.data(using: .utf8) else {
        callback([false])
        return
      }
      
      let assetid = fingerprintData.sha3(.sha512).hexEncodedString
      callback([true, assetid, fingerprint])
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
  
  @objc(issueThenTransferFile:::)
  func issueThenTransferFile(_ sessionId: String, _ input: [String: Any], _ callback: @escaping RCTResponseSenderBlock) -> Void {
    do {
      let account = try BitmarkSDK.getAccount(sessionId: sessionId)
      let fileURL = input["url"] as! String
      let propertyName = input["property_name"] as! String
      let metadata = input["metadata"] as! [String: String]
      let receiver = input["receiver"] as! String
      let extraInfo = input["extra_info"] as? [String: Any]
      
      let bitmarkId = try account.createAndSubmitGiveawayIssue(assetFile: URL(fileURLWithPath: fileURL),
                                                            accessibility: .privateAsset,
                                                            propertyName: propertyName,
                                                            propertyMetadata: metadata,
                                                            toAccount: receiver,
                                                            extraInfo: extraInfo)
      callback([true, bitmarkId])
    }
    catch let e {
      print(e)
      callback([false, e.localizedDescription])
    }
  }
  
  @objc(sign:::)
  func sign(_ sessionId: String, _ message: String, _ callback: @escaping RCTResponseSenderBlock) {
    do {
      let account = try BitmarkSDK.getAccount(sessionId: sessionId)
      let signature = try account.sign(withMessage: message, forAction: .Indentity)
      callback([true, signature.hexEncodedString])
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
  
  @objc(rickySign:::)
  func rickySign(_ sessionId: String, _ messages: [String], _ callback: @escaping RCTResponseSenderBlock) {
    do {
      let account = try BitmarkSDK.getAccount(sessionId: sessionId)
      let signatures = try messages.map({ (message) -> String in
        return (try account.riskySign(withMessage: message)).hexEncodedString
      })
      callback([true, signatures])
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
  
  @objc(transferOneSignature::::)
  func transferOneSignature(_ sessionId: String, _ bitmarkId: String, address: String, _ callback: @escaping RCTResponseSenderBlock) {
    do {
      let account = try BitmarkSDK.getAccount(sessionId: sessionId)
      let success = try account.transferBitmark(bitmarkId: bitmarkId, toAccount: address)
      
      callback([success])
    }
    catch let e {
      print(e)
      callback([false, e.localizedDescription])
    }
  }
  
  @objc(createAndSubmitTransferOffer::::)
  func createAndSubmitTransferOffer(_ sessionId: String, _ bitmarkId: String, _ address: String, _ callback: @escaping RCTResponseSenderBlock) {
    do {
      let account = try BitmarkSDK.getAccount(sessionId: sessionId)
      let offerId = try account.createAndSubmitTransferOffer(bitmarkId: bitmarkId, recipient: address)

      callback([true, offerId])
    }
    catch let e {
      print(e)
      callback([false])
    }
  }

  @objc(signForTransferOfferAndSubmit::::::)
  func signForTransferOfferAndSubmit(_ sessionId: String, _ txId: String, _ signature: String, _ offerId: String, _ action: String, _ callback: @escaping RCTResponseSenderBlock) {
    do {
      let account = try BitmarkSDK.getAccount(sessionId: sessionId)
      let offer = TransferOffer(txId: txId, receiver: account.accountNumber, signature: signature.hexDecodedData)
      let success = try account.signForTransferOfferAndSubmit(offerId: offerId, offer: offer, action: action)
      callback([success])
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
  
  @objc(requestSession:::)
  func requestSession(_ network: String, _ reason: String, _ callback: @escaping RCTResponseSenderBlock) {
    do {
      guard let sessionId = try AccountSession.shared.requestSession(reason: reason, network: network) else {
        callback([false])
        return
      }
      
      callback([true, sessionId])
    }
    catch let e {
      if let status = e as? KeychainAccess.Status,
        status == KeychainAccess.Status.userCanceled {
        callback([true])
      }
      else {
        print(e)
        callback([false])
      }
    }
  }
  
  @objc(disposeSession::)
  func disposeSession(_ sessionId: String, _ callback: @escaping RCTResponseSenderBlock) {
    AccountSession.shared.disposeSession(sessionId: sessionId)
    callback([true])
  }
  
  @objc(validateMetadata::)
  func validateMetadata(_ metadata: [String: String], _ callback: @escaping RCTResponseSenderBlock) {
    let tmp = metadata.reduce([]) { (result, keyvalue) -> [String] in
      var newResult = result
      newResult.append(keyvalue.key)
      newResult.append(keyvalue.value)
      return newResult
    }
    
    let metadataString = tmp.joined(separator: "\u{0000}")
    
    if metadataString.utf8.count > 2048 {
      callback([false])
    }
    else {
      callback([true])
    }
  }
  
  @objc(validateAccountNumber:::)
  func validateAccountNumber(_ address: String, _ network: String, _ callback: @escaping RCTResponseSenderBlock) {
    do {
      let account = try AccountNumber(address: address)
      let n = BitmarkSDK.networkWithName(name: network)
      if account.network == n {
        callback([true])
      } else {
        callback([false])
      }
    }
    catch {
      callback([false])
    }
  }
  
  @objc(createSessionData:::)
  func createSessionData(_ sessionId: String, _ encryptionKey: String, _ callback: @escaping RCTResponseSenderBlock) {
    do {
      let account = try BitmarkSDK.getAccount(sessionId: sessionId)
      let sessionData = try account.createSessionData(encryptionKey: encryptionKey)
      callback([true, sessionData])
    }
    catch let e {
      print(e)
      callback([false])
    }
  }
  
  @objc(issueRecord:::)
  func issueRecord(_ sessionId: String, _ input: [String: Any], _ callback: @escaping RCTResponseSenderBlock) -> Void {
    do {
      let account = try BitmarkSDK.getAccount(sessionId: sessionId)
      let fingerprint = input["fingerprint"] as! String
      let propertyName = input["property_name"] as! String
      let metadata = input["metadata"] as! [String: String]
      let quantity = input["quantity"] as! Int
      
      let result = try account.issueBitmarks(fingerprint: fingerprint, propertyName: propertyName, propertyMetadata: metadata, quantity: quantity)
      let issues = result.0
      let issueIds = issues.map {$0.txId! }
      callback([true, issueIds])
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
  
  static func getAccount(sessionId: String) throws -> Account {
    guard let account = AccountSession.shared.getAccount(sessionId: sessionId) else {
      throw BitmarkSDKError.accountNotFound
    }
    
    return account
  }
}
