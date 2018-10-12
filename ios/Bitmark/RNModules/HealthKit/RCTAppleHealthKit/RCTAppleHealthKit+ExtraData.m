//
//  RCTAppleHealthKit+ExtraData.m
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 10/12/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import "RCTAppleHealthKit+ExtraData.h"
#import "RCTAppleHealthKit+Queries.h"
#import "RCTAppleHealthKit+Utils.h"

#import <React/RCTBridgeModule.h>
#import <React/RCTEventDispatcher.h>

@implementation RCTAppleHealthKit (ExtraData)

- (void)extra_getWorkoutTypeOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback
{
  NSDate *date = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
  
  if(date == nil) {
    callback(@[RCTMakeError(@"could not parse date from options.date", nil, nil)]);
    return;
  }
  
  HKQuantityType *stepCountType = [HKObjectType quantityTypeForIdentifier:HKWorkoutTypeIdentifier];
  HKUnit *stepsUnit = [HKUnit countUnit];
  
  [self fetchSumOfSamplesOnDayForType:stepCountType
                                 unit:stepsUnit
                                  day:date
                           completion:^(double value, NSDate *startDate, NSDate *endDate, NSError *error) {
                             if (!value) {
                               NSLog(@"could not fetch step count for day: %@", error);
                               callback(@[RCTMakeError(@"could not fetch step count for day", error, nil)]);
                               return;
                             }
                             
                             NSDictionary *response = @{
                                                        @"value" : @(value),
                                                        @"startDate" : [RCTAppleHealthKit buildISO8601StringFromDate:startDate],
                                                        @"endDate" : [RCTAppleHealthKit buildISO8601StringFromDate:endDate],
                                                        };
                             
                             callback(@[[NSNull null], response]);
                           }];
}

@end
