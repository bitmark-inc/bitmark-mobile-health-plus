//
//  HKSourceRevision+Exporting.m
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 9/28/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import "HKSourceRevision+Exporting.h"
#import "NSString+IdentitiesRemove.h"

@implementation HKSourceRevision (Exporting)

- (NSDictionary *)exportData {
  return @{
           @"version": self.version,
           @"source": self.source.exportData
           };
}

@end

@implementation HKSource (Exporting)

- (NSDictionary *)exportData {
  return @{
           @"bundleIdentifier": self.bundleIdentifier
           };
}

@end
