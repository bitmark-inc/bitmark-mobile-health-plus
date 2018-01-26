//
//  Chacha20Poly1305.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 11/10/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

import Foundation
import CryptoSwift

struct Chacha20Poly1305 {
    
    private static func roundTo16(n: Int) -> Int {
        return 16 * ((n + 15) / 16)
    }
    
    private static func paddingData(data: Data) -> Data {
        var result = Data(count: roundTo16(n: data.count))
        result.replaceSubrange(0..<data.count, with: data)
        return result
    }
    
    private static func countingData(data: Data) -> Data {
        var count = data.count.littleEndian
        return Data(bytes: &count, count: MemoryLayout.size(ofValue: count))
    }
    
    static func seal(withKey key: Data, nonce: Data, plainText: Data, additionalData: Data?) throws -> Data {
        let aData = additionalData ?? Data()
        
        let chacha20 = try ChaCha20(key: key.bytes, iv: nonce.bytes)
        let tagKey = try chacha20.encrypt([UInt8](repeating: 0x00, count: 64))[0..<32]
        
        let cipherBytes = try chacha20.encrypt(plainText.bytes)
        let cipherText = Data(bytes: cipherBytes)
        
        let tagInput = paddingData(data: aData) +
            paddingData(data: cipherText) +
            countingData(data: aData) +
            countingData(data: cipherText)
        
        let poly = Poly1305(key: Array(tagKey))
        let tagBytes = try poly.authenticate(tagInput.bytes)
        
        return Data(bytes: cipherBytes + tagBytes)
    }
    
    static func open(withKey key: Data, nonce: Data, cipherText: Data, additionalData: Data?) throws -> Data {
        let aData = additionalData ?? Data()
        
        let tagData = cipherText.subdata(in: (cipherText.count - Poly1305.blockSize)..<cipherText.count)
        let chacha20Cipher = cipherText.subdata(in: 0..<(cipherText.count - Poly1305.blockSize))
        
        let chacha20 = try ChaCha20(key: key.bytes, iv: nonce.bytes)
        let tagKey = try chacha20.encrypt([UInt8](repeating: 0x00, count: 64))[0..<32]
        
        let plainBytes = try chacha20.decrypt(chacha20Cipher.bytes)
        
        let tagInput = paddingData(data: aData) +
            paddingData(data: chacha20Cipher) +
            countingData(data: aData) +
            countingData(data: chacha20Cipher)
        
        let poly = Poly1305(key: Array(tagKey))
        let tagBytes = try poly.authenticate(tagInput.bytes)
        if tagData.bytes != tagBytes {
            throw(BMError("Failed to authenticate with chacha20-poly1305, expect: \(tagData.hexEncodedString), actual: \(Data(bytes: tagBytes).hexEncodedString)"))
        }
        
        return Data(bytes: plainBytes)
    }
}
