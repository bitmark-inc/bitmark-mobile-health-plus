//
//  API+Assets.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 10/30/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

import Foundation

internal extension API {
    internal func uploadAsset(data: Data, fileName: String, assetId: String, accessibility: Accessibility, fromAccount account: Account) throws -> (SessionData?, Bool, Data?) {
        var params = ["asset_id": assetId,
                      "accessibility": accessibility.rawValue]
        
        let requestURL = endpoint.apiServerURL.appendingPathComponent("/v1/assets")
        
        var urlRequest: URLRequest
        var sessionData: SessionData?
        var encryptedData: Data?
        
        switch accessibility {
        case .publicAsset:
            urlRequest = API.multipartRequest(data: data, fileName: fileName, toURL: requestURL, otherParams: params)
        case .privateAsset:
            let assetEncryption = try AssetEncryption()
            let (e, sData) = try assetEncryption.encrypt(data: data, signWithAccount: account)
            let sessionDataSerialized = try JSONEncoder().encode(sData)
            params["session_data"] = String(data: sessionDataSerialized, encoding: .utf8)
            sessionData = sData
            
            urlRequest = API.multipartRequest(data: e, fileName: fileName, toURL: requestURL, otherParams: params)
            encryptedData = e
        }
        
        try urlRequest.signRequest(withAccount: account, action: "uploadAsset", resource: assetId)
        
        let _ = try urlSession.synchronousDataTask(with: urlRequest)
        
        return (sessionData, true, encryptedData)
    }
    
    internal func getAssetContent(url: String) throws -> (String?, Data?) {
        var request = URLRequest(url: URL(string: url)!)
        request.httpMethod = "GET"
        
        let result = try urlSession.synchronousDataTask(with: request)
        return (result.response.suggestedFilename, result.data)
    }
    
    internal func createSessionData(key: Data, fromAccount account: Account) throws -> SessionData {
        return try SessionData.createSessionData(account: account,
                                          sessionKey: key,
                                          forRecipient: account.encryptionKey.publicKey)
    }
}

fileprivate extension API {
    fileprivate static func multipartRequest(data: Data, fileName: String, toURL url: URL, otherParams: [String: String]?) -> URLRequest {
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        let boundary = "Boundary-\(UUID().uuidString)"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        request.httpBody = createBody(parameters: otherParams, boundary: boundary, data: data, mimeType: "", filename: fileName)
        
        return request
    }
    
    fileprivate static func createBody(parameters: [String: String]?,
                                   boundary: String,
                                   data: Data,
                                   mimeType: String,
                                   filename: String) -> Data {
        var body = Data()
        
        let boundaryPrefix = "--\(boundary)\r\n"
        
        if let parameters = parameters {
            for (key, value) in parameters {
                body.append(string: boundaryPrefix)
                body.append(string: "Content-Disposition: form-data; name=\"\(key)\"\r\n\r\n")
                body.append(string: "\(value)\r\n")
            }
        }
        
        body.append(string: boundaryPrefix)
        body.append(string: "Content-Disposition: form-data; name=\"file\"; filename=\"\(filename)\"\r\n")
        body.append(string: "Content-Type: \(mimeType)\r\n\r\n")
        body.append(data)
        body.append(string: "\r\n")
        body.append(string: "--".appending(boundary.appending("--")))
        
        return body
    }
}

fileprivate extension Data {
    fileprivate mutating func append(string: String) {
        if let data = string.data(using: .utf8) {
            self.append(data)
        }
    }
}
