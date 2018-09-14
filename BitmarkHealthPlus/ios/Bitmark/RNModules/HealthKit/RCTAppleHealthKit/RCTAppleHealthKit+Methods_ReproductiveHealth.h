//
//  RCTAppleHealthKit+Methods_ReproductiveHealth.h
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 7/31/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import "RCTAppleHealthKit.h"

@interface RCTAppleHealthKit (Methods_ReproductiveHealth)

- (void)reproductiveHealth_getCervicalMucousQuality:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)reproductiveHealth_getOvulationTestResult:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)reproductiveHealth_getMenstrualFlow:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)reproductiveHealth_getIntermenstrualBleeding:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)reproductiveHealth_getSexualActivity:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;

@end
