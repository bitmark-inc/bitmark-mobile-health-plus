//
//  PhotoExporting.m
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 9/22/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import "PhotoExporting.h"

@implementation PhotoExporting

+ (void)exportAssets:(NSArray<PHAsset *> *)assets toFolder:(NSString *)folder completionHandler:(void(^)(NSArray<NSString *> *results))handler {
  PHImageManager *imageManager = [PHImageManager defaultManager];
  dispatch_group_t group = dispatch_group_create();
  
  NSMutableArray<NSString *> *results = [NSMutableArray arrayWithCapacity:assets.count];
  
  for (PHAsset *asset in assets) {
    if (asset.mediaType == PHAssetMediaTypeImage) {
      dispatch_group_enter(group);
      NSString *filePath = [NSString stringWithFormat:@"%@/%@.jpg", folder, [NSUUID UUID].UUIDString];
      [results addObject:filePath];
      PHImageRequestOptions *options = [PHImageRequestOptions new];
      options.networkAccessAllowed = YES;
      options.version = PHImageRequestOptionsVersionCurrent;
      options.synchronous = YES;
      [imageManager requestImageForAsset:asset targetSize:CGSizeMake(500, 500) contentMode:PHImageContentModeAspectFit options:options resultHandler:^(UIImage * _Nullable result, NSDictionary * _Nullable info) {
        [UIImageJPEGRepresentation(result, 0.5) writeToFile:filePath atomically:YES];
        dispatch_group_leave(group);
      }];
    }
  }
  
  dispatch_group_notify(group, dispatch_get_main_queue(), ^{
    if (handler) {
      handler(results);
    }
  });
}

@end
