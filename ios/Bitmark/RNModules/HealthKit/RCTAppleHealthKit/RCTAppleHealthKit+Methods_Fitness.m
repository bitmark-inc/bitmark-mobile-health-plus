//
//  RCTAppleHealthKit+Methods_Fitness.m
//  RCTAppleHealthKit
//
//  Created by Greg Wilson on 2016-06-26.
//  Copyright © 2016 Greg Wilson. All rights reserved.
//

#import "RCTAppleHealthKit+Methods_Fitness.h"
#import "RCTAppleHealthKit+Queries.h"
#import "RCTAppleHealthKit+Utils.h"

#import <React/RCTBridgeModule.h>
#import <React/RCTEventDispatcher.h>

@implementation RCTAppleHealthKit (Methods_Fitness)


- (void)fitness_getStepCountOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback
{
    NSDate *date = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];

    if(date == nil) {
        callback(@[RCTMakeError(@"could not parse date from options.date", nil, nil)]);
        return;
    }

    HKQuantityType *stepCountType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierStepCount];
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


- (void)fitness_getDailyStepSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback
{
    HKUnit *unit = [RCTAppleHealthKit hkUnitFromOptions:input key:@"unit" withDefault:[HKUnit countUnit]];
    NSUInteger limit = [RCTAppleHealthKit uintFromOptions:input key:@"limit" withDefault:HKObjectQueryNoLimit];
    BOOL ascending = [RCTAppleHealthKit boolFromOptions:input key:@"ascending" withDefault:false];
    NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
    NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
    if(startDate == nil){
        callback(@[RCTMakeError(@"startDate is required in options", nil, nil)]);
        return;
    }

    HKQuantityType *stepCountType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierStepCount];

    [self fetchCumulativeSumStatisticsCollection:stepCountType
                                            unit:unit
                                       startDate:startDate
                                         endDate:endDate
                                       ascending:ascending
                                           limit:limit
                                      completion:^(NSArray *arr, NSError *err){
        if (err != nil) {
            NSLog(@"error with fetchCumulativeSumStatisticsCollection: %@", err);
            callback(@[RCTMakeError(@"error with fetchCumulativeSumStatisticsCollection", err, nil)]);
            return;
        }
        callback(@[[NSNull null], arr]);
    }];
}


- (void)fitness_saveSteps:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback
{
    double value = [RCTAppleHealthKit doubleFromOptions:input key:@"value" withDefault:(double)0];
    NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
    NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];

    if(startDate == nil || endDate == nil){
        callback(@[RCTMakeError(@"startDate and endDate are required in options", nil, nil)]);
        return;
    }

    HKUnit *unit = [HKUnit countUnit];
    HKQuantity *quantity = [HKQuantity quantityWithUnit:unit doubleValue:value];
    HKQuantityType *type = [HKQuantityType quantityTypeForIdentifier:HKQuantityTypeIdentifierStepCount];
    HKQuantitySample *sample = [HKQuantitySample quantitySampleWithType:type quantity:quantity startDate:startDate endDate:endDate];

    [self.healthStore saveObject:sample withCompletion:^(BOOL success, NSError *error) {
        if (!success) {
            NSLog(@"An error occured saving the step count sample %@. The error was: %@.", sample, error);
            callback(@[RCTMakeError(@"An error occured saving the step count sample", error, nil)]);
            return;
        }
        callback(@[[NSNull null], @(value)]);
    }];
}


- (void)fitness_initializeStepEventObserver:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback
{
    HKSampleType *sampleType =
    [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierStepCount];

    HKObserverQuery *query =
    [[HKObserverQuery alloc]
     initWithSampleType:sampleType
     predicate:nil
     updateHandler:^(HKObserverQuery *query,
                     HKObserverQueryCompletionHandler completionHandler,
                     NSError *error) {

         if (error) {
             // Perform Proper Error Handling Here...
             NSLog(@"*** An error occured while setting up the stepCount observer. %@ ***", error.localizedDescription);
             callback(@[RCTMakeError(@"An error occured while setting up the stepCount observer", error, nil)]);
             return;
         }

          [self.bridge.eventDispatcher sendAppEventWithName:@"change:steps"
                                                       body:@{@"name": @"change:steps"}];

         // If you have subscribed for background updates you must call the completion handler here.
         // completionHandler();

     }];

    [self.healthStore executeQuery:query];
}


- (void)fitness_getDistanceWalkingRunningOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback
{
//    HKUnit *unit = [RCTAppleHealthKit hkUnitFromOptions:input key:@"unit" withDefault:[HKUnit meterUnit]];
//    NSDate *date = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
//
//    HKQuantityType *quantityType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDistanceWalkingRunning];
//
//    [self fetchSumOfSamplesOnDayForType:quantityType unit:unit day:date completion:^(double distance, NSDate *startDate, NSDate *endDate, NSError *error) {
//        if (!distance) {
//            NSLog(@"ERROR getting DistanceWalkingRunning: %@", error);
//            callback(@[RCTMakeError(@"ERROR getting DistanceWalkingRunning", error, nil)]);
//            return;
//        }
//
//        NSDictionary *response = @{
//                @"value" : @(distance),
//                @"startDate" : [RCTAppleHealthKit buildISO8601StringFromDate:startDate],
//                @"endDate" : [RCTAppleHealthKit buildISO8601StringFromDate:endDate],
//        };
//
//
//        callback(@[[NSNull null], response]);
//    }];
  
  HKUnit *unit = [RCTAppleHealthKit hkUnitFromOptions:input key:@"unit" withDefault:[HKUnit meterUnit]];
  NSUInteger limit = [RCTAppleHealthKit uintFromOptions:input key:@"limit" withDefault:HKObjectQueryNoLimit];
  BOOL ascending = [RCTAppleHealthKit boolFromOptions:input key:@"ascending" withDefault:false];
  NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
  NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
  if(startDate == nil){
    callback(@[RCTMakeError(@"startDate is required in options", nil, nil)]);
    return;
  }
  
  HKQuantityType *stepCountType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDistanceWalkingRunning];
  
  [self fetchCumulativeSumStatisticsCollection:stepCountType
                                          unit:unit
                                     startDate:startDate
                                       endDate:endDate
                                     ascending:ascending
                                         limit:limit
                                    completion:^(NSArray *arr, NSError *err){
                                      if (err != nil) {
                                        NSLog(@"error with fetchCumulativeSumStatisticsCollection: %@", err);
                                        callback(@[RCTMakeError(@"error with fetchCumulativeSumStatisticsCollection", err, nil)]);
                                        return;
                                      }
                                      callback(@[[NSNull null], arr]);
                                    }];
}


- (void)fitness_getDistanceCyclingOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback
{
//    HKUnit *unit = [RCTAppleHealthKit hkUnitFromOptions:input key:@"unit" withDefault:[HKUnit meterUnit]];
//    NSDate *date = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
//
//    HKQuantityType *quantityType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDistanceCycling];
//
//    [self fetchSumOfSamplesOnDayForType:quantityType unit:unit day:date completion:^(double distance, NSDate *startDate, NSDate *endDate, NSError *error) {
//        if (!distance) {
//            NSLog(@"ERROR getting DistanceCycling: %@", error);
//            callback(@[RCTMakeError(@"ERROR getting DistanceCycling", error, nil)]);
//            return;
//        }
//
//        NSDictionary *response = @{
//                @"value" : @(distance),
//                @"startDate" : [RCTAppleHealthKit buildISO8601StringFromDate:startDate],
//                @"endDate" : [RCTAppleHealthKit buildISO8601StringFromDate:endDate],
//        };
//
//        callback(@[[NSNull null], response]);
//    }];
  
  HKUnit *unit = [RCTAppleHealthKit hkUnitFromOptions:input key:@"unit" withDefault:[HKUnit meterUnit]];
  NSUInteger limit = [RCTAppleHealthKit uintFromOptions:input key:@"limit" withDefault:HKObjectQueryNoLimit];
  BOOL ascending = [RCTAppleHealthKit boolFromOptions:input key:@"ascending" withDefault:false];
  NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
  NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
  if(startDate == nil){
    callback(@[RCTMakeError(@"startDate is required in options", nil, nil)]);
    return;
  }
  
  HKQuantityType *stepCountType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDistanceCycling];
  
  [self fetchCumulativeSumStatisticsCollection:stepCountType
                                          unit:unit
                                     startDate:startDate
                                       endDate:endDate
                                     ascending:ascending
                                         limit:limit
                                    completion:^(NSArray *arr, NSError *err){
                                      if (err != nil) {
                                        NSLog(@"error with fetchCumulativeSumStatisticsCollection: %@", err);
                                        callback(@[RCTMakeError(@"error with fetchCumulativeSumStatisticsCollection", err, nil)]);
                                        return;
                                      }
                                      callback(@[[NSNull null], arr]);
                                    }];
}


- (void)fitness_getFlightsClimbedOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback
{
//    HKUnit *unit = [HKUnit countUnit];
//    NSDate *date = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
//
//    HKQuantityType *quantityType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierFlightsClimbed];
//
//    [self fetchSumOfSamplesOnDayForType:quantityType unit:unit day:date completion:^(double count, NSDate *startDate, NSDate *endDate, NSError *error) {
//        if (!count) {
//            NSLog(@"ERROR getting FlightsClimbed: %@", error);
//            callback(@[RCTMakeError(@"ERROR getting FlightsClimbed", error, nil), @(count)]);
//            return;
//        }
//
//        NSDictionary *response = @{
//                @"value" : @(count),
//                @"startDate" : [RCTAppleHealthKit buildISO8601StringFromDate:startDate],
//                @"endDate" : [RCTAppleHealthKit buildISO8601StringFromDate:endDate],
//        };
//
//        callback(@[[NSNull null], response]);
//    }];
  
  HKUnit *unit = [RCTAppleHealthKit hkUnitFromOptions:input key:@"unit" withDefault:[HKUnit countUnit]];
  NSUInteger limit = [RCTAppleHealthKit uintFromOptions:input key:@"limit" withDefault:HKObjectQueryNoLimit];
  BOOL ascending = [RCTAppleHealthKit boolFromOptions:input key:@"ascending" withDefault:false];
  NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
  NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
  if(startDate == nil){
    callback(@[RCTMakeError(@"startDate is required in options", nil, nil)]);
    return;
  }
  
  HKQuantityType *stepCountType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierFlightsClimbed];
  
  [self fetchCumulativeSumStatisticsCollection:stepCountType
                                          unit:unit
                                     startDate:startDate
                                       endDate:endDate
                                     ascending:ascending
                                         limit:limit
                                    completion:^(NSArray *arr, NSError *err){
                                      if (err != nil) {
                                        NSLog(@"error with fetchCumulativeSumStatisticsCollection: %@", err);
                                        callback(@[RCTMakeError(@"error with fetchCumulativeSumStatisticsCollection", err, nil)]);
                                        return;
                                      }
                                      callback(@[[NSNull null], arr]);
                                    }];
}

- (void)fitness_getNikeFuelOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback
{
//  HKUnit *unit = [HKUnit countUnit];
//  NSDate *date = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
//
//  HKQuantityType *quantityType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierNikeFuel];
//
//  [self fetchSumOfSamplesOnDayForType:quantityType unit:unit day:date completion:^(double count, NSDate *startDate, NSDate *endDate, NSError *error) {
//    if (!count) {
//      NSLog(@"ERROR getting NikeFuel: %@", error);
//      callback(@[RCTMakeError(@"ERROR getting NikeFuel", error, nil), @(count)]);
//      return;
//    }
//
//    NSDictionary *response = @{
//                               @"value" : @(count),
//                               @"startDate" : [RCTAppleHealthKit buildISO8601StringFromDate:startDate],
//                               @"endDate" : [RCTAppleHealthKit buildISO8601StringFromDate:endDate],
//                               };
//
//    callback(@[[NSNull null], response]);
//  }];
  
  HKUnit *unit = [RCTAppleHealthKit hkUnitFromOptions:input key:@"unit" withDefault:[HKUnit countUnit]];
  NSUInteger limit = [RCTAppleHealthKit uintFromOptions:input key:@"limit" withDefault:HKObjectQueryNoLimit];
  BOOL ascending = [RCTAppleHealthKit boolFromOptions:input key:@"ascending" withDefault:false];
  NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
  NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
  if(startDate == nil){
    callback(@[RCTMakeError(@"startDate is required in options", nil, nil)]);
    return;
  }
  
  HKQuantityType *stepCountType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierNikeFuel];
  
  [self fetchCumulativeSumStatisticsCollection:stepCountType
                                          unit:unit
                                     startDate:startDate
                                       endDate:endDate
                                     ascending:ascending
                                         limit:limit
                                    completion:^(NSArray *arr, NSError *err){
                                      if (err != nil) {
                                        NSLog(@"error with fetchCumulativeSumStatisticsCollection: %@", err);
                                        callback(@[RCTMakeError(@"error with fetchCumulativeSumStatisticsCollection", err, nil)]);
                                        return;
                                      }
                                      callback(@[[NSNull null], arr]);
                                    }];
}

- (void)fitness_getAppleExerciseTimeOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback
{
//  HKUnit *unit = [HKUnit countUnit];
//  NSDate *date = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
//
//  HKQuantityType *quantityType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierAppleExerciseTime];
//
//  [self fetchSumOfSamplesOnDayForType:quantityType unit:unit day:date completion:^(double count, NSDate *startDate, NSDate *endDate, NSError *error) {
//    if (!count) {
//      NSLog(@"ERROR getting AppleExerciseTime: %@", error);
//      callback(@[RCTMakeError(@"ERROR getting AppleExerciseTime", error, nil), @(count)]);
//      return;
//    }
//
//    NSDictionary *response = @{
//                               @"value" : @(count),
//                               @"startDate" : [RCTAppleHealthKit buildISO8601StringFromDate:startDate],
//                               @"endDate" : [RCTAppleHealthKit buildISO8601StringFromDate:endDate],
//                               };
//
//    callback(@[[NSNull null], response]);
//  }];
  
  HKUnit *unit = [RCTAppleHealthKit hkUnitFromOptions:input key:@"unit" withDefault:[HKUnit minuteUnit]];
  NSUInteger limit = [RCTAppleHealthKit uintFromOptions:input key:@"limit" withDefault:HKObjectQueryNoLimit];
  BOOL ascending = [RCTAppleHealthKit boolFromOptions:input key:@"ascending" withDefault:false];
  NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
  NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
  if(startDate == nil){
    callback(@[RCTMakeError(@"startDate is required in options", nil, nil)]);
    return;
  }
  
  HKQuantityType *stepCountType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierAppleExerciseTime];
  
  [self fetchCumulativeSumStatisticsCollection:stepCountType
                                          unit:unit
                                     startDate:startDate
                                       endDate:endDate
                                     ascending:ascending
                                         limit:limit
                                    completion:^(NSArray *arr, NSError *err){
                                      if (err != nil) {
                                        NSLog(@"error with fitness_getAppleExerciseTimeOnDay: %@", err);
                                        callback(@[RCTMakeError(@"error with fitness_getAppleExerciseTimeOnDay", err, nil)]);
                                        return;
                                      }
                                      callback(@[[NSNull null], arr]);
                                    }];
}

- (void)fitness_getWheelchairDistanceOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback {
//  HKUnit *unit = [RCTAppleHealthKit hkUnitFromOptions:input key:@"unit" withDefault:[HKUnit meterUnit]];
//  NSDate *date = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
//
//  HKQuantityType *quantityType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDistanceWheelchair];
//
//  [self fetchSumOfSamplesOnDayForType:quantityType unit:unit day:date completion:^(double distance, NSDate *startDate, NSDate *endDate, NSError *error) {
//    if (!distance) {
//      NSLog(@"ERROR getting WheelchairDistance: %@", error);
//      callback(@[RCTMakeError(@"ERROR getting WheelchairDistance", error, nil)]);
//      return;
//    }
//
//    NSDictionary *response = @{
//                               @"value" : @(distance),
//                               @"startDate" : [RCTAppleHealthKit buildISO8601StringFromDate:startDate],
//                               @"endDate" : [RCTAppleHealthKit buildISO8601StringFromDate:endDate],
//                               };
//
//    callback(@[[NSNull null], response]);
//  }];
  
  HKUnit *unit = [RCTAppleHealthKit hkUnitFromOptions:input key:@"unit" withDefault:[HKUnit meterUnit]];
  NSUInteger limit = [RCTAppleHealthKit uintFromOptions:input key:@"limit" withDefault:HKObjectQueryNoLimit];
  BOOL ascending = [RCTAppleHealthKit boolFromOptions:input key:@"ascending" withDefault:false];
  NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
  NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
  if(startDate == nil){
    callback(@[RCTMakeError(@"startDate is required in options", nil, nil)]);
    return;
  }
  
  HKQuantityType *stepCountType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDistanceWheelchair];
  
  [self fetchCumulativeSumStatisticsCollection:stepCountType
                                          unit:unit
                                     startDate:startDate
                                       endDate:endDate
                                     ascending:ascending
                                         limit:limit
                                    completion:^(NSArray *arr, NSError *err){
                                      if (err != nil) {
                                        NSLog(@"error with fitness_getWheelchairDistanceOnDay: %@", err);
                                        callback(@[RCTMakeError(@"error with fitness_getWheelchairDistanceOnDay", err, nil)]);
                                        return;
                                      }
                                      callback(@[[NSNull null], arr]);
                                    }];
}

- (void)fitness_getPushCountOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback {
//  HKUnit *unit = [HKUnit countUnit];
//  NSDate *date = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
//
//  HKQuantityType *quantityType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierPushCount];
//
//  [self fetchSumOfSamplesOnDayForType:quantityType unit:unit day:date completion:^(double count, NSDate *startDate, NSDate *endDate, NSError *error) {
//    if (!count) {
//      NSLog(@"ERROR getting PushCount: %@", error);
//      callback(@[RCTMakeError(@"ERROR getting PushCount", error, nil), @(count)]);
//      return;
//    }
//
//    NSDictionary *response = @{
//                               @"value" : @(count),
//                               @"startDate" : [RCTAppleHealthKit buildISO8601StringFromDate:startDate],
//                               @"endDate" : [RCTAppleHealthKit buildISO8601StringFromDate:endDate],
//                               };
//
//    callback(@[[NSNull null], response]);
//  }];
  
  HKUnit *unit = [RCTAppleHealthKit hkUnitFromOptions:input key:@"unit" withDefault:[HKUnit countUnit]];
  NSUInteger limit = [RCTAppleHealthKit uintFromOptions:input key:@"limit" withDefault:HKObjectQueryNoLimit];
  BOOL ascending = [RCTAppleHealthKit boolFromOptions:input key:@"ascending" withDefault:false];
  NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
  NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
  if(startDate == nil){
    callback(@[RCTMakeError(@"startDate is required in options", nil, nil)]);
    return;
  }
  
  HKQuantityType *stepCountType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierPushCount];
  
  [self fetchCumulativeSumStatisticsCollection:stepCountType
                                          unit:unit
                                     startDate:startDate
                                       endDate:endDate
                                     ascending:ascending
                                         limit:limit
                                    completion:^(NSArray *arr, NSError *err){
                                      if (err != nil) {
                                        NSLog(@"error with fitness_getPushCountOnDay: %@", err);
                                        callback(@[RCTMakeError(@"error with fitness_getPushCountOnDay", err, nil)]);
                                        return;
                                      }
                                      callback(@[[NSNull null], arr]);
                                    }];
}

- (void)fitness_getDistanceSwimmingOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback {
//  HKUnit *unit = [RCTAppleHealthKit hkUnitFromOptions:input key:@"unit" withDefault:[HKUnit meterUnit]];
//  NSDate *date = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
//
//  HKQuantityType *quantityType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDistanceSwimming];
//
//  [self fetchSumOfSamplesOnDayForType:quantityType unit:unit day:date completion:^(double distance, NSDate *startDate, NSDate *endDate, NSError *error) {
//    if (!distance) {
//      NSLog(@"ERROR getting DistanceSwimming: %@", error);
//      callback(@[RCTMakeError(@"ERROR getting DistanceSwimming", error, nil)]);
//      return;
//    }
//
//    NSDictionary *response = @{
//                               @"value" : @(distance),
//                               @"startDate" : [RCTAppleHealthKit buildISO8601StringFromDate:startDate],
//                               @"endDate" : [RCTAppleHealthKit buildISO8601StringFromDate:endDate],
//                               };
//
//    callback(@[[NSNull null], response]);
//  }];
  
  HKUnit *unit = [RCTAppleHealthKit hkUnitFromOptions:input key:@"unit" withDefault:[HKUnit meterUnit]];
  NSUInteger limit = [RCTAppleHealthKit uintFromOptions:input key:@"limit" withDefault:HKObjectQueryNoLimit];
  BOOL ascending = [RCTAppleHealthKit boolFromOptions:input key:@"ascending" withDefault:false];
  NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
  NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
  if(startDate == nil){
    callback(@[RCTMakeError(@"startDate is required in options", nil, nil)]);
    return;
  }
  
  HKQuantityType *stepCountType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDistanceSwimming];
  
  [self fetchCumulativeSumStatisticsCollection:stepCountType
                                          unit:unit
                                     startDate:startDate
                                       endDate:endDate
                                     ascending:ascending
                                         limit:limit
                                    completion:^(NSArray *arr, NSError *err){
                                      if (err != nil) {
                                        NSLog(@"error with fitness_getDistanceSwimmingOnDay: %@", err);
                                        callback(@[RCTMakeError(@"error with fitness_getDistanceSwimmingOnDay", err, nil)]);
                                        return;
                                      }
                                      callback(@[[NSNull null], arr]);
                                    }];
}

- (void)fitness_getSwimmingStrokeCountOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback {
//  HKUnit *unit = [HKUnit countUnit];
//  NSDate *date = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
//
//  HKQuantityType *quantityType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierSwimmingStrokeCount];
//
//  [self fetchSumOfSamplesOnDayForType:quantityType unit:unit day:date completion:^(double count, NSDate *startDate, NSDate *endDate, NSError *error) {
//    if (!count) {
//      NSLog(@"ERROR getting SwimmingStrokeCount: %@", error);
//      callback(@[RCTMakeError(@"ERROR getting SwimmingStrokeCount", error, nil), @(count)]);
//      return;
//    }
//
//    NSDictionary *response = @{
//                               @"value" : @(count),
//                               @"startDate" : [RCTAppleHealthKit buildISO8601StringFromDate:startDate],
//                               @"endDate" : [RCTAppleHealthKit buildISO8601StringFromDate:endDate],
//                               };
//
//    callback(@[[NSNull null], response]);
//  }];
  
  HKUnit *unit = [RCTAppleHealthKit hkUnitFromOptions:input key:@"unit" withDefault:[HKUnit countUnit]];
  NSUInteger limit = [RCTAppleHealthKit uintFromOptions:input key:@"limit" withDefault:HKObjectQueryNoLimit];
  BOOL ascending = [RCTAppleHealthKit boolFromOptions:input key:@"ascending" withDefault:false];
  NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
  NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
  if(startDate == nil){
    callback(@[RCTMakeError(@"startDate is required in options", nil, nil)]);
    return;
  }
  
  HKQuantityType *stepCountType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierSwimmingStrokeCount];
  
  [self fetchCumulativeSumStatisticsCollection:stepCountType
                                          unit:unit
                                     startDate:startDate
                                       endDate:endDate
                                     ascending:ascending
                                         limit:limit
                                    completion:^(NSArray *arr, NSError *err){
                                      if (err != nil) {
                                        NSLog(@"error with fitness_getSwimmingStrokeCountOnDay: %@", err);
                                        callback(@[RCTMakeError(@"error with fitness_getSwimmingStrokeCountOnDay", err, nil)]);
                                        return;
                                      }
                                      callback(@[[NSNull null], arr]);
                                    }];
}

- (void)fitness_getBasalEnergyBurnedOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback {
//  HKUnit *unit = [HKUnit calorieUnit];
//  NSDate *date = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
//
//  HKQuantityType *quantityType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierBasalEnergyBurned];
//
//  [self fetchSumOfSamplesOnDayForType:quantityType unit:unit day:date completion:^(double count, NSDate *startDate, NSDate *endDate, NSError *error) {
//    if (!count) {
//      NSLog(@"ERROR getting BasalEnergyBurned: %@", error);
//      callback(@[RCTMakeError(@"ERROR getting BasalEnergyBurned", error, nil), @(count)]);
//      return;
//    }
//
//    NSDictionary *response = @{
//                               @"value" : @(count),
//                               @"startDate" : [RCTAppleHealthKit buildISO8601StringFromDate:startDate],
//                               @"endDate" : [RCTAppleHealthKit buildISO8601StringFromDate:endDate],
//                               };
//
//    callback(@[[NSNull null], response]);
//  }];
  
  HKUnit *unit = [RCTAppleHealthKit hkUnitFromOptions:input key:@"unit" withDefault:[HKUnit calorieUnit]];
  NSUInteger limit = [RCTAppleHealthKit uintFromOptions:input key:@"limit" withDefault:HKObjectQueryNoLimit];
  BOOL ascending = [RCTAppleHealthKit boolFromOptions:input key:@"ascending" withDefault:false];
  NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
  NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
  if(startDate == nil){
    callback(@[RCTMakeError(@"startDate is required in options", nil, nil)]);
    return;
  }
  
  HKQuantityType *stepCountType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierBasalEnergyBurned];
  
  [self fetchCumulativeSumStatisticsCollection:stepCountType
                                          unit:unit
                                     startDate:startDate
                                       endDate:endDate
                                     ascending:ascending
                                         limit:limit
                                    completion:^(NSArray *arr, NSError *err){
                                      if (err != nil) {
                                        NSLog(@"error with fitness_getBasalEnergyBurnedOnDay: %@", err);
                                        callback(@[RCTMakeError(@"error with fitness_getBasalEnergyBurnedOnDay", err, nil)]);
                                        return;
                                      }
                                      callback(@[[NSNull null], arr]);
                                    }];
}

- (void)fitness_getActiveEnergyBurnedOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback {
//  HKUnit *unit = [HKUnit calorieUnit];
//  NSDate *date = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
//
//  HKQuantityType *quantityType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierActiveEnergyBurned];
//
//  [self fetchSumOfSamplesOnDayForType:quantityType unit:unit day:date completion:^(double count, NSDate *startDate, NSDate *endDate, NSError *error) {
//    if (!count) {
//      NSLog(@"ERROR getting BasalEnergyBurned: %@", error);
//      callback(@[RCTMakeError(@"ERROR getting BasalEnergyBurned", error, nil), @(count)]);
//      return;
//    }
//
//    NSDictionary *response = @{
//                               @"value" : @(count),
//                               @"startDate" : [RCTAppleHealthKit buildISO8601StringFromDate:startDate],
//                               @"endDate" : [RCTAppleHealthKit buildISO8601StringFromDate:endDate],
//                               };
//
//    callback(@[[NSNull null], response]);
//  }];
  
  HKUnit *unit = [RCTAppleHealthKit hkUnitFromOptions:input key:@"unit" withDefault:[HKUnit calorieUnit]];
  NSUInteger limit = [RCTAppleHealthKit uintFromOptions:input key:@"limit" withDefault:HKObjectQueryNoLimit];
  BOOL ascending = [RCTAppleHealthKit boolFromOptions:input key:@"ascending" withDefault:false];
  NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
  NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
  if(startDate == nil){
    callback(@[RCTMakeError(@"startDate is required in options", nil, nil)]);
    return;
  }
  
  HKQuantityType *stepCountType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierActiveEnergyBurned];
  
  [self fetchCumulativeSumStatisticsCollection:stepCountType
                                          unit:unit
                                     startDate:startDate
                                       endDate:endDate
                                     ascending:ascending
                                         limit:limit
                                    completion:^(NSArray *arr, NSError *err){
                                      if (err != nil) {
                                        NSLog(@"error with fitness_getBasalEnergyBurnedOnDay: %@", err);
                                        callback(@[RCTMakeError(@"error with fitness_getBasalEnergyBurnedOnDay", err, nil)]);
                                        return;
                                      }
                                      callback(@[[NSNull null], arr]);
                                    }];
}

- (void)fitness_getVO2MaxOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback {
//  HKUnit *unit = [HKUnit calorieUnit];
//  NSDate *date = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
//
//  HKQuantityType *quantityType = [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierVO2Max];
//
//  [self fetchSumOfSamplesOnDayForType:quantityType unit:unit day:date completion:^(double count, NSDate *startDate, NSDate *endDate, NSError *error) {
//    if (!count) {
//      NSLog(@"ERROR getting BasalEnergyBurned: %@", error);
//      callback(@[RCTMakeError(@"ERROR getting BasalEnergyBurned", error, nil), @(count)]);
//      return;
//    }
//
//    NSDictionary *response = @{
//                               @"value" : @(count),
//                               @"startDate" : [RCTAppleHealthKit buildISO8601StringFromDate:startDate],
//                               @"endDate" : [RCTAppleHealthKit buildISO8601StringFromDate:endDate],
//                               };
//
//    callback(@[[NSNull null], response]);
//  }];
  
  HKQuantityType *vo2Type = [HKQuantityType quantityTypeForIdentifier:HKQuantityTypeIdentifierVO2Max];
  
  HKUnit *liter = [HKUnit literUnit];
  HKUnit *mass = [HKUnit gramUnit];
  HKUnit *min = [HKUnit minuteUnit];
  
  HKUnit *unit = [RCTAppleHealthKit hkUnitFromOptions:input key:@"unit" withDefault:[liter unitDividedByUnit:[mass unitMultipliedByUnit:min]]];
  NSUInteger limit = [RCTAppleHealthKit uintFromOptions:input key:@"limit" withDefault:HKObjectQueryNoLimit];
  BOOL ascending = [RCTAppleHealthKit boolFromOptions:input key:@"ascending" withDefault:false];
  NSDate *startDate = [RCTAppleHealthKit dateFromOptions:input key:@"startDate" withDefault:nil];
  NSDate *endDate = [RCTAppleHealthKit dateFromOptions:input key:@"endDate" withDefault:[NSDate date]];
  if(startDate == nil){
    callback(@[RCTMakeError(@"startDate is required in options", nil, nil)]);
    return;
  }
  NSPredicate * predicate = [RCTAppleHealthKit predicateForSamplesBetweenDates:startDate endDate:endDate];
  
  [self fetchQuantitySamplesOfType:vo2Type
                              unit:unit
                         predicate:predicate
                         ascending:ascending
                             limit:limit
                        completion:^(NSArray *results, NSError *error) {
                          if(results){
                            callback(@[[NSNull null], results]);
                            return;
                          } else {
                            NSLog(@"error getting VO2 samples: %@", error);
                            callback(@[RCTMakeError(@"error getting VO2 samples", nil, nil)]);
                            return;
                          }
                        }];
}

@end
