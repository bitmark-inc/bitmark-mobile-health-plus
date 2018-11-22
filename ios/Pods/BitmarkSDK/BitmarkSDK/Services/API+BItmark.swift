//
//  API+Bitmark.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 1/25/18.
//  Copyright © 2018 Bitmark. All rights reserved.
//

import Foundation

//extension API {
//    internal func bitmarkInfo(bitmarkId: String) throws -> BitmarkInfo? {
//        let requestURL = endpoint.apiServerURL.appendingPathComponent("/v1/bitmarks/" + bitmarkId)
//
//        var urlRequest = URLRequest(url: requestURL)
//        urlRequest.httpMethod = "GET"
//
//        let (data, _) = try urlSession.synchronousDataTask(with: urlRequest)
//
//        let dic = try JSONDecoder().decode([String: BitmarkInfo].self, from: data)
//        return dic["bitmark"]
//    }
//}

extension API {
    struct BitmarkQueryResponse: Codable {
        let bitmark: Bitmark
    }
    
    struct BitmarksQueryResponse: Codable {
        let bitmarks: [Bitmark]
        let assets: [Asset]?
    }
    
    internal func get(bitmarkID: String) throws -> Bitmark {
        var urlComponents = URLComponents(url: endpoint.apiServerURL.appendingPathComponent("/v3/bitmarks/" + bitmarkID), resolvingAgainstBaseURL: false)!
        urlComponents.queryItems = [URLQueryItem(name: "pending", value: "true")]
        let urlRequest = URLRequest(url: urlComponents.url!)
        let (data, _) = try urlSession.synchronousDataTask(with: urlRequest)
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .formatted(DateFormatter.iso8601Full)
        let result = try decoder.decode(BitmarkQueryResponse.self, from: data)
        return result.bitmark
    }
    
    internal func listBitmark(builder: Bitmark.QueryParam) throws -> ([Bitmark], [Asset]?) {
        let requestURL = builder.buildURL(baseURL: endpoint.apiServerURL, path: "/v3/bitmarks")
        let urlRequest = URLRequest(url: requestURL)
        let (data, _) = try urlSession.synchronousDataTask(with: urlRequest)
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .formatted(DateFormatter.iso8601Full)
        let result = try decoder.decode(BitmarksQueryResponse.self, from: data)
        return (result.bitmarks, result.assets)
    }
}
