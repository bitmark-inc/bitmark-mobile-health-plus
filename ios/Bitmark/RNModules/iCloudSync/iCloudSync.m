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
#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@interface iCloudSync () <iCloudDelegate>

@property (readwrite, strong, nonatomic) NSMutableDictionary *iCloudFileChanges;
@property (nonatomic, copy) RCTBubblingEventBlock onFileChange;

@end

@implementation iCloudSync

RCT_EXPORT_MODULE();
RCT_EXPORT_VIEW_PROPERTY(onFileChange, RCTBubblingEventBlock);

RCT_EXPORT_METHOD(uploadFileToCloud:(NSString *)filePath:(NSString *)iCloudKey:(RCTResponseSenderBlock)callback)
{
  [[iCloud sharedCloud] saveAndCloseDocumentWithName:iCloudKey withContent:[NSData dataWithContentsOfFile:filePath] completion:^(UIDocument *cloudDocument, NSData *documentData, NSError *error) {
    if (error) {
      callback(@[@NO, error.description]);
    } else {
      callback(@[@YES]);
    }
  }];
}

RCT_EXPORT_METHOD(uploadToCloud:(NSString *)folder:(RCTResponseSenderBlock)callback)
{
  // Check for iCloud
  if ([[iCloud sharedCloud] checkCloudAvailability] == NO) return;
  
  NSFileManager *fileManager = [NSFileManager defaultManager];
  
  NSString *documentsDirectory = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES)[0];
  NSString *localDocument = [documentsDirectory stringByAppendingPathComponent:folder];
  NSURL *iCloudDirectoryURL = [[[iCloud sharedCloud] ubiquitousDocumentsDirectoryURL] URLByAppendingPathComponent:@"" isDirectory:YES];
  
  // Get the array of files in the documents directory
  NSArray *localDocuments = [fileManager contentsOfDirectoryAtPath:localDocument error:nil];
  
  // Log local files
  RCTLog(@"[iCloud] Files stored locally available for uploading: %@", localDocuments);
  
  // File in iCloud
  
  NSArray *iCloudDirectoryContent = [fileManager contentsOfDirectoryAtURL:iCloudDirectoryURL includingPropertiesForKeys:nil options:0 error:nil];
  
  // Compare the arrays then upload documents not already existent in iCloud
  for (NSUInteger item = 0; item < [localDocuments count]; item++) {
    
    // Check to make sure the documents aren't hidden
    if (![localDocuments[item] hasPrefix:@"."]) {
      
      // If the file does not exist in iCloud, upload it
      NSURL *path = [[iCloudDirectoryURL URLByAppendingPathComponent:localDocuments[item]] URLByStandardizingPath];
      if (![iCloudDirectoryContent containsObject:path]) {
        // Log
        RCTLog(@"[iCloud] Uploading %@ to iCloud (%lu out of %lu)", localDocuments[item], (unsigned long)item, (unsigned long)[localDocuments count]);
        
        // Move the file to iCloud
        NSURL *cloudURL = [[[iCloud sharedCloud] ubiquitousDocumentsDirectoryURL] URLByAppendingPathComponent:localDocuments[item]];
        NSURL *localURL = [NSURL fileURLWithPath:[localDocument stringByAppendingPathComponent:localDocuments[item]]];
        NSError *error;
        
        BOOL success = [fileManager setUbiquitous:YES itemAtURL:localURL destinationURL:cloudURL error:&error];
        if (success == NO) {
          RCTLog(@"[iCloud] Error while uploading document from local directory: %@",error);
        } else {
        }
        
      } else {
        // Check if the local document is newer than the cloud document
        
        // Log conflict
        RCTLog(@"[iCloud] Conflict between local file and remote file, attempting to automatically resolve");
        
        // Get the file URL for the iCloud document
        NSURL *cloudFileURL = [[[iCloud sharedCloud] ubiquitousDocumentsDirectoryURL] URLByAppendingPathComponent:localDocuments[item]];
        NSURL *localFileURL = [NSURL fileURLWithPath:[localDocument stringByAppendingPathComponent:localDocuments[item]]];
        
        // Create the UIDocument object from the URL
        iCloudDocument *document = [[iCloudDocument alloc] initWithFileURL:cloudFileURL];
        NSDate *cloudModDate = document.fileModificationDate;
        
        NSDictionary *fileAttributes = [fileManager attributesOfItemAtPath:[localFileURL absoluteString] error:nil];
        NSDate *localModDate = [fileAttributes fileModificationDate];
        NSData *localFileData = [fileManager contentsAtPath:[localFileURL absoluteString]];
        
        if ([cloudModDate compare:localModDate] == NSOrderedDescending) {
          RCTLog(@"[iCloud] The iCloud file was modified more recently than the local file. The local file will be deleted and the iCloud file will be preserved.");
          NSError *error;
          
          if (![fileManager removeItemAtPath:[localFileURL absoluteString] error:&error]) {
            RCTLog(@"[iCloud] Error deleting %@.\n\n%@", [localFileURL absoluteString], error);
          }
        } else if ([cloudModDate compare:localModDate] == NSOrderedAscending) {
          RCTLog(@"[iCloud] The local file was modified more recently than the iCloud file. The iCloud file will be overwritten with the contents of the local file.");
          // Set the document's new content
          document.contents = localFileData;
          
          dispatch_async(dispatch_get_main_queue(), ^{
            // Save and close the document in iCloud
            [document saveToURL:document.fileURL forSaveOperation:UIDocumentSaveForOverwriting completionHandler:^(BOOL success) {
              if (success) {
                // Close the document
                [document closeWithCompletionHandler:^(BOOL closeSuccess) {
                  // repeatingHandler(localDocuments[item], nil);
                }];
              } else {
                RCTLog(@"[iCloud] Error while overwriting old iCloud file: %s", __PRETTY_FUNCTION__);
              }
            }];
          });
        } else {
          RCTLog(@"[iCloud] The local file and iCloud file have the same modification date. Before overwriting or deleting, iCloud Document Sync will check if both files have the same content.");
          if ([fileManager contentsEqualAtPath:[cloudFileURL absoluteString] andPath:[localFileURL absoluteString]] == YES) {
            RCTLog (@"[iCloud] The contents of the local file and the contents of the iCloud file match. The local file will be deleted.");
            NSError *error;
            
            if (![fileManager removeItemAtPath:[localFileURL absoluteString] error:&error]) {
              RCTLog(@"[iCloud] Error deleting %@.\n\n%@", [localFileURL absoluteString], error);
            }
          } else {
            RCTLog(@"[iCloud] Both the iCloud file and the local file were last modified at the same time, however their contents do not match. You'll need to handle the conflict using the iCloudFileConflictBetweenCloudFile:andLocalFile: delegate method.");
            //              NSDictionary *cloudFile = @{@"fileContents": document.contents, @"fileURL": cloudFileURL, @"modifiedDate": cloudModDate};
            //              NSDictionary *localFile = @{@"fileContents": localFileData, @"fileURL": localFileURL, @"modifiedDate": localModDate};;
            
          }
        }
      }
    } else {
      RCTLog(@"File in directory is hidden and will not be uploaded to iCloud: %@", localDocuments[item]);
    }
  }
  
  RCTLog(@"[iCloud] Finished uploading all local files to iCloud");
  
  callback(@[@YES]);
}

RCT_EXPORT_METHOD(syncCloud:(RCTResponseSenderBlock)callback)
{
  [[iCloud sharedCloud] setDelegate:self];
  [[iCloud sharedCloud] updateFiles];
  callback(@[@YES]);
}

- (void)iCloudFilesDidChange:(NSMutableArray *)files withNewFileNames:(NSMutableArray *)fileNames {
  NSMutableDictionary *result = [NSMutableDictionary dictionaryWithCapacity:files.count];
  for (int i = 0; i < files.count; i++) {
    NSMetadataItem *item = files[i];
    NSString *path = [item valueForAttribute:NSMetadataItemPathKey];
    [result setValue:path forKey:fileNames[i]];
  }
  self.onFileChange(result);
}

@end
