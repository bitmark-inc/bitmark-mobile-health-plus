//
//  BitmarkSDKBridge.m
//  Bitmark
//
//  Created by Anh Nguyen on 1/26/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(BitmarkSDK, NSObject)

RCT_EXTERN_METHOD(newAccount:(NSString)network:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(newAccountFrom24Words:(NSArray<NSString *> *)pharse:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(accountInfo:(NSString *)coreString:(NSString)network:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(issueFile:(NSDictionary *)input:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(issueThenTransferFile:(NSDictionary *)input:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(sign:(NSDictionary *)input:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(registerAccessPublicKey:(NSDictionary *)input:(RCTResponseSenderBlock)callback)

@end
