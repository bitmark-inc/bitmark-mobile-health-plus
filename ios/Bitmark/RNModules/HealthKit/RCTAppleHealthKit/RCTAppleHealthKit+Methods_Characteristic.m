//
//  RCTAppleHealthKit+Methods_Characteristic.m
//  RCTAppleHealthKit
//
//  Created by Greg Wilson on 2016-06-29.
//  Copyright © 2016 Greg Wilson. All rights reserved.
//

#import "RCTAppleHealthKit+Methods_Characteristic.h"
#import "RCTAppleHealthKit+Utils.h"

@implementation RCTAppleHealthKit (Methods_Characteristic)


- (void)characteristic_getBiologicalSex:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback {
    NSError *error;
    HKBiologicalSexObject *bioSex = [self.healthStore biologicalSexWithError:&error];
    NSString *value;

    switch (bioSex.biologicalSex) {
        case HKBiologicalSexNotSet:
            value = @"unknown";
            break;
        case HKBiologicalSexFemale:
            value = @"female";
            break;
        case HKBiologicalSexMale:
            value = @"male";
            break;
        case HKBiologicalSexOther:
            value = @"other";
            break;
    }

    if(value == nil){
        NSLog(@"error getting biological sex: %@", error);
        callback(@[RCTMakeError(@"error getting biological sex", error, nil)]);
        return;
    }

    NSDictionary *response = @{
            @"value" : value,
    };

    callback(@[[NSNull null], response]);
}


- (void)characteristic_getBloodType:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback {
  NSError *error;
  HKBloodTypeObject *bloodType = [self.healthStore bloodTypeWithError:&error];
  NSString *value;
  
  switch (bloodType.bloodType) {
    case HKBloodTypeAPositive:
      value = @"A+";
      break;
    case HKBloodTypeANegative:
      value = @"A-";
      break;
    case HKBloodTypeBPositive:
      value = @"B+";
      break;
    case HKBloodTypeBNegative:
      value = @"B-";
      break;
    case HKBloodTypeABPositive:
      value = @"AB+";
      break;
    case HKBloodTypeABNegative:
      value = @"AB-";
      break;
    case HKBloodTypeOPositive:
      value = @"O+";
      break;
    case HKBloodTypeONegative:
      value = @"O-";
      break;
    case HKBloodTypeNotSet:
      value = @"not set";
      break;
  }
  
  if(value == nil){
    NSLog(@"error getting blood type: %@", error);
    callback(@[RCTMakeError(@"error getting blood type", error, nil)]);
    return;
  }
  
  NSDictionary *response = @{
                             @"value" : value,
                             };
  
  callback(@[[NSNull null], response]);
}


- (void)characteristic_getDateOfBirth:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback {
    NSError *error;
    NSDate *dob = [self.healthStore dateOfBirthWithError:&error];

    if(error != nil){
        NSLog(@"error getting date of birth: %@", error);
        callback(@[RCTMakeError(@"error getting date of birth", error, nil)]);
        return;
    }
    if(dob == nil) {
        NSDictionary *response = @{
                                   @"value" : [NSNull null],
                                   @"age" : [NSNull null]
                                   };
        callback(@[[NSNull null], response]);
        return;
    }

    NSString *dobString = [RCTAppleHealthKit buildISO8601StringFromDate:dob];

    NSDate *now = [NSDate date];
    NSDateComponents *ageComponents = [[NSCalendar currentCalendar] components:NSCalendarUnitYear fromDate:dob toDate:now options:NSCalendarWrapComponents];
    NSUInteger ageInYears = ageComponents.year;

    NSDictionary *response = @{
            @"value" : dobString,
            @"age" : @(ageInYears),
    };

    callback(@[[NSNull null], response]);
}

- (void)characteristic_getWheelchairUse:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback {
  NSError *error;
  HKWheelchairUseObject *wheelchairUse = [self.healthStore wheelchairUseWithError:&error];
  
  NSString *value;
  
  switch (wheelchairUse.wheelchairUse) {
    case HKWheelchairUseNotSet:
      value = @"unknown";
      break;
    case HKWheelchairUseNo:
      value = @"no";
      break;
    case HKWheelchairUseYes:
      value = @"yes";
      break;
  }
  
  if(value == nil){
    NSLog(@"error getting wheelchar use: %@", error);
    callback(@[RCTMakeError(@"error getting wheelchair use", error, nil)]);
    return;
  }
  
  NSDictionary *response = @{
                             @"value" : value,
                             };
  
  callback(@[[NSNull null], response]);
}

- (void)characteristic_getFitzpatrickSkinType:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback {
  NSError *error;
  HKFitzpatrickSkinTypeObject *fitzpatrickSkinType = [self.healthStore fitzpatrickSkinTypeWithError:&error];
  
  NSString *value;
  switch (fitzpatrickSkinType.skinType) {
    case HKFitzpatrickSkinTypeNotSet:
      value = @"not set";
      break;
    case HKFitzpatrickSkinTypeI:
      value = @"type I";
      break;
    case HKFitzpatrickSkinTypeII:
      value = @"type II";
      break;
    case HKFitzpatrickSkinTypeIII:
      value = @"type III";
      break;
    case HKFitzpatrickSkinTypeIV:
      value = @"type IV";
      break;
    case HKFitzpatrickSkinTypeV:
      value = @"type V";
      break;
    case HKFitzpatrickSkinTypeVI:
      value = @"type VI";
      break;
  }
  
  if(value == nil){
    NSLog(@"error getting wheelchar use: %@", error);
    callback(@[RCTMakeError(@"error getting wheelchair use", error, nil)]);
    return;
  }
  
  NSDictionary *response = @{
                             @"value" : value,
                             };
  
  callback(@[[NSNull null], response]);
}

@end
