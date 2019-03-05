//
//  API+Issuing.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 10/30/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

import Foundation

extension API {
    struct BitmarkResponse: Codable {
        let id: String
    }

    struct IssueResponse: Codable {
        var bitmarks: [BitmarkResponse]
    }
    
    internal func issue(withIssueParams issueParams: IssuanceParams) throws -> [String] {
        if issueParams.issuances.count == 0 {
            return [String]()
        }
        
        let payload = try issueParams.toJSON()
        
        let json = try JSONSerialization.data(withJSONObject: payload, options: [])
        
        let requestURL = endpoint.apiServerURL.appendingPathComponent("/v3/issue")
        
        var urlRequest = URLRequest(url: requestURL)
        urlRequest.httpBody = json
        urlRequest.httpMethod = "POST"
        
        let (data, _) = try urlSession.synchronousDataTask(with: urlRequest)
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .formatted(DateFormatter.iso8601Full)
        let issueResponse = try decoder.decode(IssueResponse.self, from: data)
        
        return issueResponse.bitmarks.map {$0.id}
    }
}
