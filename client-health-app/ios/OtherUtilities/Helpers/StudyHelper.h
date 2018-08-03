//
//  StudyHelper.h
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 7/28/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <ResearchKit/ResearchKit.h>
#import <React/RCTBridgeModule.h>

@interface StudyHelper : NSObject

+ (NSArray *)iterateTaskResult:(ORKTaskResult *)taskResult withDataIteratingBlock:(NSObject* (^)(ORKStepResult *stepResult))block;

@end
