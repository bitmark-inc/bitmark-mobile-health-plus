//
//  iCloudSync.m
//  BitmarkHealthPlus
//
//  Created by Anh Nguyen on 11/5/18.
//  Copyright © 2018 Bitmark Inc. All rights reserved.
//

#import "iCloudSync.h"
@import iCloudDocumentSync;

@implementation iCloudSync

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(syncCloudFile:(NSString *)folder:(RCTResponseSenderBlock)callback)
{
  NSString *documentsDirectory = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES)[0];
  NSString *localDocument = [documentsDirectory stringByAppendingPathComponent:folder];
  if (![[iCloud sharedCloud].previousQueryResults containsObject:localDocument]) {
    [[iCloud sharedCloud].previousQueryResults addObject:localDocument];
  }
  
  [[iCloud sharedCloud] uploadLocalDocumentToCloudWithName:folder completion:^(NSError *error) {
    if (error) {
      callback(@[@NO, error.localizedDescription]);
    } else {
      callback(@[@YES]);
    }
  }];
}

@end
