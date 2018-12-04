//
//  Transaction.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 9/25/18.
//  Copyright © 2018 Bitmark. All rights reserved.
//

import Foundation

public struct Transaction: Codable {
    let id: String
    let bitmark_id: String
    let asset_id: String
    let owner: String
    let status: String
    let block_number: Int64
    let offset: Int64
}

extension Transaction {
    // MARK:- Query
    public static func get(transactionID: String, completionHandler: @escaping (Transaction?, Error?) -> Void) {
        DispatchQueue.global().async {
            do {
                let transaction = try get(transactionID: transactionID)
                completionHandler(transaction, nil)
            } catch let e {
                completionHandler(nil, e)
            }
        }
    }
    
    public static func get(transactionID: String) throws -> Transaction {
        let api = API()
        return try api.get(transactionID: transactionID)
    }
    
    public static func newTransactionQueryParams() -> QueryParam {
        return QueryParam(queryItems: [URLQueryItem]())
    }
    
    public static func list(params: QueryParam, completionHandler: @escaping ([Transaction]?, [Asset]?, Error?) -> Void) {
        DispatchQueue.global().async {
            do {
                let (transactions, assets) = try list(params: params)
                completionHandler(transactions, assets, nil)
            } catch let e {
                completionHandler(nil, nil, e)
            }
        }
    }
    
    public static func list(params: QueryParam) throws -> ([Transaction], [Asset]?) {
        let api = API()
        return try api.listTransaction(builder: params)
    }
}

extension Transaction: Hashable {
    public var hashValue: Int {
        return self.id.hashValue
    }
    
    public func hash(into hasher: inout Hasher) {
        hasher.combine(self.id)
    }
}

extension Transaction: Equatable {
    public static func == (lhs: Transaction, rhs: Transaction) -> Bool {
        return lhs.id == rhs.id
    }
}
