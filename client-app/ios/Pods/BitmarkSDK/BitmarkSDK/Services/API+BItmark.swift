//
//  API+BItmark.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 1/25/18.
//  Copyright © 2018 Bitmark. All rights reserved.
//

import Foundation

struct BitmarkInfo {
    let headId: String
    let owner: String
    let id: String
    let issuer: String
}

extension BitmarkInfo: Codable {
    enum BitmarkInfoKeys: String, CodingKey {
        case headId = "head_id"
        case owner = "owner"
        case id = "id"
        case issuer = "issuer"
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: BitmarkInfoKeys.self)
        self.init(headId: try container.decode(String.self, forKey: BitmarkInfoKeys.headId),
                  owner:  try container.decode(String.self, forKey: BitmarkInfoKeys.owner),
                  id:  try container.decode(String.self, forKey: BitmarkInfoKeys.id),
                  issuer:  try container.decode(String.self, forKey: BitmarkInfoKeys.issuer))
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: BitmarkInfoKeys.self)
        try container.encode(self.headId, forKey: .headId)
        try container.encode(self.owner, forKey: .owner)
        try container.encode(self.id, forKey: .id)
        try container.encode(self.issuer, forKey: .issuer)
    }
}

extension API {
    internal func bitmarkInfo(bitmarkId: String) throws -> BitmarkInfo? {
        let requestURL = endpoint.apiServerURL.appendingPathComponent("/v1/bitmarks/" + bitmarkId)
        
        var urlRequest = URLRequest(url: requestURL)
        urlRequest.httpMethod = "GET"
        
        let result = try urlSession.synchronousDataTask(with: urlRequest)
        guard let data = result.data,
            let response = result.response else {
                return nil
        }
        
        if !(200..<300 ~= response.statusCode) {
            return nil
        }
        
        let dic = try JSONDecoder().decode([String: BitmarkInfo].self, from: data)
        return dic["bitmark"]
    }
}
