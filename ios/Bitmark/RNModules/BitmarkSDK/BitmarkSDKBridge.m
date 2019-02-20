//
//  BitmarkSDKBridge.m
//  Bitmark
//
//  Created by Anh Nguyen on 1/26/18.
//  Copyright © 2018 Bitmark Inc. All rights reserved
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(BitmarkSDKWrapper, NSObject)

RCT_EXTERN_METHOD(sdkInit:(NSString)network:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(createAccount:(BOOL)authentication:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(generatePhrase:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(createAccountFromPhrase:(NSArray<NSString *> *)pharse:(BOOL)authentication:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(tryPhrase:(NSArray<NSString *> *)pharse:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(accountInfo:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(authenticate:(NSString)message:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(removeAccount:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(issue:(NSDictionary *)params:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(storeFileSecurely:(NSString *)filePath:(NSString *)destination:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getAssetInfo:(NSString *)filePath:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
//RCT_EXTERN_METHOD(issueThenTransferFile:(NSDictionary *)input:(NSString *)localFolderPath:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
//RCT_EXTERN_METHOD(downloadBitmark:(NSString *)bitmarkId:(NSString *)localFolderPath:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
//RCT_EXTERN_METHOD(downloadBitmarkWithGrantId:(NSString *)grantId:(NSString *)localFolderPath:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(sign:(NSArray<NSString *>)messages:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(transfer:(NSDictionary *)params:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(offer:(NSDictionary *)params:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(response:(NSDictionary *)params:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(validateMetadata:(NSDictionary *)metadata:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(validateAccountNumber:(NSString *)address:(NSString *)network:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
// grant access bitmark
//RCT_EXTERN_METHOD(createSessionDataForRecipient:(NSString *)bitmarkId:(NSString *)recipient:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
//RCT_EXTERN_METHOD(createSessionDataFromLocalForRecipient:(NSString *)bitmarkId:(NSDictionary *)sessionData:(NSString *)recipient:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)

// Query APIs
RCT_EXTERN_METHOD(getBitmark:(NSString *)bitmarkID:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getBitmarks:(NSDictionary *)params:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getTransaction:(NSString *)transactionID:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getTransactions:(NSDictionary *)params:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getAsset:(NSString *)assetID:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getAssets:(NSDictionary *)params:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)

// Account migration
RCT_EXTERN_METHOD(migrate:(NSArray<NSString *> *)pharse:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(resumeMigration:(RCTPromiseResolveBlock)resolve:(RCTPromiseRejectBlock)reject)

@end
