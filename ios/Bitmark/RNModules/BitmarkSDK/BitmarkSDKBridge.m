//
//  BitmarkSDKBridge.m
//  Bitmark
//
//  Created by Anh Nguyen on 1/26/18.
//  Copyright © 2018 Bitmark Inc. All rights reserved
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(BitmarkSDKWrapper, NSObject)

RCT_EXTERN_METHOD(newAccount:(BOOL)authentication:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(removeAccount:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(tryPhrase:(NSArray<NSString *> *)pharse:(NSString *)network:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(accountInfo:(NSString)sessionId:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)

// TODO
RCT_EXTERN_METHOD(createAccountFromPhrase:(NSArray<NSString *> *)pharse:(NSString *)network:(BOOL)authentication:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(issueFile:(NSString *)filePath:(NSString *)name:(NSDictionary *)metadata:(int)quantity:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getAssetInfo:(NSString *)filePath:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
//RCT_EXTERN_METHOD(issueThenTransferFile:(NSDictionary *)input:(NSString *)localFolderPath:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
//RCT_EXTERN_METHOD(downloadBitmark:(NSString *)bitmarkId:(NSString *)localFolderPath:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
//RCT_EXTERN_METHOD(downloadBitmarkWithGrantId:(NSString *)grantId:(NSString *)localFolderPath:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(sign:(NSArray<NSString *>)messages:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(transferOneSignature:(NSString *)bitmarkId:(NSString *)address:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(createAndSubmitTransferOffer:(NSString *)bitmarkId:(NSString *)address:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(signForTransferOfferAndSubmit:(NSString *)txId:(NSString *)signature:(NSString *)offerId:(NSString *)action:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(validateMetadata:(NSDictionary *)metadata:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(validateAccountNumber:(NSString *)address:(NSString *)network:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
// grant access bitmark
//RCT_EXTERN_METHOD(createSessionDataForRecipient:(NSString *)bitmarkId:(NSString *)recipient:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
//RCT_EXTERN_METHOD(createSessionDataFromLocalForRecipient:(NSString *)bitmarkId:(NSDictionary *)sessionData:(NSString *)recipient:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)

@end
