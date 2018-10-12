//
//  API+SessionData.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 11/2/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

import Foundation

public struct SessionData {
    let encryptedDataKey: Data
    let dataKeyAlgorithm: String
    
    public init (encryptedDataKey: Data, dataKeyAlgorithm: String) {
        self.encryptedDataKey = encryptedDataKey
        self.dataKeyAlgorithm = dataKeyAlgorithm
    }
}

extension SessionData: Codable {
    
    enum SessionDataKeys: String, CodingKey {
        case encryptedDataKey = "enc_data_key"
        case dataKeyAlgorithm = "data_key_alg"
    }
    
    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: SessionDataKeys.self)
        self.init(encryptedDataKey: try container.decode(String.self, forKey: SessionDataKeys.encryptedDataKey).hexDecodedData,
                  dataKeyAlgorithm: "chacha20poly1305")
    }
    
    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: SessionDataKeys.self)
        try container.encode(self.encryptedDataKey.hexEncodedString, forKey: .encryptedDataKey)
        try container.encode(self.dataKeyAlgorithm, forKey: .dataKeyAlgorithm)
    }
}

public extension SessionData {
    public func serialize() -> [String: String] {
        return ["enc_data_key": encryptedDataKey.hexEncodedString,
                "data_key_alg": dataKeyAlgorithm]
    }
}

struct AssetAccess {
    let url: String
    let sender: String?
    let sessionData: SessionData?
}

extension AssetAccess: Codable {
    
    enum AssetAccessKeys: String, CodingKey {
        case url = "url"
        case sender = "sender"
        case sessionData = "session_data"
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: AssetAccessKeys.self)
        self.init(url: try container.decode(String.self, forKey: AssetAccessKeys.url),
                  sender: try? container.decode(String.self, forKey: AssetAccessKeys.sender),
                  sessionData: try? container.decode(SessionData.self, forKey: AssetAccessKeys.sessionData))
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: AssetAccessKeys.self)
        try container.encode(self.url, forKey: .url)
        try container.encode(self.sender, forKey: .sender)
        try container.encode(self.sessionData, forKey: .sessionData)
    }
}

struct AssetGrant {
    let url: String?
    let from: String?
    let sessionData: SessionData?
}

extension AssetGrant: Codable {
    
    enum AssetGrantKeys: String, CodingKey {
        case url = "url"
        case from = "from"
        case sessionData = "session_data"
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: AssetGrantKeys.self)
        self.init(url: try? container.decode(String.self, forKey: AssetGrantKeys.url),
                  from: try? container.decode(String.self, forKey: AssetGrantKeys.from),
                  sessionData: try? container.decode(SessionData.self, forKey: AssetGrantKeys.sessionData))
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: AssetGrantKeys.self)
        try container.encode(self.url, forKey: .url)
        try container.encode(self.from, forKey: .from)
        try container.encode(self.sessionData, forKey: .sessionData)
    }
}

extension API {
    
    func registerEncryptionPublicKey(forAccount account: Account) throws {
        let signature = try account.authKey.sign(message: account.encryptionKey.publicKey).hexEncodedString
        let params = ["encryption_pubkey": account.encryptionKey.publicKey.hexEncodedString,
                      "signature": signature]
        
        let requestURL = endpoint.apiServerURL.appendingPathComponent("/v1/encryption_keys/" + account.accountNumber.string)
        
        var urlRequest = URLRequest(url: requestURL)
        urlRequest.httpMethod = "POST"
        urlRequest.httpBody = try JSONSerialization.data(withJSONObject: params, options: [])
        
        let _ = try urlSession.synchronousDataTask(with: urlRequest)
    }
    
    func getEncryptionPublicKey(accountNumber: String) throws -> String? {
        let urlString = "https://key.\(endpoint.assetServerURL.host!)/\(accountNumber)"
        let requestURL = URL(string: urlString)!
        let urlRequest = URLRequest(url: requestURL)
        
        let (data, _) = try urlSession.synchronousDataTask(with: urlRequest)
        
        let dic = try JSONDecoder().decode([String: String].self, from: data)
        return dic["encryption_pubkey"]
    }
    
    func updateSession(account: Account, bitmarkId: String, recipient: String, sessionData: SessionData, withIssue issue: Issue? = nil) throws {
        let requestURL = endpoint.apiServerURL.appendingPathComponent("/v2/session")
        
        let params: [String: Any] = ["bitmark_id": bitmarkId,
                                     "owner": recipient,
                                     "session_data": sessionData.serialize()]
        
        var urlRequest = URLRequest(url: requestURL)
        urlRequest.httpMethod = "POST"
        urlRequest.httpBody = try JSONSerialization.data(withJSONObject: params, options: [])
        let sessionDataSerialized = try JSONEncoder().encode(sessionData)
        try urlRequest.signRequest(withAccount: account, action: "updateSession", resource: String(data: sessionDataSerialized, encoding: .ascii)!)
        
        if let issue = issue {
            let bitmarkIssueBody = try JSONSerialization.data(withJSONObject: try issue.getRPCParam(), options: [])
            urlRequest.setValue(String(data: bitmarkIssueBody, encoding: .utf8), forHTTPHeaderField: "Bitmark-Issue-Body")
        }
        
        let _ = try urlSession.synchronousDataTask(with: urlRequest)
    }
    
    func getAssetAccess(account: Account, bitmarkId: String) throws -> AssetAccess {
        let requestURL = endpoint.apiServerURL.appendingPathComponent("/v1/bitmarks/" + bitmarkId + "/asset")
        var urlRequest = URLRequest(url: requestURL)
        urlRequest.httpMethod = "GET"
        try urlRequest.signRequest(withAccount: account, action: "downloadAsset", resource: bitmarkId)
        
        let (data, _) = try urlSession.synchronousDataTask(with: urlRequest)
        
        return try JSONDecoder().decode(AssetAccess.self, from: data)
    }
    
    func getAssetGrant(account: Account, grantId: String) throws -> AssetGrant {
        let requestURL = endpoint.apiServerURL.appendingPathComponent("/v2/access-grants/" + grantId)
        var urlRequest = URLRequest(url: requestURL)
        urlRequest.httpMethod = "GET"
        try urlRequest.signRequest(withAccount: account, action: "accessGrant", resource: grantId)
        
        let (data, res) = try urlSession.synchronousDataTask(with: urlRequest)
        
        return try JSONDecoder().decode(AssetGrant.self, from: data)
    }
}

extension SessionData {
    
    static func createSessionData(account: Account, sessionKey: Data, forRecipient publicKey: Data) throws -> SessionData {
        let encryptedSessionKey = try account.encryptionKey.publicKeyEncrypt(message: sessionKey,
                                                                             withRecipient: publicKey)
        
        return SessionData(encryptedDataKey: encryptedSessionKey,
                           dataKeyAlgorithm: "chacha20poly1305")
    }
    
    
}
