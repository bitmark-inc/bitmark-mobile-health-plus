//
//  Common.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 12/16/16.
//  Copyright © 2016 Bitmark. All rights reserved.
//

import Foundation

public class Common {
    static func getKey(byValue value: UInt64) -> KeyType? {
        
        for keyType in Config.keyTypes {
            if keyType.value == value {
                return keyType
            }
        }
        
        return nil
    }
    
    static func getNetwork(byAddressValue value: UInt64) -> Network? {
        
        for network in Config.networks {
            if network.rawValue == value {
                return network
            }
        }
        
        return nil
    }
    
    public static func randomBytes(length: Int) -> Data {
        var data = Data(count: length)
        _ = data.withUnsafeMutableBytes {
            return SecRandomCopyBytes(kSecRandomDefault, length, $0)
        }
        
        return data
    }
    
    public static func timestamp() -> String {
        return String(Int(Date().timeIntervalSince1970 * 1000))
    }
}

extension String: Error {
    public var localizedDescription: String {
        get {
            return self
        }
    }
}

extension DateFormatter {
    static let iso8601Full: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ"
        formatter.calendar = Calendar(identifier: .iso8601)
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.locale = Locale(identifier: "en_US_POSIX")
        return formatter
    }()
}
