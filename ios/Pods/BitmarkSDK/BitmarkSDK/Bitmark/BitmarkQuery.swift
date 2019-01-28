//
//  BitmarkQuery.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 9/25/18.
//  Copyright © 2018 Bitmark. All rights reserved.
//

import Foundation

public extension Bitmark {
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
        
        public func issued(by issuer: String) -> QueryParam {
            let queryItem = URLQueryItem(name: "issuer", value: issuer)
            var items = self.queryItems
            items.append(queryItem)
            return QueryParam(queryItems: items)
        }
        
        public func owned(by owner: String) -> QueryParam {
            let queryItem = URLQueryItem(name: "owner", value: owner)
            var items = self.queryItems
            items.append(queryItem)
            return QueryParam(queryItems: items)
        }
        
        public func offer(from sender: String) -> QueryParam {
            let queryItem = URLQueryItem(name: "offer_from", value: sender)
            var items = self.queryItems
            items.append(queryItem)
            return QueryParam(queryItems: items)
        }
        
        public func offer(to receiver: String) -> QueryParam {
            let queryItem = URLQueryItem(name: "offer_to", value: receiver)
            var items = self.queryItems
            items.append(queryItem)
            return QueryParam(queryItems: items)
        }
        
        public func referenced(toAssetID assetID: String) -> QueryParam {
            let queryItem = URLQueryItem(name: "asset_id", value: assetID)
            var items = self.queryItems
            items.append(queryItem)
            return QueryParam(queryItems: items)
        }
        
        public func loadAsset(_ loadAsset: Bool) -> QueryParam {
            let queryItem = URLQueryItem(name: "asset", value: String(loadAsset))
            var items = self.queryItems
            items.append(queryItem)
            return QueryParam(queryItems: items)
        }
        
        public func at(_ index: Int64) -> QueryParam {
            let queryItem = URLQueryItem(name: "at", value: String(index))
            var items = self.queryItems
            items.append(queryItem)
            return QueryParam(queryItems: items)
        }
        
        public func to(direction: QueryDirection) -> QueryParam {
            let queryItem = URLQueryItem(name: "to", value: direction.rawValue)
            var items = self.queryItems
            items.append(queryItem)
            return QueryParam(queryItems: items)
        }
        
        public func includePending(_ pending: Bool) -> QueryParam {
            let queryItem = URLQueryItem(name: "pending", value: String(pending))
            var items = self.queryItems
            items.append(queryItem)
            return QueryParam(queryItems: items)
        }
    }
}
