//
//  HKDevice+Exporting.h
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 9/28/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import <HealthKit/HealthKit.h>

@interface HKDevice (Exporting)

- (NSDictionary *)exportData;

@end
