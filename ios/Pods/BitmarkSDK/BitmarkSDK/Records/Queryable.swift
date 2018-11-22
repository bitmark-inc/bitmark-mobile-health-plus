//
//  Queryable.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 9/24/18.
//  Copyright © 2018 Bitmark. All rights reserved.
//

import Foundation

protocol QueryBuildable {
    var queryItems: [URLQueryItem] { get }
    func buildURL(baseURL: URL, path: String) -> URL
}

extension QueryBuildable {
    func buildURL(baseURL: URL, path: String) -> URL {
        let url = baseURL.appendingPathComponent(path)
        var urlComponents = URLComponents(url: url, resolvingAgainstBaseURL: false)!
        urlComponents.queryItems = queryItems
        return urlComponents.url!
    }
}
