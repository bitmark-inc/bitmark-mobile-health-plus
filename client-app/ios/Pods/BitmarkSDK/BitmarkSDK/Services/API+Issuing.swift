//
//  API+Issuing.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 10/30/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

import Foundation

extension API {
    internal func issue(withIssues issues: [Issue], assets: [Asset], transfer: Transfer? = nil) throws -> Bool {
        let issuePayloads = try issues.map {try $0.getRPCParam()}
        let assetPayloads = try assets.map {try $0.getRPCParam()}
        
        var payload: [String: Any] = ["issues": issuePayloads,
                       "assets": assetPayloads]
        
        if let transfer = transfer {
            if issues.count > 1 {
                return false
            }
            
            payload["transfer"] = try transfer.getRPCParam()["transfer"]
        }
        
        let json = try JSONSerialization.data(withJSONObject: payload, options: [])
        
        let requestURL = endpoint.apiServerURL.appendingPathComponent("/v1/issue")
        
        var urlRequest = URLRequest(url: requestURL)
        urlRequest.httpBody = json
        urlRequest.httpMethod = "POST"
        
        let result = try urlSession.synchronousDataTask(with: urlRequest)
        guard let data = result.data,
        let response = result.response else {
            return false
        }
        
        return 200..<300 ~= response.statusCode
    }
}
