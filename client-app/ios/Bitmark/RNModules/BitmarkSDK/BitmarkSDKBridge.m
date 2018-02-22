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
RCT_EXTERN_METHOD(removeAccount:(RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(requestSession:(NSString)network:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(disposeSession:(NSString)sessionId:(RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(try24Words:(NSArray<NSString *> *)pharse:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(accountInfo:(NSString)sessionId:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(registerAccessPublicKey:(NSString *)sessionId:(RCTResponseSenderBlock)callback)

// TODO
RCT_EXTERN_METHOD(newAccountFrom24Words:(NSArray<NSString *> *)pharse:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(issueFile:(NSString *)sessionId:(NSDictionary *)input:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(getAssetInfo:(NSString *)filePath:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(issueThenTransferFile:(NSString *)sessionId:(NSDictionary *)input:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(sign:(NSString *)sessionId:(NSString *)message:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(rickySign:(NSString *)sessionId:(NSArray<NSString *>)messages:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(sign1stForTransfer:(NSString *)sessionId:(NSString *)bitmarkId:(NSString *)address:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(sign2ndForTransfer:(NSString *)sessionId:(NSString *)txId:(NSString *)signature:(RCTResponseSenderBlock)callback)

@end
