//
//  BitmarkSDK.swift
//  Bitmark
//
//  Created by Anh Nguyen on 1/26/18.
//  Copyright © 2018 Bitmark Inc. All rights reserved
//

import Foundation
import BitmarkSDK
import KeychainAccess
import iCloudDocumentSync

@objc(BitmarkSDKWrapper)
class BitmarkSDKWrapper: RCTEventEmitter {

  static let accountNotFound = "Account not found in native layer"
  var account: Account?

  @objc(sdkInit:::)
  func sdkInit(_ network: String, _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    guard let apiKey = Bundle.main.object(forInfoDictionaryKey: "BitmarkSDKAPIKey") as? String else {
        reject(nil, "Cannot find default bundle", nil);
        return
    }

    BitmarkSDK.initialize(config: SDKConfig(apiToken: apiKey,
                                            network: BitmarkSDKWrapper.networkWithName(name: network),
                                            urlSession: URLSession.shared))
    resolve(nil);
  }

  @objc(createAccount:::)
  func createAccount(_ authentication: Bool, _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      let account = try Account()
      try KeychainUtil.saveCore(account.seed.core, version: BitmarkSDKWrapper.stringFromVersion(account.seed.version), authentication: authentication)
      self.account = account
      resolve(nil);
    }
    catch let e {
      if let status = e as? KeychainAccess.Status,
        status == KeychainAccess.Status.userCanceled || status == KeychainAccess.Status.authFailed {
        resolve(nil);
      }
      else {
        reject(nil, nil, e);
      }
    }
  }

  @objc(generatePhrase::)
  func generatePhrase(_ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      let account = try Account()
      resolve([account.accountNumber,
               try account.getRecoverPhrase(language: .english),
               BitmarkSDKWrapper.stringFromVersion(account.seed.version)])
    }
    catch let e {
      reject(nil, nil, e);
    }
  }

  @objc(createAccountFromPhrase::::)
  func createAccountFromPhrase(_ pharse: [String], _ authentication: Bool, _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      let account = try Account(recoverPhrase: pharse, language: .english)

      try KeychainUtil.saveCore(account.seed.core, version: BitmarkSDKWrapper.stringFromVersion(account.seed.version), authentication: authentication)
      self.account = account
      resolve(nil);
    }
    catch let e {
      if let status = e as? KeychainAccess.Status,
        status == KeychainAccess.Status.userCanceled || status == KeychainAccess.Status.authFailed {
        resolve(nil);
      }
      else {
        reject(nil, nil, e);
      }
    }
  }

  @objc(tryPhrase:::)
  func tryPhrase(_ pharse: [String], _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      let account = try Account(recoverPhrase: pharse, language: .english)

      resolve(account.accountNumber)
    }
    catch let e {
      reject(nil, nil, e);
    }
  }

  @objc(accountInfo::)
  func accountInfo(_ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      guard let account = self.account else {
        reject(nil, BitmarkSDKWrapper.accountNotFound, nil)
        return
      }
      resolve([account.accountNumber,
               try account.getRecoverPhrase(language: .english),
               BitmarkSDKWrapper.stringFromVersion(account.seed.version)])
    }
    catch let e {
      reject(nil, nil, e);
    }
  }

  @objc(authenticate:::)
  func authenticate(_ message: String, _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      guard let core = try KeychainUtil.getCore(reason: message) else {
        reject(nil, BitmarkSDKWrapper.accountNotFound, nil)
        return
      }

      let seed = try Seed.fromCore(core, version: KeychainUtil.getAccountVersion())
      self.account = try Account(seed: seed)
      resolve(nil)
    }
    catch let e {
      reject(nil, nil, e);
    }
  }

  @objc(removeAccount::)
  func removeAccount(_ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      try KeychainUtil.clearCore()
      resolve(nil);
    }
    catch let e {
      reject(nil, nil, e);
    }
  }

  @objc(issue:::)
  func issue(_ params: [String: Any], _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      guard let account = self.account else {
        reject(nil, BitmarkSDKWrapper.accountNotFound, nil)
        return
      }

      guard let fileURL = params["url"] as? String,
        let name = params["property_name"] as? String,
        let metadata = params["metadata"] as? [String: String],
        let quantity = params["quantity"] as? Int else {
          reject(nil, "Invalid fingerprint", nil)
          return
      }

      // Register asset
      var assetParams = try Asset.newRegistrationParams(name: name,
                                                        metadata: metadata)

      try assetParams.setFingerprint(fromFileURL: fileURL)
      try assetParams.sign(account)
      let assetId = try Asset.register(assetParams)

      // Issue bitmarks

      var issueParams = try Bitmark.newIssuanceParams(assetID: assetId,
                                                      owner: account.accountNumber,
                                                      quantity: quantity)
      try issueParams.sign(account)
      let bitmarkIds = try Bitmark.issue(issueParams)

      resolve([bitmarkIds, assetId])
    }
    catch let e {
      reject(nil, nil, e);
    }
  }

  @objc(storeFileSecurely::::)
  func storeFileSecurely(_ filePath: String, _ destination: String, _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      let data = try Data(contentsOf: URL(fileURLWithPath: filePath))
      try data.write(to: URL(fileURLWithPath: destination), options: [.completeFileProtection, .atomic])
      resolve(nil);
    }
    catch let e {
      reject(nil, nil, e);
    }
  }

  //  @objc(downloadBitmark::::)
  //  func downloadBitmark(_ bitmarkId: String, localFolderPath: String, _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
  //    do {
  //      guard let account = self.account else {
  //        reject(nil, BitmarkSDKWrapper.accountNotFound, nil)
  //        return
  //      }
  //      let (f, d) = try account.downloadAsset(bitmarkId: bitmarkId)
  //      guard let filename = f,
  //        let data = d else {
  //          callback([false])
  //          return
  //      }
  //
  //      let fileURL = URL(fileURLWithPath: localFolderPath, isDirectory: true).appendingPathComponent(filename)
  //      try data.saveFileLocally(url: fileURL)
  //      callback([true, localFolderPath])
  //    }
  //    catch let e {
  //      if let msg = e as? NSString {
  //        callback([false, msg])
  //      } else {
  //        callback([false])
  //      }
  //    }
  //  }
  //
  //  @objc(downloadBitmarkWithGrantId::::)
  //  func downloadBitmarkWithGrantId(_ grantID: String, localFolderPath: String, _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
  //    do {
  //      guard let account = self.account else {
  //        reject(nil, BitmarkSDKWrapper.accountNotFound, nil)
  //        return
  //      }
  //      let (f, d) = try account.downloadAssetGrant(grantId: grantID)
  //      guard let filename = f,
  //        let data = d else {
  //          callback([false])
  //          return
  //      }
  //
  //      let fileURL = URL(fileURLWithPath: localFolderPath, isDirectory: true).appendingPathComponent(filename)
  //      try data.saveFileLocally(url: fileURL)
  //      callback([true, localFolderPath])
  //    }
  //    catch let e {
  //      if let msg = e as? NSString {
  //        callback([false, msg])
  //      } else {
  //        callback([false])
  //      }
  //    }
  //  }

  @objc(getAssetInfo:::)
  func getAssetInfo(_ filePath: String, _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      let url = URL(fileURLWithPath: filePath)
      let data = try Data(contentsOf: url)
      let fingerprint = FileUtil.computeFingerprint(data: data)

      guard let fingerprintData = fingerprint.data(using: .utf8) else {
        reject(nil, "Invalid fingerprint", nil)
        return
      }

      let assetid = fingerprintData.sha3(length: 512).hexEncodedString
      resolve([assetid, fingerprint])
    }
    catch let e {
      reject(nil, nil, e);
    }
  }

  //  @objc(issueThenTransferFile::::)
  //  func issueThenTransferFile(_ params: [String: Any], localFolderPath: String, _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
  //    do {
  //      guard let account = self.account else {
  //        reject(nil, BitmarkSDKWrapper.accountNotFound, nil)
  //        return
  //      }
  //      let fileURL = input["url"] as! String
  //      let propertyName = input["property_name"] as! String
  //      let metadata = input["metadata"] as! [String: String]
  //      let receiver = input["receiver"] as! String
  //      let extraInfo = input["extra_info"] as? [String: Any]
  //
  //      let bitmarkId = try account.createAndSubmitGiveawayIssue(assetFile: URL(fileURLWithPath: fileURL),
  //                                                            accessibility: .privateAsset,
  //                                                            propertyName: propertyName,
  //                                                            propertyMetadata: metadata,
  //                                                            toAccount: receiver,
  //                                                            extraInfo: extraInfo)
  //
  //      let url = URL(fileURLWithPath: fileURL)
  //      let filename = url.lastPathComponent
  //      let saveFileURL = URL(fileURLWithPath: localFolderPath, isDirectory: true).appendingPathComponent(filename)
  //      let assetFile = try Data(contentsOf: URL(fileURLWithPath: fileURL))
  //      try assetFile.saveFileLocally(url: saveFileURL)
  //
  //      callback([true, bitmarkId])
  //    }
  //    catch let e {
  //      if let msg = e as? NSString {
  //        callback([false, msg])
  //      } else {
  //        callback([false])
  //      }
  //    }
  //  }

  @objc(sign:::)
  func sign(_ messages: [String], _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      guard let account = self.account else {
        reject(nil, BitmarkSDKWrapper.accountNotFound, nil)
        return
      }

      let signatures = try messages.map({ (message) -> String in
        let messageData = message.data(using: .utf8)!
        return (try account.sign(withMessage: messageData)).hexEncodedString
      })

      resolve(signatures)
    }
    catch let e {
      reject(nil, nil, e);
    }
  }

  @objc(validateMetadata:::)
  func validateMetadata(_ metadata: [String: String], _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    let tmp = metadata.reduce([]) { (result, keyvalue) -> [String] in
      var newResult = result
      newResult.append(keyvalue.key)
      newResult.append(keyvalue.value)
      return newResult
    }

    let metadataString = tmp.joined(separator: "\u{0000}")

    if metadataString.utf8.count > 2048 {
      reject(nil, "metadata reached limit", nil)
    }
    else {
      resolve(nil);
    }
  }

  @objc(transfer:::)
  func transfer(_ params: [String: Any], _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      guard let account = self.account else {
        reject(nil, BitmarkSDKWrapper.accountNotFound, nil)
        return
      }

      guard let address = params["address"] as? String,
        let bitmarkId = params["bitmark_id"] as? String else {
          reject(nil, "Invalid parameter", nil)
          return
      }

      var transferParams = try Bitmark.newTransferParams(to: address)
      try transferParams.from(bitmarkID: bitmarkId)
      try transferParams.sign(account)
      let txId = try Bitmark.transfer(withTransferParams: transferParams)

      resolve(txId)
    }
    catch let e {
      reject(nil, nil, e);
    }
  }

  @objc(offer:::)
  func offer(_ params: [String: Any], _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      guard let account = self.account else {
        reject(nil, BitmarkSDKWrapper.accountNotFound, nil)
        return
      }

      guard let address = params["address"] as? String,
        let bitmarkId = params["bitmark_id"] as? String else {
          reject(nil, "Invalid parameter", nil)
          return
      }

      var offerParam = try Bitmark.newOfferParams(to: address, info: nil)
      try offerParam.from(bitmarkID: bitmarkId)
      try offerParam.sign(account)

      try Bitmark.offer(withOfferParams: offerParam)

      resolve(nil);
    }
    catch let e {
      reject(nil, nil, e);
    }
  }

  @objc(response:::)
  func response(_ params: [String: Any], _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      guard let account = self.account else {
        reject(nil, BitmarkSDKWrapper.accountNotFound, nil)
        return
      }

      guard let action = params["action"] as? String,
        let bitmarkId = params["bitmark_id"] as? String else {
          reject(nil, "Invalid parameter", nil)
          return
      }

      let respondAction: CountersignedTransferAction
      if action == "accept" {
        respondAction = .accept
      } else {
        respondAction = .reject
      }

      let bitmark = try Bitmark.get(bitmarkID: bitmarkId)
      var responseOfferParam = try Bitmark.newTransferResponseParams(withBitmark: bitmark, action: respondAction)
      try responseOfferParam.sign(account)

      try Bitmark.response(withResponseParams: responseOfferParam)

      resolve(nil);
    }
    catch let e {
      reject(nil, nil, e);
    }
  }

  @objc(validateAccountNumber:::)
  func validateAccountNumber(_ address: String, _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    resolve(AccountNumber(address).isValid())
  }

  @objc(getBitmark:::)
  func getBitmark(_ bitmarkID: String, _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      let bitmark = try Bitmark.get(bitmarkID: bitmarkID)
      resolve(try bitmark.asDictionary())
    }
    catch let e {
      reject(nil, nil, e)
    }
  }

  @objc(getBitmarks:::)
  func getBitmarks(_ params: [String: Any], _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      var queryParams = Bitmark.newBitmarkQueryParams()
      for (key, value) in params {
        switch key {
        case "limit":
          guard let v = value as? Int else {
            reject(nil, "Invalid param for limit, should be an int", nil)
            continue
          }
          queryParams = try queryParams.limit(size: v)
        case "issuer":
          guard let v = value as? String else {
            reject(nil, "Invalid param for issuer, should be a string", nil)
            continue
          }
          queryParams = queryParams.issued(by: v)
        case "owner":
          guard let v = value as? String else {
            reject(nil, "Invalid param for owner, should be a string", nil)
            continue
          }
          queryParams = queryParams.owned(by: v)
        case "offer_from":
          guard let v = value as? String else {
            reject(nil, "Invalid param for offer_from, should be a string", nil)
            continue
          }
          queryParams = queryParams.offer(from: v)
        case "offer_to":
          guard let v = value as? String else {
            reject(nil, "Invalid param for offer_to, should be a string", nil)
            continue
          }
          queryParams = queryParams.offer(to: v)
        case "asset_id":
          guard let v = value as? String else {
            reject(nil, "Invalid param for asset_id, should be a string", nil)
            continue
          }
          queryParams = queryParams.referenced(toAssetID: v)
        case "load_asset":
          guard let v = value as? Bool else {
            reject(nil, "Invalid param for load_asset, should be a boolean", nil)
            continue
          }
          queryParams = queryParams.loadAsset(v)
        default:
          reject(nil, "Invalid key " + key, nil)
          continue
        }
      }

      let (bitmarks, asset) = try Bitmark.list(params: queryParams)
      var result: [Any] = [try bitmarks.map { try $0.asDictionary() }]
      if let a = asset {
        result.append(try a.asDictionary())
      }

      resolve(result)

    }
    catch let e {
      reject(nil, nil, e);
    }
  }

  @objc(getTransaction:::)
  func getTransaction(_ transactionID: String, _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      let transaction = try Transaction.get(transactionID: transactionID)
      resolve(try transaction.asDictionary())
    }
    catch let e {
      reject(nil, nil, e)
    }
  }

  @objc(getTransactions:::)
  func getTransactions(_ params: [String: Any], _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      var queryParams = Transaction.newTransactionQueryParams()
      for (key, value) in params {
        switch key {
        case "limit":
          guard let v = value as? Int else {
            reject(nil, "Invalid param for limit, should be an int", nil)
            continue
          }
          queryParams = try queryParams.limit(size: v)
        case "owner":
          guard let v = value as? String else {
            reject(nil, "Invalid param for owner, should be a string", nil)
            continue
          }
          queryParams = queryParams.owned(by: v)
        case "asset_id":
          guard let v = value as? String else {
            reject(nil, "Invalid param for asset_id, should be a string", nil)
            continue
          }
          queryParams = queryParams.referenced(toAssetID: v)
        case "bitmark_id":
          guard let v = value as? String else {
            reject(nil, "Invalid param for bitmark_id, should be a string", nil)
            continue
          }
          queryParams = queryParams.referenced(toBitmarkID: v)
        case "load_asset":
          guard let v = value as? Bool else {
            reject(nil, "Invalid param for load_asset, should be a boolean", nil)
            continue
          }
          queryParams = queryParams.loadAsset(v)
        default:
          reject(nil, "Invalid key " + key, nil)
          continue
        }
      }

      let (transactions, asset) = try Transaction.list(params: queryParams)
      var result: [Any] = [try transactions.map { try $0.asDictionary() }]
      if let a = asset {
        result.append(try a.asDictionary())
      }

      resolve(result)
    }
    catch let e {
      reject(nil, nil, e);
    }
  }

  @objc(getAsset:::)
  func getAsset(_ assetID: String, _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      let asset = try Asset.get(assetID: assetID)
      resolve(try asset.asDictionary())
    }
    catch let e {
      reject(nil, nil, e)
    }
  }

  @objc(getAssets:::)
  func getAssets(_ params: [String: Any], _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      var queryParams = Asset.newQueryParams()
      for (key, value) in params {
        switch key {
        case "limit":
          guard let v = value as? Int else {
            reject(nil, "Invalid param for limit, should be an int", nil)
            continue
          }
          queryParams = try queryParams.limit(size: v)
        case "registrant":
          guard let v = value as? String else {
            reject(nil, "Invalid param for registrant, should be a string", nil)
            continue
          }
          queryParams = queryParams.registeredBy(registrant: v)
        default:
          reject(nil, "Invalid key " + key, nil)
          continue
        }
      }

      let assets = try Asset.list(params: queryParams)
      resolve(try assets.map { try $0.asDictionary() } )
    }
    catch let e {
      reject(nil, nil, e);
    }
  }
  
  @objc(replaceAccount:::)
  func replaceAccount(_ pharse: [String], _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      let tmpKey = "account_to_migrate"
      try KeychainUtil.removeTemporaryAccount(key: tmpKey)
      // Replace new account
      let accountMigrateTo = try Account(recoverPhrase: pharse, language: .english)
      try KeychainUtil.replaceCore(accountMigrateTo.seed.core,
                                    version: BitmarkSDKWrapper.stringFromVersion(accountMigrateTo.seed.version))
      self.account = accountMigrateTo
      
      resolve(accountMigrateTo.accountNumber)
      
    }
    catch let e {
      reject(nil, nil, e);
    }
  }

  @objc(migrate:::)
  func migrate(_ pharse: [String], _ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      guard let currentAccount = self.account else {
        reject(nil, BitmarkSDKWrapper.accountNotFound, nil)
        return
      }

      let accountMigrateTo = try Account(recoverPhrase: pharse, language: .english)

      let tmpKey = "account_to_migrate"

      // Temporary save the account to keychain for failure case
      try KeychainUtil.saveTemporaryAccount(accountMigrateTo, key: tmpKey)
      Migration.rekey(from: currentAccount, to: accountMigrateTo) { (progress, err) in
        if let err = err {
          reject(nil, nil, err)
          return
        }

        sendEvent(withName: "onMigrationProgress", body: ["progress": progress])

        if progress == 1 {
          try! KeychainUtil.removeTemporaryAccount(key: tmpKey)

          // Replace new account
          try! KeychainUtil.replaceCore(accountMigrateTo.seed.core,
                                        version: BitmarkSDKWrapper.stringFromVersion(accountMigrateTo.seed.version))
          self.account = accountMigrateTo

          resolve(accountMigrateTo.accountNumber)
        }
      }

    }
    catch let e {
      reject(nil, nil, e);
    }
  }

  @objc(resumeMigration::)
  func resumeMigration(_ resolve: @escaping RCTPromiseResolveBlock, _ reject: @escaping RCTPromiseRejectBlock) {
    do {
      guard let currentAccount = self.account else {
        reject(nil, BitmarkSDKWrapper.accountNotFound, nil)
        return
      }

      let tmpKey = "account_to_migrate"
      let accountMigrateTo = try KeychainUtil.loadTemporaryAccount(key: tmpKey)

      Migration.rekey(from: currentAccount, to: accountMigrateTo) { (progress, err) in
        if let err = err {
          reject(nil, nil, err)
          return
        }

        sendEvent(withName: "onMigrationProgress", body: ["progress": progress])

        if progress == 1 {
          try? KeychainUtil.removeTemporaryAccount(key: tmpKey)

          // Replace new account
          try? KeychainUtil.replaceCore(accountMigrateTo.seed.core,
                                        version: BitmarkSDKWrapper.stringFromVersion(accountMigrateTo.seed.version))
          self.account = accountMigrateTo

          resolve(accountMigrateTo.accountNumber)
        }
      }
    }
    catch let e {
      reject(nil, nil, e);
    }
  }

  override func supportedEvents() -> [String]! {
    return ["onMigrationProgress"]
  }
}

extension BitmarkSDKWrapper {

  static func networkWithName(name: String) -> Network {
    switch(name) {
    case "livenet":
      return Network.livenet
    case "testnet":
      return Network.testnet
    default:
      return Network.livenet
    }
  }

  static func versionFromString(_ version: String) -> SeedVersion {
    if version == "v2" {
      return SeedVersion.v2
    } else {
      return SeedVersion.v1
    }
  }

  static func stringFromVersion(_ version: SeedVersion) -> String {
    switch version {
    case .v1:
      return "v1"
    case .v2:
      return "v2"
    }
  }
}

extension Encodable {
  func asDictionary() throws -> [String: Any] {
    let data = try JSONEncoder().encode(self)
    guard let dictionary = try JSONSerialization.jsonObject(with: data, options: .allowFragments) as? [String: Any] else {
      throw NSError()
    }
    return dictionary
  }
}
