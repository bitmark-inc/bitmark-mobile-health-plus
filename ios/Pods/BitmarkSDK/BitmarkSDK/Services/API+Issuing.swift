//
//  API+Issuing.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 10/30/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

import Foundation

extension API {
    internal func issue(withIssues issues: [Issue], assets: [Asset], transfer: Transfer? = nil) throws {
        let issuePayloads = try issues.map {try $0.getRPCParam()}
        let assetPayloads = try assets.map {try $0.getRPCParam()}
        
        var payload: [String: Any] = ["issues": issuePayloads,
                       "assets": assetPayloads]
        
        if let transfer = transfer {
            if issues.count > 1 {
                throw("Issue count needs to be 1")
            }
            
            payload["transfer"] = try transfer.getRPCParam()["transfer"]
        }
        
        let json = try JSONSerialization.data(withJSONObject: payload, options: [])
        
        let requestURL = endpoint.apiServerURL.appendingPathComponent("/v1/issue")
        
        var urlRequest = URLRequest(url: requestURL)
        urlRequest.httpBody = json
        urlRequest.httpMethod = "POST"
        
        let _ = try urlSession.synchronousDataTask(with: urlRequest)
    }
    
    internal func issueV2(withAccount account: Account, issues: [Issue], assets: [Asset], transferOffer: TransferOffer? = nil, sessionData: SessionData? = nil, extraInfo: [String: Any]? = nil) throws {
        let requestURL = endpoint.apiServerURL.appendingPathComponent("/v2/issue")
        var urlRequest = URLRequest(url: requestURL)
        
        let issuePayloads = try issues.map {try $0.getRPCParam()}
        let assetPayloads = try assets.map {try $0.getRPCParam()}
        
        var payload: [String: Any] = ["issues": issuePayloads,
                                      "assets": assetPayloads]
        
        if let transferOffer = transferOffer {
            if issues.count > 1 {
                throw("Giveaway issue only supports one bitmark")
            }
            
            var transferOfferBody: [String: Any] = ["from": account.accountNumber.string,
                                                    "record": try transferOffer.serialize()]
            if let sessionData = sessionData {
                transferOfferBody["session_data"] = sessionData.serialize()
            }
            
            if let extraInfo = extraInfo {
                transferOfferBody["extra_info"] = extraInfo
            }
            
            payload["transfer_offer"] = transferOfferBody
            
            let action = "transferOffer"
            let encoder = JSONEncoder()
            encoder.outputFormatting = .sortedKeys
            let resource = String(data: try encoder.encode(transferOffer), encoding: .utf8)!
            
            try urlRequest.signRequest(withAccount: account, action: action, resource: resource)
        }
        
        let json = try JSONSerialization.data(withJSONObject: payload, options: [])
        urlRequest.httpBody = json
        urlRequest.httpMethod = "POST"
        
        let _ = try urlSession.synchronousDataTask(with: urlRequest)
    }
}
