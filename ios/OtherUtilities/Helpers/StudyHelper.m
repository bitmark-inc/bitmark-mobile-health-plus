//
//  StudyHelper.m
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 7/28/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import "StudyHelper.h"

@implementation StudyHelper

+ (NSArray *)iterateTaskResult:(ORKTaskResult *)taskResult withDataIteratingBlock:(NSObject *(^)(ORKStepResult *))block {
  // Global variable to collect data
  NSMutableDictionary *callbackResults = [NSMutableDictionary dictionary];
  
  for (ORKStepResult *stepResult in taskResult.results) {
    
    NSObject *stepResultData = block(stepResult);
    [callbackResults setValue:stepResultData forKey:stepResult.identifier];
  }
  
  return @[@YES, callbackResults];
}

@end
