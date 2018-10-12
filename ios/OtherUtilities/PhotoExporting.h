//
//  PhotoExporting.h
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 9/22/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <Photos/Photos.h>

@interface PhotoExporting : NSObject

+ (void)exportAssets:(NSArray<PHAsset *> *)assets toFolder:(NSString *)folder completionHandler:(void(^)(NSArray<NSString *> *results))handler;

@end
