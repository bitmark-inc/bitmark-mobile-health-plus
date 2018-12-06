//
//  API+Asset.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 9/21/18.
//  Copyright © 2018 Bitmark. All rights reserved.
//

import Foundation

extension API {
    private struct AssetResponse: Codable {
        let asset: Asset
    }
    
    private struct AssetsResponse: Codable {
        let assets: [Asset]
    }
    
    internal func register(assets params: [RegistrationParams]) throws -> [String] {
        let payloads = try params.map {try $0.toJSON()}
        
        let body: [String: Any] = ["assets": payloads]
        
        let json = try JSONSerialization.data(withJSONObject: body, options: [])
        
        let requestURL = endpoint.apiServerURL.appendingPathComponent("/v3/register-asset")
        
        var urlRequest = URLRequest(url: requestURL)
        urlRequest.httpBody = json
        urlRequest.httpMethod = "POST"
        
        let _ = try urlSession.synchronousDataTask(with: urlRequest)
        return params.map {$0.id!}
    }
    
    internal func get(assetID: String) throws -> Asset {
        var urlComponents = URLComponents(url: endpoint.apiServerURL.appendingPathComponent("/v3/assets/" + assetID), resolvingAgainstBaseURL: false)!
        urlComponents.queryItems = [URLQueryItem(name: "pending", value: "true")]
        let urlRequest = URLRequest(url: urlComponents.url!)
        let (data, _) = try urlSession.synchronousDataTask(with: urlRequest)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .formatted(DateFormatter.iso8601Full)
        let result = try decoder.decode(AssetResponse.self, from: data)
        return result.asset
    }
    
    internal func listAsset(builder: Asset.QueryParam) throws -> [Asset] {
        let requestURL = builder.buildURL(baseURL: endpoint.apiServerURL, path: "/v3/assets")
        let urlRequest = URLRequest(url: requestURL)
        let (data, _) = try urlSession.synchronousDataTask(with: urlRequest)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .formatted(DateFormatter.iso8601Full)
        let result = try decoder.decode(AssetsResponse.self, from: data)
        return result.assets
    }
}
