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
}
