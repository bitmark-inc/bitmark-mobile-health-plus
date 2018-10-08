//
//  FileUtil.swift
//  BitmarkSDK
//
//  Created by Anh Nguyen on 10/11/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

import Foundation
import TweetNacl

public struct FileUtil {
    public enum FileUtilError: Error {
        case randomFailed
        case openFileFailed
        case sha3ChunkFailed
    }
    
    public struct Fingerprint {
        public static func computeFingerprint(data: Data) -> String {
            let sha3Data = data.sha3(length: 512)
            return "01" + sha3Data.hexEncodedString
        }
    }
}
