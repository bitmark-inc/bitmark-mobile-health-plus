//
//  RCTAppleHealthKit+Methods_ReproductiveHealth.m
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 7/31/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import "RCTAppleHealthKit+Methods_ReproductiveHealth.h"
#import "RCTAppleHealthKit+Queries.h"
#import "RCTAppleHealthKit+Utils.h"

@implementation RCTAppleHealthKit (Methods_ReproductiveHealth)

- (void)reproductiveHealth_getCervicalMucousQuality:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback
{
  NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
  NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
  if(startDate == nil){
    callback(@[RCTMakeError(@"startDate is required in options", nil, nil)]);
    return;
  }
  
  NSPredicate *predicate = [RCTAppleHealthKit predicateForSamplesBetweenDates:startDate endDate:endDate];
  NSUInteger limit = [RCTAppleHealthKit uintFromOptions:input key:@"limit" withDefault:HKObjectQueryNoLimit];
  
  
  [self fetchCervicalMucusQualityCategorySamplesForPredicate:predicate
                                                       limit:limit
                                                  completion:^(NSArray *results, NSError *error) {
                                                    if(results){
                                                      callback(@[[NSNull null], results]);
                                                      return;
                                                    } else {
                                                      NSLog(@"error getting sleep samples: %@", error);
                                                      callback(@[RCTMakeError(@"error getting sleep samples", nil, nil)]);
                                                      return;
                                                    }
                                                  }];
  
}

- (void)reproductiveHealth_getOvulationTestResult:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback {
  NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
  NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
  if(startDate == nil){
    callback(@[RCTMakeError(@"startDate is required in options", nil, nil)]);
    return;
  }
  
  NSPredicate *predicate = [RCTAppleHealthKit predicateForSamplesBetweenDates:startDate endDate:endDate];
  NSUInteger limit = [RCTAppleHealthKit uintFromOptions:input key:@"limit" withDefault:HKObjectQueryNoLimit];
  
  
  [self fetchOvulationTestResultCategorySamplesForPredicate:predicate
                                                      limit:limit
                                                 completion:^(NSArray *results, NSError *error) {
                                                   if(results){
                                                     callback(@[[NSNull null], results]);
                                                     return;
                                                   } else {
                                                     NSLog(@"error getting sleep samples: %@", error);
                                                     callback(@[RCTMakeError(@"error getting sleep samples", nil, nil)]);
                                                     return;
                                                   }
                                                 }];
}

- (void)reproductiveHealth_getMenstrualFlow:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback {
  NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
  NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
  if(startDate == nil){
    callback(@[RCTMakeError(@"startDate is required in options", nil, nil)]);
    return;
  }
  
  NSPredicate *predicate = [RCTAppleHealthKit predicateForSamplesBetweenDates:startDate endDate:endDate];
  NSUInteger limit = [RCTAppleHealthKit uintFromOptions:input key:@"limit" withDefault:HKObjectQueryNoLimit];
  
  
  [self fetchMenstrualFlowCategorySamplesForPredicate:predicate
                                                limit:limit
                                           completion:^(NSArray *results, NSError *error) {
                                             if(results){
                                               callback(@[[NSNull null], results]);
                                               return;
                                             } else {
                                               NSLog(@"error getting sleep samples: %@", error);
                                               callback(@[RCTMakeError(@"error getting sleep samples", nil, nil)]);
                                               return;
                                             }
                                           }];
}

- (void)reproductiveHealth_getIntermenstrualBleeding:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback {
  NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
  NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
  if(startDate == nil){
    callback(@[RCTMakeError(@"startDate is required in options", nil, nil)]);
    return;
  }
  
  NSPredicate *predicate = [RCTAppleHealthKit predicateForSamplesBetweenDates:startDate endDate:endDate];
  NSUInteger limit = [RCTAppleHealthKit uintFromOptions:input key:@"limit" withDefault:HKObjectQueryNoLimit];
  
  
  [self fetchIntermenstrualBleedingCategorySamplesForPredicate:predicate
                                                         limit:limit
                                                    completion:^(NSArray *results, NSError *error) {
                                                      if(results){
                                                        callback(@[[NSNull null], results]);
                                                        return;
                                                      } else {
                                                        NSLog(@"error getting sleep samples: %@", error);
                                                        callback(@[RCTMakeError(@"error getting sleep samples", nil, nil)]);
                                                        return;
                                                      }
                                                    }];
}
- (void)reproductiveHealth_getSexualActivity:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback {
  NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
  NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
  if(startDate == nil){
    callback(@[RCTMakeError(@"startDate is required in options", nil, nil)]);
    return;
  }
  
  NSPredicate *predicate = [RCTAppleHealthKit predicateForSamplesBetweenDates:startDate endDate:endDate];
  NSUInteger limit = [RCTAppleHealthKit uintFromOptions:input key:@"limit" withDefault:HKObjectQueryNoLimit];
  
  
  [self fetchSexualActivityCategorySamplesForPredicate:predicate
                                                 limit:limit
                                            completion:^(NSArray *results, NSError *error) {
                                              if(results){
                                                callback(@[[NSNull null], results]);
                                                return;
                                              } else {
                                                NSLog(@"error getting sleep samples: %@", error);
                                                callback(@[RCTMakeError(@"error getting sleep samples", nil, nil)]);
                                                return;
                                              }
                                            }];
}

@end
