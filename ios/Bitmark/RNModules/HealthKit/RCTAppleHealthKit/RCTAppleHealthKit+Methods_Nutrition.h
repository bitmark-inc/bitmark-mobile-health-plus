//
//  RCTAppleHealthKit+Methods_Nutrition.h
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 8/2/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import "RCTAppleHealthKit.h"

@interface RCTAppleHealthKit (Methods_Nutrition)

- (void)results_getNutritionSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;

@end
