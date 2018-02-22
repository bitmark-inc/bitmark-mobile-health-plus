//
//  API+Transfer.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 10/31/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

import Foundation

extension API {
    internal func transfer(withData transfer: Transfer) throws -> Bool {
        let json = try JSONSerialization.data(withJSONObject: transfer.getRPCParam(), options: [])
        
        let requestURL = endpoint.apiServerURL.appendingPathComponent("/v1/transfer")
        
        var urlRequest = URLRequest(url: requestURL, cachePolicy: .reloadIgnoringCacheData)
        urlRequest.httpBody = json
        urlRequest.httpMethod = "POST"
        
        let (result, response) = try urlSession.synchronousDataTask(with: urlRequest)
        
        guard let r = result,
            let res = response else {
            return false
        }
        
        return 200..<300 ~= res.statusCode
    }
    
    internal func transfer(withData countersignTransfer: CountersignedTransferRecord) throws -> String {
        let body = ["transfer": countersignTransfer]
        let json = try JSONEncoder().encode(body)
        
        let requestURL = endpoint.apiServerURL.appendingPathComponent("/v1/transfer")
        
        var urlRequest = URLRequest(url: requestURL, cachePolicy: .reloadIgnoringCacheData)
        urlRequest.httpBody = json
        urlRequest.httpMethod = "POST"
        
        let (result, response) = try urlSession.synchronousDataTask(with: urlRequest)
        
        guard let r = result,
            let _ = response else {
                throw("Invalid response from gateway server")
        }
        
        let responseData = try JSONDecoder().decode([[String: String]].self, from: r)
        guard let txid = responseData[0]["txid"] else {
            throw("Invalid response from gateway server")
        }
        
        return txid
    }
}
