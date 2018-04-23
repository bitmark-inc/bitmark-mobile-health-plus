//
//  RCTAppleHealthKit+Methods_Nutrition.m
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 8/2/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import "RCTAppleHealthKit+Methods_Nutrition.h"
#import "RCTAppleHealthKit+Queries.h"
#import "RCTAppleHealthKit+Utils.h"

@implementation RCTAppleHealthKit (Methods_Nutrition)

- (NSDictionary<NSString *, HKQuantityType *> *)nutrionKey {
  return @{@"DietaryFatTotal" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryFatTotal],
           @"DietaryFatPolyunsaturated" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryFatPolyunsaturated],
           @"DietaryFatMonounsaturated" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryFatMonounsaturated],
           @"DietaryFatSaturated" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryFatSaturated],
           @"DietaryCholesterol" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryCholesterol],
           @"DietarySodium" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietarySodium],
           @"DietaryCarbohydrates" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryCarbohydrates],
           @"DietaryFiber" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryFiber],
           @"DietarySugar" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietarySugar],
           @"DietaryEnergy" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryEnergyConsumed],
           @"DietaryProtein" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryProtein],
           
           @"DietaryVitaminA" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryVitaminA],
           @"DietaryVitaminB6" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryVitaminB6],
           @"DietaryVitaminB12" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryVitaminB12],
           @"DietaryVitaminC" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryVitaminC],
           @"DietaryVitaminD" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryVitaminD],
           @"DietaryVitaminE" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryVitaminE],
           @"DietaryVitaminK" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryVitaminK],
           @"DietaryCalcium" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryCalcium],
           @"DietaryIron" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryIron],
           @"DietaryThiamin" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryThiamin],
           @"DietaryRiboflavin" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryRiboflavin],
           @"DietaryNiacin" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryNiacin],
           @"DietaryFolate" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryFolate],
           @"DietaryBiotin" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryBiotin],
           @"DietaryPantothenicAcid" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryPantothenicAcid],
           @"DietaryPhosphorus" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryPhosphorus],
           @"DietaryIodine" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryIodine],
           @"DietaryMagnesium" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryMagnesium],
           @"DietaryZinc" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryZinc],
           @"DietarySelenium" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietarySelenium],
           @"DietaryCopper" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryCopper],
           @"DietaryManganese" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryManganese],
           @"DietaryChromium" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryChromium],
           @"DietaryMolybdenum" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryMolybdenum],
           @"DietaryChloride" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryChloride],
           @"DietaryPotassium" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryPotassium],
           @"DietaryCaffeine" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryCaffeine],
           @"DietaryWater" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryWater]};
}

- (void)results_getNutritionSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback
{
  
  NSString *keyType = [RCTAppleHealthKit stringFromOptions:input key:@"nutrition_item" withDefault:@""];
  HKQuantityType *type = [[self nutrionKey] valueForKey:keyType];
  
  HKUnit *unit = [HKUnit gramUnit];
  if ([keyType isEqualToString:@"DietaryWater"]){
    unit = [HKUnit literUnit];
  }
  else if ([keyType isEqualToString:@"DietaryEnergy"]) {
    unit = [HKUnit kilocalorieUnit];
  }
  
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
                            NSLog(@"error getting PeripheralPerfusionIndex samples: %@", error);
                            callback(@[RCTMakeError(@"error getting PeripheralPerfusionIndex samples", nil, nil)]);
                            return;
                          }
                        }];
}

@end
