//
//  AssetQuery.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 9/24/18.
//  Copyright © 2018 Bitmark. All rights reserved.
//

import Foundation

public extension Asset {
    public struct QueryParam: QueryBuildable {
        let queryItems: [URLQueryItem]
        
        public func limit(size: Int) throws -> QueryParam {
            if size > 100 {
                throw("invalid size: max = 100")
            }
            
            let queryItem = URLQueryItem(name: "limit", value: String(size))
            var items = self.queryItems
            items.append(queryItem)
            return QueryParam(queryItems: items)
        }
        
        public func registeredBy(registrant: String) -> QueryParam {
            let queryItem = URLQueryItem(name: "registrant", value: registrant)
            var items = self.queryItems
            items.append(queryItem)
            return QueryParam(queryItems: items)
        }
    }
}
