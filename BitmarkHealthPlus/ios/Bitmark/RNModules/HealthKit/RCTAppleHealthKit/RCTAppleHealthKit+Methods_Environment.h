//
//  RCTAppleHealthKit+Methods_Environment.h
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 8/4/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//
#import "RCTAppleHealthKit.h"

@interface RCTAppleHealthKit (Methods_Environment)

- (void)environment_getUVExposure:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;

@end
