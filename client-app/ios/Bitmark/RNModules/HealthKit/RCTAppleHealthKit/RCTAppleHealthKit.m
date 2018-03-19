//
//  RCTAppleHealthKit.m
//  RCTAppleHealthKit
//
//  Created by Greg Wilson on 2016-06-26.
//  Copyright © 2016 Greg Wilson. All rights reserved.
//

#import "RCTAppleHealthKit.h"
#import "RCTAppleHealthKit+TypesAndPermissions.h"

#import "RCTAppleHealthKit+Methods_Body.h"
#import "RCTAppleHealthKit+Methods_Fitness.h"
#import "RCTAppleHealthKit+Methods_Characteristic.h"
#import "RCTAppleHealthKit+Methods_Vitals.h"
#import "RCTAppleHealthKit+Methods_Results.h"
#import "RCTAppleHealthKit+Methods_Sleep.h"
#import "RCTAppleHealthKit+Methods_ReproductiveHealth.h"
#import "RCTAppleHealthKit+Methods_Nutrition.h"
#import "RCTAppleHealthKit+Methods_Environment.h"
#import "RCTAppleHealthKit+ExtraData.h"

#import <React/RCTBridgeModule.h>
#import <React/RCTEventDispatcher.h>

@implementation RCTAppleHealthKit
@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(isAvailable:(RCTResponseSenderBlock)callback)
{
    [self isHealthKitAvailable:callback];
}

RCT_EXPORT_METHOD(initHealthKit:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self initializeHealthKit:input callback:callback];
}

RCT_EXPORT_METHOD(getDeterminedHKPermission:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self permission_getDeterminedItems:input callback:callback];
}

RCT_EXPORT_METHOD(initStepCountObserver:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self fitness_initializeStepEventObserver:input callback:callback];
}

RCT_EXPORT_METHOD(getBiologicalSex:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self characteristic_getBiologicalSex:input callback:callback];
}

RCT_EXPORT_METHOD(getDateOfBirth:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self characteristic_getDateOfBirth:input callback:callback];
}

RCT_EXPORT_METHOD(getWheelchairUse:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self characteristic_getWheelchairUse:input callback:callback];
}

RCT_EXPORT_METHOD(getBloodType:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self characteristic_getBloodType:input callback:callback];
}

RCT_EXPORT_METHOD(getFitzpatrickSkinType:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self characteristic_getFitzpatrickSkinType:input callback:callback];
}

RCT_EXPORT_METHOD(getLatestWaistCircumference:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self body_getLatestWaistCircumference:input callback:callback];
}

RCT_EXPORT_METHOD(getVO2MaxOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self fitness_getVO2MaxOnDay:input callback:callback];
}

RCT_EXPORT_METHOD(getLatestWeight:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self body_getLatestWeight:input callback:callback];
}

RCT_EXPORT_METHOD(getWeightSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self body_getWeightSamples:input callback:callback];
}

RCT_EXPORT_METHOD(saveWeight:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self body_saveWeight:input callback:callback];
}

RCT_EXPORT_METHOD(getLatestHeight:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self body_getLatestHeight:input callback:callback];
}

RCT_EXPORT_METHOD(getHeightSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self body_getHeightSamples:input callback:callback];
}

RCT_EXPORT_METHOD(saveHeight:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self body_saveHeight:input callback:callback];
}

RCT_EXPORT_METHOD(getLatestBmi:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self body_getLatestBodyMassIndex:input callback:callback];
}

RCT_EXPORT_METHOD(saveBmi:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self body_saveBodyMassIndex:input callback:callback];
}

RCT_EXPORT_METHOD(getLatestBodyFatPercentage:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self body_getLatestBodyFatPercentage:input callback:callback];
}

RCT_EXPORT_METHOD(getLatestLeanBodyMass:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self body_getLatestLeanBodyMass:input callback:callback];
}

RCT_EXPORT_METHOD(getStepCount:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self fitness_getStepCountOnDay:input callback:callback];
}

RCT_EXPORT_METHOD(getDailyStepCountSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self fitness_getDailyStepSamples:input callback:callback];
}

RCT_EXPORT_METHOD(saveSteps:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self fitness_saveSteps:input callback:callback];
}

RCT_EXPORT_METHOD(getDistanceWalkingRunning:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self fitness_getDistanceWalkingRunningOnDay:input callback:callback];
}

RCT_EXPORT_METHOD(getDistanceCycling:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self fitness_getDistanceCyclingOnDay:input callback:callback];
}

RCT_EXPORT_METHOD(getBasalEnergyBurnedOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self fitness_getBasalEnergyBurnedOnDay:input callback:callback];
}

RCT_EXPORT_METHOD(getActiveEnergyBurnedOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self fitness_getActiveEnergyBurnedOnDay:input callback:callback];
}

RCT_EXPORT_METHOD(getFlightsClimbed:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self fitness_getFlightsClimbedOnDay:input callback:callback];
}

RCT_EXPORT_METHOD(getNikeFuelOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self fitness_getNikeFuelOnDay:input callback:callback];
}

RCT_EXPORT_METHOD(getAppleExerciseTimeOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self fitness_getAppleExerciseTimeOnDay:input callback:callback];
}

RCT_EXPORT_METHOD(getWheelchairDistanceOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self fitness_getWheelchairDistanceOnDay:input callback:callback];
}

RCT_EXPORT_METHOD(getPushCountOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self fitness_getPushCountOnDay:input callback:callback];
}

RCT_EXPORT_METHOD(getDistanceSwimmingOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self fitness_getDistanceSwimmingOnDay:input callback:callback];
}

RCT_EXPORT_METHOD(getSwimmingStrokeCountOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self fitness_getSwimmingStrokeCountOnDay:input callback:callback];
}

RCT_EXPORT_METHOD(getHeartRateSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self vitals_getHeartRateSamples:input callback:callback];
}

RCT_EXPORT_METHOD(getBodyTemperatureSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self vitals_getBodyTemperatureSamples:input callback:callback];
}

RCT_EXPORT_METHOD(getBasalBodyTemperatureSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self vitals_getBasalBodyTemperatureSamples:input callback:callback];
}

RCT_EXPORT_METHOD(getBloodPressureSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self vitals_getBloodPressureSamples:input callback:callback];
}

RCT_EXPORT_METHOD(getFoodSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self vitals_getFoodSamples:input callback:callback];
}

RCT_EXPORT_METHOD(getRespiratoryRateSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self vitals_getRespiratoryRateSamples:input callback:callback];
}

RCT_EXPORT_METHOD(getOxygenSaturationSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self results_getOxygenSaturationSamples:input callback:callback];
}

RCT_EXPORT_METHOD(getPeripheralPerfusionIndexSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self results_getPeripheralPerfusionIndexSamples:input callback:callback];
}

RCT_EXPORT_METHOD(getBloodGlucoseSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self results_getBloodGlucoseSamples:input callback:callback];
}

RCT_EXPORT_METHOD(getNumberOfTimesFallenSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self results_getNumberOfTimesFallenSamples:input callback:callback];
}

RCT_EXPORT_METHOD(getElectrodermalActivitySamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self results_getElectrodermalActivitySamples:input callback:callback];
}

RCT_EXPORT_METHOD(getInhalerUsageSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self results_getInhalerUsageSamples:input callback:callback];
}

RCT_EXPORT_METHOD(getBloodAlcoholContentSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self results_getBloodAlcoholContentSamples:input callback:callback];
}

RCT_EXPORT_METHOD(getForcedVitalCapacitySamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self results_getForcedVitalCapacitySamples:input callback:callback];
}

RCT_EXPORT_METHOD(getExpiratoryVolume1Samples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self results_getExpiratoryVolume1Samples:input callback:callback];
}

RCT_EXPORT_METHOD(getExpiratoryFlowRateSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self results_getExpiratoryFlowRateSamples:input callback:callback];
}

RCT_EXPORT_METHOD(getSleepSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self sleep_getSleepSamples:input callback:callback];
}

RCT_EXPORT_METHOD(getCervicalMucousQuality:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self reproductiveHealth_getCervicalMucousQuality:input callback:callback];
}

RCT_EXPORT_METHOD(getOvulationTestResult:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self reproductiveHealth_getOvulationTestResult:input callback:callback];
}


RCT_EXPORT_METHOD(getMenstrualFlow:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self reproductiveHealth_getMenstrualFlow:input callback:callback];
}


RCT_EXPORT_METHOD(getIntermenstrualBleeding:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self reproductiveHealth_getIntermenstrualBleeding:input callback:callback];
}


RCT_EXPORT_METHOD(getSexualActivity:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self reproductiveHealth_getSexualActivity:input callback:callback];
}

RCT_EXPORT_METHOD(getNutritionSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self results_getNutritionSamples:input callback:callback];
}

RCT_EXPORT_METHOD(getUVExposure:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self environment_getUVExposure:input callback:callback];
}

RCT_EXPORT_METHOD(getStandHour:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self stand_getStandHour:input callback:callback];
}

RCT_EXPORT_METHOD(getMindfullSession:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self mindful_getMindfulSession:input callback:callback];
}

RCT_EXPORT_METHOD(getWorkoutTypeOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
  [self extra_getWorkoutTypeOnDay:input callback:callback];
}


RCT_EXPORT_METHOD(getInfo:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback)
{
    [self getModuleInfo:input callback:callback];
}


- (void)isHealthKitAvailable:(RCTResponseSenderBlock)callback
{
    BOOL isAvailable = NO;
    if ([HKHealthStore isHealthDataAvailable]) {
        isAvailable = YES;
    }
    callback(@[[NSNull null], @(isAvailable)]);
}


- (void)initializeHealthKit:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback
{
    self.healthStore = [[HKHealthStore alloc] init];

    if ([HKHealthStore isHealthDataAvailable]) {
        NSSet *writeDataTypes;
        NSSet *readDataTypes;

        // get permissions from input object provided by JS options argument
        NSDictionary* permissions =[input objectForKey:@"permissions"];
        if(permissions != nil){
            NSArray* readPermsArray = [permissions objectForKey:@"read"];
            NSArray* writePermsArray = [permissions objectForKey:@"write"];
            NSSet* readPerms = [self getReadPermsFromOptions:readPermsArray];
            NSSet* writePerms = [self getWritePermsFromOptions:writePermsArray];

            if(readPerms != nil) {
                readDataTypes = readPerms;
            }
            if(writePerms != nil) {
                writeDataTypes = writePerms;
            }
        } else {
            callback(@[RCTMakeError(@"permissions must be provided in the initialization options", nil, nil)]);
            return;
        }

        // make sure at least 1 read or write permission is provided
        if(!writeDataTypes && !readDataTypes){
            callback(@[RCTMakeError(@"at least 1 read or write permission must be set in options.permissions", nil, nil)]);
            return;
        }

        [self.healthStore requestAuthorizationToShareTypes:writeDataTypes readTypes:readDataTypes completion:^(BOOL success, NSError *error) {
            if (!success) {
                NSString *errMsg = [NSString stringWithFormat:@"Error with HealthKit authorization: %@", error];
                callback(@[RCTMakeError(errMsg, nil, nil)]);
                return;
            } else {
                dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                    callback(@[[NSNull null], @true]);
                });
            }
        }];
    } else {
        callback(@[RCTMakeError(@"HealthKit data is not available", nil, nil)]);
    }
}

- (void)permission_getDeterminedItems:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback
{
  self.healthStore = [[HKHealthStore alloc] init];
  
  if ([HKHealthStore isHealthDataAvailable]) {
    // get permissions from input object provided by JS options argument
    NSDictionary* permissions =[input objectForKey:@"permissions"];
    if(permissions != nil){
      NSArray* readPermsArray = [permissions objectForKey:@"read"];
      NSArray* writePermsArray = [permissions objectForKey:@"write"];
      
      NSMutableArray<NSString *> *determinedReadPermsArray = [NSMutableArray array];
      NSMutableArray<NSString *> *determinedWritePermsArray = [NSMutableArray array];
      
      NSDictionary *readPermsDict = [self readPermsDict];
      
      for (NSString *readPerm in readPermsArray) {
        if ([self.healthStore authorizationStatusForType:[readPermsDict objectForKey:readPerm]] != HKAuthorizationStatusNotDetermined) {
          [determinedReadPermsArray addObject:readPerm];
        }
      }
      
      NSDictionary *writePermsDict = [self writePermsDict];
      
      for (NSString *writePerm in writePermsArray) {
        if ([self.healthStore authorizationStatusForType:[writePermsDict objectForKey:writePerm]] != HKAuthorizationStatusNotDetermined) {
          [determinedWritePermsArray addObject:writePerm];
        }
      }
      
      // Build object to return
      NSDictionary *result = @{@"permissions": @{
                                   @"read": determinedReadPermsArray,
                                   @"write": determinedWritePermsArray,
                                   }};
      callback(@[@YES, result]);
      return;
    } else {
      callback(@[@NO]);
      return;
    }
  }
  
  callback(@[@NO]);
}

- (void)getModuleInfo:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback
{
    NSDictionary *info = @{
            @"name" : @"react-native-apple-healthkit",
            @"description" : @"A React Native bridge module for interacting with Apple HealthKit data",
            @"className" : @"RCTAppleHealthKit",
            @"author": @"Greg Wilson",
    };
    callback(@[[NSNull null], info]);
}

@end
