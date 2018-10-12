//
//  RCTAppleHealthKit+Methods_Environment.m
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 8/4/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import "RCTAppleHealthKit+Methods_Environment.h"
#import "RCTAppleHealthKit+Queries.h"
#import "RCTAppleHealthKit+Utils.h"

#import <React/RCTBridgeModule.h>
#import <React/RCTEventDispatcher.h>

@implementation RCTAppleHealthKit (Methods_Environment)

- (void)environment_getUVExposure:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback {
//  HKUnit *unit = [RCTAppleHealthKit hkUnitFromOptions:input key:@"unit" withDefault:[HKUnit countUnit]];
//  NSUInteger limit = [RCTAppleHealthKit uintFromOptions:input key:@"limit" withDefault:HKObjectQueryNoLimit];
//  BOOL ascending = [RCTAppleHealthKit boolFromOptions:input key:@"ascending" withDefault:false];
//  NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
//  NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
//  if(startDate == nil){
//    callback(@[RCTMakeError(@"startDate is required in options", nil, nil)]);
//    return;
//  }
//
//  HKQuantityType *stepCountType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierUVExposure];
//
//  [self fetchCumulativeSumStatisticsCollection:stepCountType
//                                          unit:unit
//                                     startDate:startDate
//                                       endDate:endDate
//                                     ascending:ascending
//                                         limit:limit
//                                    completion:^(NSArray *arr, NSError *err){
//                                      if (err != nil) {
//                                        NSLog(@"error with environment_getUVExposure: %@", err);
//                                        callback(@[RCTMakeError(@"error with environment_getUVExposure", err, nil)]);
//                                        return;
//                                      }
//                                      callback(@[[NSNull null], arr]);
//                                    }];
  
  HKQuantityType *type = [HKQuantityType quantityTypeForIdentifier:HKQuantityTypeIdentifierUVExposure];
  
  HKUnit *unit = [RCTAppleHealthKit hkUnitFromOptions:input key:@"unit" withDefault:[HKUnit countUnit]];
  NSUInteger limit = [RCTAppleHealthKit uintFromOptions:input key:@"limit" withDefault:HKObjectQueryNoLimit];
  BOOL ascending = [RCTAppleHealthKit boolFromOptions:input key:@"ascending" withDefault:false];
  NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
  NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
  if(startDate == nil){
    callback(@[RCTMakeError(@"startDate is required in options", nil, nil)]);
    return;
  }
  NSPredicate * predicate = [RCTAppleHealthKit predicateForSamplesBetweenDates:startDate endDate:endDate];
  
  [self fetchQuantitySamplesOfType:type
                              unit:unit
                         predicate:predicate
                         ascending:ascending
                             limit:limit
                        completion:^(NSArray *results, NSError *error) {
                          if(results){
                            callback(@[[NSNull null], results]);
                            return;
                          } else {
                            NSLog(@"error getting UVExposure samples: %@", error);
                            callback(@[RCTMakeError(@"error getting UVExposure samples", error, nil)]);
                            return;
                          }
                        }];
}

@end
