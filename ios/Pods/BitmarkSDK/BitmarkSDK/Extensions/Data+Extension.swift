//
//  Data+Extension.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 12/19/16.
//  Copyright © 2016 Bitmark. All rights reserved.
//

import Foundation
import TweetNacl

public extension Data {
    public func concating(data: Data) -> Data {
        let buffer1 = [UInt8](self)
        let buffer2 = [UInt8](data)
        let buffer = buffer1 + buffer2
        return Data(bytes: buffer)
    }
    
    public func slice(start: Int, end: Int) -> Data {
        let trueEnd = Swift.min(end, self.count)
        return self.subdata(in: start..<trueEnd)
    }
    
    // Hex string
    public var hexEncodedString: String {
        return reduce("") {$0 + String(format: "%02x", $1)}
    }
}

public extension String {
    public var hexDecodedData: Data {
        var str = self
        if self.count % 2 == 1 {
            str = str + "0"
        }
        var hex = str
        var data = Data()
        while(hex.count > 0) {
            let c: String = hex.substring(to: hex.index(hex.startIndex, offsetBy: 2))
            hex = hex.substring(from: hex.index(hex.startIndex, offsetBy: 2))
            var ch: UInt32 = 0
            Scanner(string: c).scanHexInt32(&ch)
            var char = UInt8(ch)
            data.append(&char, count: 1)
        }
        return data
    }
}
