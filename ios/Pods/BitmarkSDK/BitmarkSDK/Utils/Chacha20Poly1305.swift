//
//  Chacha20Poly1305.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 11/10/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

import Foundation
import libsodium

struct Chacha20Poly1305 {
    
    enum Chacha20Error: Error {
        case cannotEncrypt
        case cannotDecrypt
    }
    
    static func seal(withKey key: Data, nonce: Data, plainText: Data, additionalData: Data?) throws -> Data {
        let aData = additionalData ?? Data()
        
        var cipherText = Data(count: plainText.count + Int(crypto_aead_chacha20poly1305_IETF_ABYTES) + aData.count)
        let tmpLength = UnsafeMutablePointer<UInt64>.allocate(capacity: 1)
        
        let result = cipherText.withUnsafeMutableBytes({ (cipherTextPointer: UnsafeMutablePointer<UInt8>) -> Int32 in
            return nonce.withUnsafeBytes({ (noncePointer: UnsafePointer<UInt8>) -> Int32 in
                return key.withUnsafeBytes({ (keyPointer: UnsafePointer<UInt8>) -> Int32 in
                    return plainText.withUnsafeBytes({ (plainTextPointer: UnsafePointer<UInt8>) -> Int32 in
                        return aData.withUnsafeBytes({ (aPointer: UnsafePointer<UInt8>) -> Int32 in
                            return libsodium.crypto_aead_chacha20poly1305_ietf_encrypt(cipherTextPointer,
                                                                                       tmpLength,
                                                                                       plainTextPointer,
                                                                                       UInt64(plainText.count),
                                                                                       aPointer,
                                                                                       UInt64(aData.count),
                                                                                       nil,
                                                                                       noncePointer,
                                                                                       keyPointer)
                        })
                    })
                })
            })
        })
        
        if result != 0 {
            throw Chacha20Error.cannotEncrypt
        }
        
        return cipherText
    }
    
    static func open(withKey key: Data, nonce: Data, cipherText: Data, additionalData: Data?) throws -> Data {
        
        let aData = additionalData ?? Data()
        var plainText = Data(count: cipherText.count - Int(crypto_aead_chacha20poly1305_IETF_ABYTES) - aData.count)
        let tmpLength = UnsafeMutablePointer<UInt64>.allocate(capacity: 1)

        let result = plainText.withUnsafeMutableBytes({ (plainTextPointer: UnsafeMutablePointer<UInt8>) -> Int32 in
            return nonce.withUnsafeBytes({ (noncePointer: UnsafePointer<UInt8>) -> Int32 in
                return key.withUnsafeBytes({ (keyPointer: UnsafePointer<UInt8>) -> Int32 in
                    return cipherText.withUnsafeBytes({ (cipherTextPointer: UnsafePointer<UInt8>) -> Int32 in
                        return aData.withUnsafeBytes({ (aPointer: UnsafePointer<UInt8>) -> Int32 in
                            return libsodium.crypto_aead_chacha20poly1305_ietf_decrypt(plainTextPointer,
                                                                                       tmpLength,
                                                                                       nil,
                                                                                       cipherTextPointer,
                                                                                       UInt64(cipherText.count),
                                                                                       aPointer,
                                                                                       UInt64(aData.count),
                                                                                       noncePointer,
                                                                                       keyPointer)
                        })
                    })
                })
            })
        })
        
        if result != 0 {
            throw Chacha20Error.cannotEncrypt
        }
        
        return plainText
    }
}
