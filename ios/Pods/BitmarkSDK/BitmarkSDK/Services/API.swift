//
//  API.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 10/27/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

import Foundation

protocol APIEndpoint {
    var apiServerURL: URL {get}
    var assetServerURL: URL {get}
}

internal struct API {
    let endpoint: APIEndpoint
    let urlSession = URLSession(configuration: URLSessionConfiguration.default)
    
    init(network: Network) {
        self.init(apiEndpoint: network)
    }
    
     init(apiEndpoint: APIEndpoint) {
        endpoint = apiEndpoint
    }
}

internal extension URLRequest {
    internal mutating func signRequest(withAccount account: Account, action: String, resource: String) throws {
        let timestamp = Common.timestamp()
        let parts = [action, resource, account.accountNumber.string, timestamp]
        try signRequest(withAccount: account, parts: parts, timestamp: timestamp)
    }
    
    internal mutating func signRequest(withAccount account: Account, parts: [String], timestamp: String) throws {
        let message = parts.joined(separator: "|")
        print(message)
        
        let signature = try account.authKey.sign(message: message).hexEncodedString
        
        self.addValue(account.accountNumber.string, forHTTPHeaderField: "requester")
        self.addValue(timestamp, forHTTPHeaderField: "timestamp")
        self.addValue(signature, forHTTPHeaderField: "signature")
    }
}

internal extension URLSession {
    
    func synchronousDataTask(with request: URLRequest) throws -> (data: Data, response: HTTPURLResponse) {
        
        let semaphore = DispatchSemaphore(value: 0)
        
        var responseData: Data?
        var theResponse: URLResponse?
        var theError: Error?
        
        
        print("========================================================")
        print("Request for url: \(request.url!.absoluteURL)")
        
        
        if let method = request.httpMethod {
            print("Request method: \(method)")
        }

        if let header = request.allHTTPHeaderFields {
            print("Request Header: \(header)")
        }

        if let body = request.httpBody {
            print("Request Body: \(String(data: body, encoding: .ascii)!)")
        }
        
        dataTask(with: request) { (data, response, error) -> Void in
            responseData = data
            theResponse = response
            theError = error
            
            semaphore.signal()
            
            }.resume()
        
        _ = semaphore.wait(timeout: .distantFuture)
        
        if let error = theError {
            throw error
        }
        
        if let responseD = responseData {
            print("Resonpose Body: \(String(data: responseD, encoding: .ascii)!)")
        }

        print("========================================================")
        
        guard let data = responseData,
            let response = theResponse as? HTTPURLResponse else {
                throw("Empty response from request: " + request.description)
        }
        
        if 200..<300 ~= response.statusCode {
            return (data: data, response: response)
        } else {
            let responseMessage = String(data: data, encoding: .utf8)!
            let requestMethod = request.httpMethod ?? "GET"
            throw("Request " + requestMethod + " " + request.url!.absoluteString + " returns statuscode: " + String(response.statusCode) + " with data: " + responseMessage)
        }
        
    }
    
}
