//
//  HKDevice+Exporting.m
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 9/28/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import "HKDevice+Exporting.h"
#import "NSString+IdentitiesRemove.h"

@implementation HKDevice (Exporting)

- (NSDictionary *)exportData {
  return @{
           @"manufacturer": self.manufacturer,
           @"model": self.model,
           @"hardwareVersion": self.hardwareVersion,
           @"softwareVersion": self.softwareVersion,
           };
}

@end
