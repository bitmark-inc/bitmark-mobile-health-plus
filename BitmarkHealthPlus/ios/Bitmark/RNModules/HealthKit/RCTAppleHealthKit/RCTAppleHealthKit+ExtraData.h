//
//  RCTAppleHealthKit+ExtraData.h
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 10/12/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import "RCTAppleHealthKit.h"

@interface RCTAppleHealthKit (ExtraData)

- (void)extra_getWorkoutTypeOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;

@end
