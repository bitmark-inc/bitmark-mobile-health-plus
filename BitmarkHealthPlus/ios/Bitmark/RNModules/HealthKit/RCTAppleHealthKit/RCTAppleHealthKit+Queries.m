//
//  RCTAppleHealthKit+Queries.m
//  RCTAppleHealthKit
//
//  Created by Greg Wilson on 2016-06-26.
//  Copyright © 2016 Greg Wilson. All rights reserved.
//

#import "RCTAppleHealthKit+Queries.h"
#import "RCTAppleHealthKit+Utils.h"
#import "HKSourceRevision+Exporting.h"
#import "HKDevice+Exporting.h"

@implementation RCTAppleHealthKit (Queries)


- (void)fetchMostRecentQuantitySampleOfType:(HKQuantityType *)quantityType
                                  predicate:(NSPredicate *)predicate
                                 completion:(void (^)(HKQuantity *, NSDate *, NSDate *, NSError *))completion {

    NSSortDescriptor *timeSortDescriptor = [[NSSortDescriptor alloc]
            initWithKey:HKSampleSortIdentifierEndDate
              ascending:NO
    ];

    HKSampleQuery *query = [[HKSampleQuery alloc]
            initWithSampleType:quantityType
                     predicate:predicate
                         limit:1
               sortDescriptors:@[timeSortDescriptor]
                resultsHandler:^(HKSampleQuery *query, NSArray *results, NSError *error) {

                      if (!results) {
                          if (completion) {
                              completion(nil, nil, nil, error);
                          }
                          return;
                      }

                      if (completion) {
                          // If quantity isn't in the database, return nil in the completion block.
                          HKQuantitySample *quantitySample = results.firstObject;
                          HKQuantity *quantity = quantitySample.quantity;
                          NSDate *startDate = quantitySample.startDate;
                          NSDate *endDate = quantitySample.endDate;
                          completion(quantity, startDate, endDate, error);
                      }
                }
    ];
    [self.healthStore executeQuery:query];
}


- (void)fetchQuantitySamplesOfType:(HKQuantityType *)quantityType
                              unit:(HKUnit *)unit
                         predicate:(NSPredicate *)predicate
                         ascending:(BOOL)asc
                             limit:(NSUInteger)lim
                        completion:(void (^)(NSArray *, NSError *))completion {

    NSSortDescriptor *timeSortDescriptor = [[NSSortDescriptor alloc] initWithKey:HKSampleSortIdentifierEndDate
                                                                       ascending:asc];

    // declare the block
    void (^handlerBlock)(HKSampleQuery *query, NSArray *results, NSError *error);
    // create and assign the block
    handlerBlock = ^(HKSampleQuery *query, NSArray *results, NSError *error) {
        if (!results) {
            if (completion) {
                completion(nil, error);
            }
            return;
        }

        if (completion) {
            NSMutableArray *data = [NSMutableArray arrayWithCapacity:1];

            dispatch_async(dispatch_get_main_queue(), ^{

                for (HKQuantitySample *sample in results) {
                    HKQuantity *quantity = sample.quantity;
                    double value = [quantity doubleValueForUnit:unit];

                    NSString *startDateString = [RCTAppleHealthKit buildISO8601StringFromDate:sample.startDate];
                    NSString *endDateString = [RCTAppleHealthKit buildISO8601StringFromDate:sample.endDate];
                  
                  HKSourceRevision *sourceRevision = sample.sourceRevision;
                  HKDevice *device = sample.device;
                  NSMutableDictionary *elem = [NSMutableDictionary dictionary];
                  [elem setValue:[NSString stringWithFormat:@"%f %@", value, unit.unitString] forKey:@"value"];
                  [elem setValue:startDateString forKey:@"startDate"];
                  [elem setValue:endDateString forKey:@"endDate"];
                  [elem setValue:sourceRevision.exportData forKey:@"sourceRevision"];
                  [elem setValue:device.exportData forKey:@"device"];

//                    NSDictionary *elem = @{
//                            @"value" : quantity.description,
//                            @"startDate" : startDateString,
//                            @"endDate" : endDateString,
//                            @"sourceRevision": sourceRevision.description,
//                            @"device": device.description
//                    };

                    [data addObject:elem];
                }

                completion(data, error);
            });
        }
    };

    HKSampleQuery *query = [[HKSampleQuery alloc] initWithSampleType:quantityType
                                                           predicate:predicate
                                                               limit:lim
                                                     sortDescriptors:@[timeSortDescriptor]
                                                      resultsHandler:handlerBlock];

    [self.healthStore executeQuery:query];
}









- (void)fetchSleepCategorySamplesForPredicate:(NSPredicate *)predicate
                                   limit:(NSUInteger)lim
                                   completion:(void (^)(NSArray *, NSError *))completion {


    NSSortDescriptor *timeSortDescriptor = [[NSSortDescriptor alloc] initWithKey:HKSampleSortIdentifierEndDate
                                                                       ascending:false];


    // declare the block
    void (^handlerBlock)(HKSampleQuery *query, NSArray *results, NSError *error);
    // create and assign the block
    handlerBlock = ^(HKSampleQuery *query, NSArray *results, NSError *error) {
        if (!results) {
            if (completion) {
                completion(nil, error);
            }
            return;
        }

        if (completion) {
            NSMutableArray *data = [NSMutableArray arrayWithCapacity:1];

            dispatch_async(dispatch_get_main_queue(), ^{

                for (HKCategorySample *sample in results) {

                    // HKCategoryType *catType = sample.categoryType;
                    NSInteger val = sample.value;

//                     HKQuantity *quantity = sample.quantity;
//                     double value = [quantity doubleValueForUnit:unit];

                    NSString *startDateString = [RCTAppleHealthKit buildISO8601StringFromDate:sample.startDate];
                    NSString *endDateString = [RCTAppleHealthKit buildISO8601StringFromDate:sample.endDate];

                    NSString *valueString;

                    switch (val) {
                      case HKCategoryValueSleepAnalysisInBed:
                        valueString = @"INBED";
                      break;
                      case HKCategoryValueSleepAnalysisAsleep:
                        valueString = @"ASLEEP";
                      break;
                     default:
                        valueString = @"UNKNOWN";
                     break;
                  }

                    NSDictionary *elem = @{
                            @"value" : valueString,
                            @"startDate" : startDateString,
                            @"endDate" : endDateString,
                            @"sourceRevision": [sample.sourceRevision exportData]
                    };

                    [data addObject:elem];
                }

                completion(data, error);
            });
        }
    };

    // HKSampleQuery *query = [[HKSampleQuery alloc] initWithSampleType:quantityType
    //                                                        predicate:predicate
    //                                                            limit:lim
    //                                                  sortDescriptors:@[timeSortDescriptor]
    //                                                   resultsHandler:handlerBlock];

    HKCategoryType *categoryType =
    [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierSleepAnalysis];

    // HKCategorySample *categorySample =
    // [HKCategorySample categorySampleWithType:categoryType
    //                                    value:value
    //                                startDate:startDate
    //                                  endDate:endDate];


   HKSampleQuery *query = [[HKSampleQuery alloc] initWithSampleType:categoryType
                                                          predicate:predicate
                                                              limit:lim
                                                    sortDescriptors:@[timeSortDescriptor]
                                                     resultsHandler:handlerBlock];


    [self.healthStore executeQuery:query];
}











- (void)fetchCervicalMucusQualityCategorySamplesForPredicate:(NSPredicate *)predicate
                                                       limit:(NSUInteger)lim
                                                  completion:(void (^)(NSArray *, NSError *))completion {
  
  
  NSSortDescriptor *timeSortDescriptor = [[NSSortDescriptor alloc] initWithKey:HKSampleSortIdentifierEndDate
                                                                     ascending:false];
  
  
  // declare the block
  void (^handlerBlock)(HKSampleQuery *query, NSArray *results, NSError *error);
  // create and assign the block
  handlerBlock = ^(HKSampleQuery *query, NSArray *results, NSError *error) {
    if (!results) {
      if (completion) {
        completion(nil, error);
      }
      return;
    }
    
    if (completion) {
      NSMutableArray *data = [NSMutableArray arrayWithCapacity:1];
      
      dispatch_async(dispatch_get_main_queue(), ^{
        
        for (HKCategorySample *sample in results) {
          
          // HKCategoryType *catType = sample.categoryType;
          NSInteger val = sample.value;
          
          NSString *startDateString = [RCTAppleHealthKit buildISO8601StringFromDate:sample.startDate];
          NSString *endDateString = [RCTAppleHealthKit buildISO8601StringFromDate:sample.endDate];
          
          NSString *valueString;
          
          switch (val) {
            case HKCategoryValueCervicalMucusQualityDry:
              valueString = @"DRY";
              break;
            case HKCategoryValueCervicalMucusQualitySticky:
              valueString = @"STICKY";
              break;
            case HKCategoryValueCervicalMucusQualityCreamy:
              valueString = @"CREAMY";
              break;
            case HKCategoryValueCervicalMucusQualityWatery:
              valueString = @"WATERY";
              break;
            case HKCategoryValueCervicalMucusQualityEggWhite:
              valueString = @"EGG WHITE";
              break;
            default:
              valueString = @"UNKNOWN";
              break;
          }
          
          NSDictionary *elem = @{
                                 @"value" : valueString,
                                 @"startDate" : startDateString,
                                 @"endDate" : endDateString,
                                 @"sourceRevision": [sample.sourceRevision exportData]
                                 };
          
          [data addObject:elem];
        }
        
        completion(data, error);
      });
    }
  };
  
  HKCategoryType *categoryType =
  [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierCervicalMucusQuality];
  
  
  HKSampleQuery *query = [[HKSampleQuery alloc] initWithSampleType:categoryType
                                                         predicate:predicate
                                                             limit:lim
                                                   sortDescriptors:@[timeSortDescriptor]
                                                    resultsHandler:handlerBlock];
  
  
  [self.healthStore executeQuery:query];
}












- (void)fetchOvulationTestResultCategorySamplesForPredicate:(NSPredicate *)predicate
                                                      limit:(NSUInteger)lim
                                                 completion:(void (^)(NSArray *, NSError *))completion {
  
  
  NSSortDescriptor *timeSortDescriptor = [[NSSortDescriptor alloc] initWithKey:HKSampleSortIdentifierEndDate
                                                                     ascending:false];
  
  
  // declare the block
  void (^handlerBlock)(HKSampleQuery *query, NSArray *results, NSError *error);
  // create and assign the block
  handlerBlock = ^(HKSampleQuery *query, NSArray *results, NSError *error) {
    if (!results) {
      if (completion) {
        completion(nil, error);
      }
      return;
    }
    
    if (completion) {
      NSMutableArray *data = [NSMutableArray arrayWithCapacity:1];
      
      dispatch_async(dispatch_get_main_queue(), ^{
        
        for (HKCategorySample *sample in results) {
          
          NSInteger val = sample.value;
          
          NSString *startDateString = [RCTAppleHealthKit buildISO8601StringFromDate:sample.startDate];
          NSString *endDateString = [RCTAppleHealthKit buildISO8601StringFromDate:sample.endDate];
          
          NSString *valueString;
          
          switch (val) {
            case HKCategoryValueOvulationTestResultNegative:
              valueString = @"NEGATIVE";
              break;
            case HKCategoryValueOvulationTestResultPositive:
              valueString = @"POSITIVE";
              break;
            default:
              valueString = @"UNKNOWN";
              break;
          }
          
          NSDictionary *elem = @{
                                 @"value" : valueString,
                                 @"startDate" : startDateString,
                                 @"endDate" : endDateString,
                                 @"sourceRevision": [sample.sourceRevision exportData]
                                 };
          
          [data addObject:elem];
        }
        
        completion(data, error);
      });
    }
  };
  
  HKCategoryType *categoryType =
  [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierOvulationTestResult];
  
  
  HKSampleQuery *query = [[HKSampleQuery alloc] initWithSampleType:categoryType
                                                         predicate:predicate
                                                             limit:lim
                                                   sortDescriptors:@[timeSortDescriptor]
                                                    resultsHandler:handlerBlock];
  
  
  [self.healthStore executeQuery:query];
}












- (void)fetchMenstrualFlowCategorySamplesForPredicate:(NSPredicate *)predicate
                                                limit:(NSUInteger)lim
                                           completion:(void (^)(NSArray *, NSError *))completion {
  
  
  NSSortDescriptor *timeSortDescriptor = [[NSSortDescriptor alloc] initWithKey:HKSampleSortIdentifierEndDate
                                                                     ascending:false];
  
  
  // declare the block
  void (^handlerBlock)(HKSampleQuery *query, NSArray *results, NSError *error);
  // create and assign the block
  handlerBlock = ^(HKSampleQuery *query, NSArray *results, NSError *error) {
    if (!results) {
      if (completion) {
        completion(nil, error);
      }
      return;
    }
    
    if (completion) {
      NSMutableArray *data = [NSMutableArray arrayWithCapacity:1];
      
      dispatch_async(dispatch_get_main_queue(), ^{
        
        for (HKCategorySample *sample in results) {
          
          NSInteger val = sample.value;
          
          NSString *startDateString = [RCTAppleHealthKit buildISO8601StringFromDate:sample.startDate];
          NSString *endDateString = [RCTAppleHealthKit buildISO8601StringFromDate:sample.endDate];
          
          NSString *valueString;
          
          switch (val) {
            case HKCategoryValueMenstrualFlowLight:
              valueString = @"LIGHT";
              break;
            case HKCategoryValueMenstrualFlowMedium:
              valueString = @"MEDIUM";
              break;
            case HKCategoryValueMenstrualFlowHeavy:
              valueString = @"HEAVY";
              break;
            default:
              valueString = @"UNKNOWN";
              break;
          }
          
          NSDictionary *elem = @{
                                 @"value" : valueString,
                                 @"startDate" : startDateString,
                                 @"endDate" : endDateString,
                                 @"sourceRevision": [sample.sourceRevision exportData]
                                 };
          
          [data addObject:elem];
        }
        
        completion(data, error);
      });
    }
  };
  
  HKCategoryType *categoryType =
  [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierMenstrualFlow];
  
  
  HKSampleQuery *query = [[HKSampleQuery alloc] initWithSampleType:categoryType
                                                         predicate:predicate
                                                             limit:lim
                                                   sortDescriptors:@[timeSortDescriptor]
                                                    resultsHandler:handlerBlock];
  
  
  [self.healthStore executeQuery:query];
}












- (void)fetchIntermenstrualBleedingCategorySamplesForPredicate:(NSPredicate *)predicate
                                                         limit:(NSUInteger)lim
                                                    completion:(void (^)(NSArray *, NSError *))completion {
  
  
  NSSortDescriptor *timeSortDescriptor = [[NSSortDescriptor alloc] initWithKey:HKSampleSortIdentifierEndDate
                                                                     ascending:false];
  
  
  // declare the block
  void (^handlerBlock)(HKSampleQuery *query, NSArray *results, NSError *error);
  // create and assign the block
  handlerBlock = ^(HKSampleQuery *query, NSArray *results, NSError *error) {
    if (!results) {
      if (completion) {
        completion(nil, error);
      }
      return;
    }
    
    if (completion) {
      NSMutableArray *data = [NSMutableArray arrayWithCapacity:1];
      
      dispatch_async(dispatch_get_main_queue(), ^{
        
        for (HKCategorySample *sample in results) {
          
          NSString *startDateString = [RCTAppleHealthKit buildISO8601StringFromDate:sample.startDate];
          NSString *endDateString = [RCTAppleHealthKit buildISO8601StringFromDate:sample.endDate];
          
          NSString *valueString = @"YES";
          
          NSDictionary *elem = @{
                                 @"value" : valueString,
                                 @"startDate" : startDateString,
                                 @"endDate" : endDateString,
                                 @"sourceRevision": [sample.sourceRevision exportData]
                                 };
          
          [data addObject:elem];
        }
        
        completion(data, error);
      });
    }
  };
  
  HKCategoryType *categoryType =
  [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierIntermenstrualBleeding];
  
  
  HKSampleQuery *query = [[HKSampleQuery alloc] initWithSampleType:categoryType
                                                         predicate:predicate
                                                             limit:lim
                                                   sortDescriptors:@[timeSortDescriptor]
                                                    resultsHandler:handlerBlock];
  
  
  [self.healthStore executeQuery:query];
}












- (void)fetchSexualActivityCategorySamplesForPredicate:(NSPredicate *)predicate
                                                         limit:(NSUInteger)lim
                                                    completion:(void (^)(NSArray *, NSError *))completion {
  
  
  NSSortDescriptor *timeSortDescriptor = [[NSSortDescriptor alloc] initWithKey:HKSampleSortIdentifierEndDate
                                                                     ascending:false];
  
  
  // declare the block
  void (^handlerBlock)(HKSampleQuery *query, NSArray *results, NSError *error);
  // create and assign the block
  handlerBlock = ^(HKSampleQuery *query, NSArray *results, NSError *error) {
    if (!results) {
      if (completion) {
        completion(nil, error);
      }
      return;
    }
    
    if (completion) {
      NSMutableArray *data = [NSMutableArray arrayWithCapacity:1];
      
      dispatch_async(dispatch_get_main_queue(), ^{
        
        for (HKCategorySample *sample in results) {
          
          NSString *startDateString = [RCTAppleHealthKit buildISO8601StringFromDate:sample.startDate];
          NSString *endDateString = [RCTAppleHealthKit buildISO8601StringFromDate:sample.endDate];
          
          NSString *valueString = @"YES";
          
          NSDictionary *elem = @{
                                 @"value" : valueString,
                                 @"startDate" : startDateString,
                                 @"endDate" : endDateString,
                                 @"sourceRevision": [sample.sourceRevision exportData]
                                 };
          
          [data addObject:elem];
        }
        
        completion(data, error);
      });
    }
  };
  
  HKCategoryType *categoryType =
  [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierSexualActivity];
  
  
  HKSampleQuery *query = [[HKSampleQuery alloc] initWithSampleType:categoryType
                                                         predicate:predicate
                                                             limit:lim
                                                   sortDescriptors:@[timeSortDescriptor]
                                                    resultsHandler:handlerBlock];
  
  
  [self.healthStore executeQuery:query];
}











- (void)fetchStandHourCategorySamplesForPredicate:(NSPredicate *)predicate
                                                 limit:(NSUInteger)lim
                                            completion:(void (^)(NSArray *, NSError *))completion {
  
  
  NSSortDescriptor *timeSortDescriptor = [[NSSortDescriptor alloc] initWithKey:HKSampleSortIdentifierEndDate
                                                                     ascending:false];
  
  
  // declare the block
  void (^handlerBlock)(HKSampleQuery *query, NSArray *results, NSError *error);
  // create and assign the block
  handlerBlock = ^(HKSampleQuery *query, NSArray *results, NSError *error) {
    if (!results) {
      if (completion) {
        completion(nil, error);
      }
      return;
    }
    
    if (completion) {
      NSMutableArray *data = [NSMutableArray arrayWithCapacity:1];
      
      dispatch_async(dispatch_get_main_queue(), ^{
        
        for (HKCategorySample *sample in results) {
          
          NSString *startDateString = [RCTAppleHealthKit buildISO8601StringFromDate:sample.startDate];
          NSString *endDateString = [RCTAppleHealthKit buildISO8601StringFromDate:sample.endDate];
          
          NSString *valueString = @"YES";
          
          NSDictionary *elem = @{
                                 @"value" : valueString,
                                 @"startDate" : startDateString,
                                 @"endDate" : endDateString,
                                 @"sourceRevision": [sample.sourceRevision exportData]
                                 };
          
          [data addObject:elem];
        }
        
        completion(data, error);
      });
    }
  };
  
  HKCategoryType *categoryType =
  [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierAppleStandHour];
  
  
  HKSampleQuery *query = [[HKSampleQuery alloc] initWithSampleType:categoryType
                                                         predicate:predicate
                                                             limit:lim
                                                   sortDescriptors:@[timeSortDescriptor]
                                                    resultsHandler:handlerBlock];
  
  
  [self.healthStore executeQuery:query];
}









- (void)fetchMindfulSessionCategorySamplesForPredicate:(NSPredicate *)predicate
                                            limit:(NSUInteger)lim
                                       completion:(void (^)(NSArray *, NSError *))completion {
  
  
  NSSortDescriptor *timeSortDescriptor = [[NSSortDescriptor alloc] initWithKey:HKSampleSortIdentifierEndDate
                                                                     ascending:false];
  
  
  // declare the block
  void (^handlerBlock)(HKSampleQuery *query, NSArray *results, NSError *error);
  // create and assign the block
  handlerBlock = ^(HKSampleQuery *query, NSArray *results, NSError *error) {
    if (!results) {
      if (completion) {
        completion(nil, error);
      }
      return;
    }
    
    if (completion) {
      NSMutableArray *data = [NSMutableArray arrayWithCapacity:1];
      
      dispatch_async(dispatch_get_main_queue(), ^{
        
        for (HKCategorySample *sample in results) {
          
          NSString *startDateString = [RCTAppleHealthKit buildISO8601StringFromDate:sample.startDate];
          NSString *endDateString = [RCTAppleHealthKit buildISO8601StringFromDate:sample.endDate];
          
          NSString *valueString = @"YES";
          
          NSDictionary *elem = @{
                                 @"value" : valueString,
                                 @"startDate" : startDateString,
                                 @"endDate" : endDateString,
                                 @"sourceRevision": [sample.sourceRevision exportData]
                                 };
          
          [data addObject:elem];
        }
        
        completion(data, error);
      });
    }
  };
  
  HKCategoryType *categoryType =
  [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierMindfulSession];
  
  
  HKSampleQuery *query = [[HKSampleQuery alloc] initWithSampleType:categoryType
                                                         predicate:predicate
                                                             limit:lim
                                                   sortDescriptors:@[timeSortDescriptor]
                                                    resultsHandler:handlerBlock];
  
  
  [self.healthStore executeQuery:query];
}











- (void)fetchCorrelationSamplesOfType:(HKCorrelationType *)quantityType
                            predicate:(NSPredicate *)predicate
                            ascending:(BOOL)asc
                                limit:(NSUInteger)lim
                           completion:(void (^)(NSArray *, NSError *))completion {

    NSSortDescriptor *timeSortDescriptor = [[NSSortDescriptor alloc] initWithKey:HKSampleSortIdentifierEndDate
                                                                       ascending:asc];

    // declare the block
    void (^handlerBlock)(HKSampleQuery *query, NSArray *results, NSError *error);
    // create and assign the block
    handlerBlock = ^(HKSampleQuery *query, NSArray *results, NSError *error) {
        if (!results) {
            if (completion) {
                completion(nil, error);
            }
            return;
        }

        if (completion) {
            NSMutableArray *data = [NSMutableArray arrayWithCapacity:1];

            dispatch_async(dispatch_get_main_queue(), ^{

                for (HKCorrelation *sample in results) {
                    NSString *startDateString = [RCTAppleHealthKit buildISO8601StringFromDate:sample.startDate];
                    NSString *endDateString = [RCTAppleHealthKit buildISO8601StringFromDate:sample.endDate];

                    NSDictionary *elem = @{
                      @"correlation" : sample,
                      @"startDate" : startDateString,
                      @"endDate" : endDateString,
                      @"sourceRevision": [sample.sourceRevision exportData]
                    };
                    [data addObject:elem];
                }

                completion(data, error);
            });
        }
    };

    HKSampleQuery *query = [[HKSampleQuery alloc] initWithSampleType:quantityType
                                                           predicate:predicate
                                                               limit:lim
                                                     sortDescriptors:@[timeSortDescriptor]
                                                      resultsHandler:handlerBlock];

    [self.healthStore executeQuery:query];
}


- (void)fetchSumOfSamplesTodayForType:(HKQuantityType *)quantityType
                                 unit:(HKUnit *)unit
                           completion:(void (^)(double, NSError *))completionHandler {

    NSPredicate *predicate = [RCTAppleHealthKit predicateForSamplesToday];
    HKStatisticsQuery *query = [[HKStatisticsQuery alloc] initWithQuantityType:quantityType
                                                          quantitySamplePredicate:predicate
                                                          options:HKStatisticsOptionCumulativeSum
                                                          completionHandler:^(HKStatisticsQuery *query, HKStatistics *result, NSError *error) {
                                                                HKQuantity *sum = [result sumQuantity];
                                                                if (completionHandler) {
                                                                    double value = [sum doubleValueForUnit:unit];
                                                                    completionHandler(value, error);
                                                                }
                                                          }];

    [self.healthStore executeQuery:query];
}


- (void)fetchSumOfSamplesOnDayForType:(HKQuantityType *)quantityType
                                 unit:(HKUnit *)unit
                                  day:(NSDate *)day
                           completion:(void (^)(double, NSDate *, NSDate *, NSError *))completionHandler {

    NSPredicate *predicate = [RCTAppleHealthKit predicateForSamplesOnDay:day];
    HKStatisticsQuery *query = [[HKStatisticsQuery alloc] initWithQuantityType:quantityType
                                                          quantitySamplePredicate:predicate
                                                          options:HKStatisticsOptionCumulativeSum
                                                          completionHandler:^(HKStatisticsQuery *query, HKStatistics *result, NSError *error) {
                                                              HKQuantity *sum = [result sumQuantity];
                                                              NSDate *startDate = result.startDate;
                                                              NSDate *endDate = result.endDate;
                                                              if (completionHandler) {
                                                                     double value = [sum doubleValueForUnit:unit];
                                                                     completionHandler(value,startDate, endDate, error);
                                                              }
                                                          }];

    [self.healthStore executeQuery:query];
}


- (void)fetchCumulativeSumStatisticsCollection:(HKQuantityType *)quantityType
                                          unit:(HKUnit *)unit
                                     startDate:(NSDate *)startDate
                                       endDate:(NSDate *)endDate
                                    completion:(void (^)(NSArray *, NSError *))completionHandler {

    NSCalendar *calendar = [NSCalendar currentCalendar];
    NSDateComponents *interval = [[NSDateComponents alloc] init];
    interval.hour = 1;

    NSDateComponents *anchorComponents = [calendar components:NSCalendarUnitDay | NSCalendarUnitMonth | NSCalendarUnitYear
                                                     fromDate:[NSDate date]];
    anchorComponents.hour = 0;
    NSDate *anchorDate = [calendar dateFromComponents:anchorComponents];

    // Create the query
    HKStatisticsCollectionQuery *query = [[HKStatisticsCollectionQuery alloc] initWithQuantityType:quantityType
                                                                           quantitySamplePredicate:nil
                                                                                           options:HKStatisticsOptionCumulativeSum | HKStatisticsOptionSeparateBySource
                                                                                        anchorDate:anchorDate
                                                                                intervalComponents:interval];

    // Set the results handler
    query.initialResultsHandler = ^(HKStatisticsCollectionQuery *query, HKStatisticsCollection *results, NSError *error) {
        if (error) {
            // Perform proper error handling here
            NSLog(@"*** An error occurred while calculating the statistics: %@ ***",error.localizedDescription);
        }

        NSMutableArray *data = [NSMutableArray arrayWithCapacity:1];
      
      NSMutableArray<NSDictionary *> *sourcesData = [NSMutableArray arrayWithCapacity:results.sources.count];
      for (HKSource *source in results.sources) {
        [sourcesData addObject:source.exportData];
      }
      [data addObject:@{@"sources": sourcesData}];
      
        [results enumerateStatisticsFromDate:startDate
                                      toDate:endDate
                                   withBlock:^(HKStatistics *result, BOOL *stop) {

                                       HKQuantity *quantity = result.sumQuantity;
                                       if (quantity) {
                                           NSDate *date = result.startDate;
                                           double value = [quantity doubleValueForUnit:[HKUnit countUnit]];

                                           NSString *dateString = [RCTAppleHealthKit buildISO8601StringFromDate:date];
                                           NSArray *elem = @[dateString, @(value)];
                                           [data addObject:elem];
                                       }
                                   }];
        NSError *err;
        completionHandler(data, err);
    };

    [self.healthStore executeQuery:query];
}


- (void)fetchCumulativeSumStatisticsCollection:(HKQuantityType *)quantityType
                                          unit:(HKUnit *)unit
                                     startDate:(NSDate *)startDate
                                       endDate:(NSDate *)endDate
                                     ascending:(BOOL)asc
                                         limit:(NSUInteger)lim
                                    completion:(void (^)(NSArray *, NSError *))completionHandler {

    NSCalendar *calendar = [NSCalendar currentCalendar];
    NSDateComponents *interval = [[NSDateComponents alloc] init];
    interval.hour = 1;

    NSDateComponents *anchorComponents = [calendar components:NSCalendarUnitDay | NSCalendarUnitMonth | NSCalendarUnitYear
                                                     fromDate:[NSDate date]];
    anchorComponents.hour = 0;
    NSDate *anchorDate = [calendar dateFromComponents:anchorComponents];

    // Create the query
    HKStatisticsCollectionQuery *query = [[HKStatisticsCollectionQuery alloc] initWithQuantityType:quantityType
                                                                           quantitySamplePredicate:nil
                                                                                           options:HKStatisticsOptionCumulativeSum | HKStatisticsOptionSeparateBySource
                                                                                        anchorDate:anchorDate
                                                                                intervalComponents:interval];

    // Set the results handler
    query.initialResultsHandler = ^(HKStatisticsCollectionQuery *query, HKStatisticsCollection *results, NSError *error) {
        if (error) {
            // Perform proper error handling here
            NSLog(@"*** An error occurred while calculating the statistics: %@ ***", error.localizedDescription);
        }

        NSMutableArray *data = [NSMutableArray arrayWithCapacity:1];

        [results enumerateStatisticsFromDate:startDate
                                      toDate:endDate
                                   withBlock:^(HKStatistics *result, BOOL *stop) {

                                       HKQuantity *quantity = result.sumQuantity;
                                       if (quantity) {
                                           NSDate *startDate = result.startDate;
                                           NSDate *endDate = result.endDate;
                                           double value = [quantity doubleValueForUnit:unit];

                                           NSString *startDateString = [RCTAppleHealthKit buildISO8601StringFromDate:startDate];
                                           NSString *endDateString = [RCTAppleHealthKit buildISO8601StringFromDate:endDate];
                                         
                                         NSMutableArray<NSDictionary *> *sourcesData = [NSMutableArray arrayWithCapacity:results.sources.count];
                                         for (HKSource *source in results.sources) {
                                           [sourcesData addObject:source.exportData];
                                         }

                                           NSDictionary *elem = @{
                                                   @"value" : [NSString stringWithFormat:@"%f %@", value, unit.unitString],
                                                   @"startDate" : startDateString,
                                                   @"endDate" : endDateString,
                                                   @"sources": sourcesData
                                           };
                                           [data addObject:elem];
                                       }
                                   }];
        // is ascending by default
        if(asc == false) {
            [RCTAppleHealthKit reverseNSMutableArray:data];
        }

        if(lim > 0) {
            NSArray* slicedArray = [data subarrayWithRange:NSMakeRange(0, lim)];
            NSError *err;
            completionHandler(slicedArray, err);
        } else {
            NSError *err;
            completionHandler(data, err);
        }
    };

    [self.healthStore executeQuery:query];
}

@end
