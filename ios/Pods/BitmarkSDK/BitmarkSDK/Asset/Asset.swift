//
//  Asset.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 8/24/18.
//  Copyright © 2018 Bitmark. All rights reserved.
//

import Foundation

public struct Asset: Codable {
    let id: String
    let name: String
    let metadata: [String: String]
    let fingerprint: String
    let registrant: String
    let status: String
    let block_number: Int64
    let offset: Int64
    let created_at: Date
}

public extension Asset {
    // MARK:- Static methods
    public static func newRegistrationParams(name: String, metadata: [String: String]) throws -> RegistrationParams {
        var registrationParam = RegistrationParams()
        try registrationParam.set(name: name)
        try registrationParam.set(metadata: metadata)
        return registrationParam
    }
    
    public static func register(_ params: RegistrationParams) throws -> String{
        let api = API()
        let assetIDs = try api.register(assets: [params])
        guard let assetID = assetIDs.first else {
            throw "Fail to register asset"
        }
        
        return assetID
    }
    
    // MARK:- Query
    public static func get(assetID: String, completionHandler: @escaping (Asset?, Error?) -> Void) {
        DispatchQueue.global().async {
            do {
                let asset = try get(assetID: assetID)
                completionHandler(asset, nil)
            } catch let e {
                completionHandler(nil, e)
            }
        }
    }
    
    public static func get(assetID: String) throws -> Asset {
        let api = API()
        return try api.get(assetID: assetID)
    }
    
    public static func newQueryParams() -> Asset.QueryParam {
        return Asset.QueryParam(queryItems: [URLQueryItem]())
    }
    
    public static func list(params: Asset.QueryParam, completionHandler: @escaping ([Asset]?, Error?) -> Void) {
        DispatchQueue.global().async {
            do {
                let assets = try list(params: params)
                completionHandler(assets, nil)
            } catch let e {
                completionHandler(nil, e)
            }
        }
    }
    
    public static func list(params: Asset.QueryParam) throws -> [Asset] {
        let api = API()
        return try api.listAsset(builder: params)
    }
}

extension Asset: Hashable {
    public var hashValue: Int {
        return self.id.hashValue
    }
    
    public func hash(into hasher: inout Hasher) {
        hasher.combine(self.id)
    }
}

extension Asset: Equatable {
    public static func == (lhs: Asset, rhs: Asset) -> Bool {
        return lhs.id == rhs.id
    }
}
