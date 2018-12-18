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
  if (!files || !fileNames) {
    RCTLog(@"files or filesName is missing");
    return;
  }
  if (files.count != fileNames.count) {
    RCTLog(@"File and filename's length are mismatched.");
    return;
  }
  
  NSArray *keptFiles = [files copy];
  NSArray *keptFileNames = [fileNames copy];
  NSMutableDictionary *result = [NSMutableDictionary dictionaryWithCapacity:keptFiles.count];
  for (int i = 0; i < keptFiles.count; i++) {
    if (i >= keptFiles.count || i >= keptFileNames.count) {
      return;
    }
    NSMetadataItem *item = keptFiles[i];
    NSString *downloadStatus = [item valueForAttribute:NSMetadataUbiquitousItemDownloadingStatusKey];
    if (downloadStatus &&
        [downloadStatus isEqualToString:NSMetadataUbiquitousItemDownloadingStatusDownloaded]) {
          if (item) {
            NSString *path = [item valueForAttribute:NSMetadataItemPathKey];
            [result setValue:path forKey:keptFileNames[i]];
          }
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
