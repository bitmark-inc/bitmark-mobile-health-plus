//
//  RCTAppleHealthKit+Methods_Fitness.h
//  RCTAppleHealthKit
//
//  Created by Greg Wilson on 2016-06-26.
//  Copyright © 2016 Greg Wilson. All rights reserved.
//

#import "RCTAppleHealthKit.h"

@interface RCTAppleHealthKit (Methods_Fitness)

- (void)fitness_getStepCountOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)fitness_getDailyStepSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)fitness_saveSteps:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)fitness_initializeStepEventObserver:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)fitness_getDistanceWalkingRunningOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)fitness_getDistanceCyclingOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)fitness_getFlightsClimbedOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)fitness_getNikeFuelOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)fitness_getAppleExerciseTimeOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)fitness_getWheelchairDistanceOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)fitness_getPushCountOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)fitness_getDistanceSwimmingOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)fitness_getSwimmingStrokeCountOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)fitness_getBasalEnergyBurnedOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)fitness_getActiveEnergyBurnedOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)fitness_getVO2MaxOnDay:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;

@end
