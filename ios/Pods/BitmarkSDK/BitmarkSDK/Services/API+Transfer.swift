//
//  API+Transfer.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 10/31/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

import Foundation

extension API {
    internal func transfer(withData transfer: Transfer) throws {
        let json = try JSONSerialization.data(withJSONObject: transfer.getRPCParam(), options: [])
        
        let requestURL = endpoint.apiServerURL.appendingPathComponent("/v1/transfer")
        
        var urlRequest = URLRequest(url: requestURL, cachePolicy: .reloadIgnoringCacheData)
        urlRequest.httpBody = json
        urlRequest.httpMethod = "POST"
        
        let _ = try urlSession.synchronousDataTask(with: urlRequest)
    }
    
    internal func transfer(withData countersignTransfer: CountersignedTransferRecord) throws -> String {
        let body = ["transfer": countersignTransfer]
        let json = try JSONEncoder().encode(body)
        
        let requestURL = endpoint.apiServerURL.appendingPathComponent("/v1/transfer")
        
        var urlRequest = URLRequest(url: requestURL, cachePolicy: .reloadIgnoringCacheData)
        urlRequest.httpBody = json
        urlRequest.httpMethod = "POST"
        
        let (data, _) = try urlSession.synchronousDataTask(with: urlRequest)
        
        let responseData = try JSONDecoder().decode([[String: String]].self, from: data)
        guard let txid = responseData[0]["txid"] else {
            throw("Invalid response from gateway server")
        }
        
        return txid
    }
    
    internal func submitTransferOffer(withSender sender: Account, offer: TransferOffer, extraInfo: [String: Any]?) throws -> String {
        let requestURL = endpoint.apiServerURL.appendingPathComponent("/v2/transfer_offers")
        
        var params: [String: Any] = ["from": sender.accountNumber.string,
                    "record": try offer.serialize()]
        if let extraInfo = extraInfo {
            params["extra_info"] = extraInfo
        }
        
        var urlRequest = URLRequest(url: requestURL)
        urlRequest.httpMethod = "POST"
        urlRequest.httpBody = try JSONSerialization.data(withJSONObject: params, options: [])
        
        let action = "transferOffer"
        let resource = String(data: try JSONEncoder().encode(try offer.serialize()), encoding: .utf8)!
        
        try urlRequest.signRequest(withAccount: sender, action: action, resource: resource)
        
        let (data, res) = try urlSession.synchronousDataTask(with: urlRequest)
        
        let responseData = try JSONDecoder().decode([String: String].self, from: data)
        guard let offerId = responseData["offer_id"] else {
            throw("Invalid response from gateway server")
        }
        
        return offerId
    }
    
    internal func completeTransferOffer(withAccount account: Account, offerId: String, action: String, counterSignature: String) throws -> Bool {
        let requestURL = endpoint.apiServerURL.appendingPathComponent("/v2/transfer_offers")
        
        let params: [String: Any]  = ["id": offerId,
                                      "reply":
                                        ["action": action,
                                         "countersignature": counterSignature]]
        
        var urlRequest = URLRequest(url: requestURL)
        urlRequest.httpMethod = "PATCH"
        urlRequest.httpBody = try JSONSerialization.data(withJSONObject: params, options: [])
        try urlRequest.signRequest(withAccount: account, action: "transferOffer", resource: "patch")
        
        let (data, res) = try urlSession.synchronousDataTask(with: urlRequest)
        
        return true
    }
    
    internal func getTransferOffer(withId offerID: String) throws -> TransferOffer {
        var url = URLComponents(url: endpoint.apiServerURL.appendingPathComponent("/v2/transfer_offers"), resolvingAgainstBaseURL: false)!
        url.queryItems = [
            URLQueryItem(name: "offer_id", value: offerID)
        ]
        
        let urlRequest = URLRequest(url: url.url!)
        
        let (data, res) = try urlSession.synchronousDataTask(with: urlRequest)
        
        guard let responseData = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] else {
            throw("Cannot parse response")
        }
        
        guard let offerInfo = responseData["offer"] as? [String: Any],
            let record = offerInfo["record"] as? [String: Any],
            let link = record["link"] as? String,
            let owner = record["owner"] as? String,
            let signature = record["signature"] as? String else {
                throw("Invalid response from gateway server")
        }
        
        let offer = TransferOffer(txId: link, receiver: try AccountNumber(address: owner), signature: signature.hexDecodedData)
        
        return offer
    }
}
