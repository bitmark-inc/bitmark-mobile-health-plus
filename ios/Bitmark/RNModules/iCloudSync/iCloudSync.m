//
//  iCloudSync.m
//  BitmarkHealthPlus
//
//  Created by Anh Nguyen on 11/5/18.
//  Copyright © 2018 Bitmark Inc. All rights reserved.
//

#import "iCloudSync.h"
@import iCloudDocumentSync;
#import <React/RCTLog.h>

@interface iCloudSync () <iCloudDelegate>

@end

@implementation iCloudSync

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents {
  return @[@"oniCloudFileChanged"];
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_queue_create("iCloud_queue", DISPATCH_QUEUE_SERIAL);
}

RCT_EXPORT_METHOD(uploadFileToCloud:(NSString *)filePath:(NSString *)iCloudKey:(RCTResponseSenderBlock)callback)
{
  // Ignore the case that file
  if (![[NSFileManager defaultManager] fileExistsAtPath:filePath]) {
    callback(@[@YES]);
    return;
  }
  [[iCloud sharedCloud] saveAndCloseDocumentWithName:iCloudKey withContent:[NSData dataWithContentsOfFile:filePath] completion:^(UIDocument *cloudDocument, NSData *documentData, NSError *error) {
    if (error) {
      callback(@[@NO, error.description]);
    } else {
      callback(@[@YES]);
    }
  }];
}

RCT_EXPORT_METHOD(deleteFileFromCloud:(NSString *)iCloudKey:(RCTResponseSenderBlock)callback)
{
  [[iCloud sharedCloud] deleteDocumentWithName:iCloudKey completion:^(NSError *error) {
    if (error) {
      callback(@[@NO, error.description]);
    } else {
      callback(@[@YES]);
    }
  }];
}

RCT_EXPORT_METHOD(syncCloud:(RCTResponseSenderBlock)callback)
{
  [[iCloud sharedCloud] setDelegate:self];
  [[iCloud sharedCloud] updateFiles];
  callback(@[@YES]);
}

- (void)iCloudFilesDidChange:(NSMutableArray *)files withNewFileNames:(NSMutableArray *)fileNames {
  NSArray *keptFiles = [NSArray arrayWithArray:files];
  NSMutableDictionary *result = [NSMutableDictionary dictionaryWithCapacity:keptFiles.count];
  for (int i = 0; i < keptFiles.count; i++) {
    NSMetadataItem *item = keptFiles[i];
    NSString *downloadStatus = [item valueForAttribute:NSMetadataUbiquitousItemDownloadingStatusKey];
    if ([downloadStatus isEqualToString:NSMetadataUbiquitousItemDownloadingStatusDownloaded] ||
        [downloadStatus isEqualToString:NSMetadataUbiquitousItemDownloadingStatusCurrent]) {
      NSString *path = [item valueForAttribute:NSMetadataItemPathKey];
      [result setValue:path forKey:fileNames[i]];
    } else {
      NSNumber *percent = [item valueForAttribute:NSMetadataUbiquitousItemPercentDownloadedKey];
      NSLog(@"downloading percent: %@", percent);
    }
  }
  
  if (result.count > 0) {
    [self sendEventWithName:@"oniCloudFileChanged" body:result];
  }
}
@end
