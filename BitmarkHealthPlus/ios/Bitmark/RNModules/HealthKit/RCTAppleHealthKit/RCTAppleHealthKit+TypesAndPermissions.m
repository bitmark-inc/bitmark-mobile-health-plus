//
//  RCTAppleHealthKit+TypesAndPermissions.m
//  RCTAppleHealthKit
//
//  Created by Greg Wilson on 2016-06-26.
//  Copyright © 2016 Greg Wilson. All rights reserved.
//

#import "RCTAppleHealthKit+TypesAndPermissions.h"

@implementation RCTAppleHealthKit (TypesAndPermissions)


#pragma mark - HealthKit Permissions

- (NSDictionary *)readPermsDict {
    NSDictionary *readPerms = @{
        // Characteristic Identifiers
        @"DateOfBirth" : [HKObjectType characteristicTypeForIdentifier:HKCharacteristicTypeIdentifierDateOfBirth],
        @"BiologicalSex" : [HKObjectType characteristicTypeForIdentifier:HKCharacteristicTypeIdentifierBiologicalSex],
        @"WheelchairUse" : [HKObjectType characteristicTypeForIdentifier:HKCharacteristicTypeIdentifierWheelchairUse],
        @"BloodType" : [HKObjectType characteristicTypeForIdentifier:HKCharacteristicTypeIdentifierBloodType],
        @"FitzpatrickSkinType" : [HKObjectType characteristicTypeForIdentifier:HKCharacteristicTypeIdentifierFitzpatrickSkinType],
        // Body Measurements
        @"Height" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierHeight],
        @"Weight" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierBodyMass],
        @"BodyMass" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierBodyMass],
        @"BodyFatPercentage" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierBodyFatPercentage],
        @"BodyMassIndex" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierBodyMassIndex],
        @"LeanBodyMass" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierLeanBodyMass],
        // Fitness Identifiers
        @"Steps" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierStepCount],
        @"StepCount" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierStepCount],
        @"DistanceWalkingRunning" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDistanceWalkingRunning],
        @"DistanceCycling" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDistanceCycling],
        @"WheelchairDistance" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDistanceWheelchair],
        @"BasalEnergyBurned" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierBasalEnergyBurned],
        @"ActiveEnergyBurned" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierActiveEnergyBurned],
        @"FlightsClimbed" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierFlightsClimbed],
        @"NikeFuel" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierNikeFuel],
        @"AppleExerciseTime" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierAppleExerciseTime],
        @"PushCount" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierPushCount],
        @"DistanceSwimming" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDistanceSwimming],
        @"SwimmingStrokeCount" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierSwimmingStrokeCount],
        // Nutrition Identifiers
        @"DietaryEnergy" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryEnergyConsumed],
        // Vital Signs Identifiers
        @"HeartRate" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierHeartRate],
        @"BodyTemperature" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierBodyTemperature],
        @"BasalBodyTemperature" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierBasalBodyTemperature],
        @"BloodPressureSystolic" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierBloodPressureSystolic],
        @"BloodPressureDiastolic" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierBloodPressureDiastolic],
        @"RespiratoryRate" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierRespiratoryRate],
        @"Food" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryEnergyConsumed],
        // Results Identifiers
        @"OxygenSaturation" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierOxygenSaturation],
        @"PeripheralPerfusionIndex" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierPeripheralPerfusionIndex],
        @"BloodGlucose" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierBloodGlucose],
        @"NumberOfTimesFallen" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierNumberOfTimesFallen],
        @"ElectrodermalActivity" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierElectrodermalActivity],
        @"InhalerUsage" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierInhalerUsage],
        @"BloodAlcoholContent" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierBloodAlcoholContent],
        @"ForcedVitalCapacity" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierForcedVitalCapacity],
        @"ExpiratoryVolume1" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierForcedExpiratoryVolume1],
        @"ExpiratoryFlowRate" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierPeakExpiratoryFlowRate],
        // Nutrition
        @"DietaryFatTotal" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryFatTotal],
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
        @"DietaryWater" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryWater],
        // Environment
        @"UVExposure" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierUVExposure],
        // Sleep
        @"SleepAnalysis" : [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierSleepAnalysis],
        @"StandHour" : [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierAppleStandHour],
        @"MindfulSession" : [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierMindfulSession],
        //Reproductive Health
        @"CervicalMucousQuality" : [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierCervicalMucusQuality],
        @"OvulationTestResult" : [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierOvulationTestResult],
        @"MenstrualFlow" : [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierMenstrualFlow],
        @"IntermenstrualBleeding" : [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierIntermenstrualBleeding],
        @"SexualActivity" : [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierSexualActivity],
    };
    return readPerms;
}


- (NSDictionary *)writePermsDict {
    NSDictionary *writePerms = @{
        // Body Measurements
        @"Height" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierHeight],
        @"Weight" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierBodyMass],
        @"BodyMass" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierBodyMass],
        @"BodyFatPercentage" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierBodyFatPercentage],
        @"BodyMassIndex" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierBodyMassIndex],
        @"LeanBodyMass" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierLeanBodyMass],
        // Fitness Identifiers
        @"Steps" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierStepCount],
        @"StepCount" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierStepCount],
        @"DistanceWalkingRunning" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDistanceWalkingRunning],
        @"DistanceCycling" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDistanceCycling],
        @"BasalEnergyBurned" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierBasalEnergyBurned],
        @"ActiveEnergyBurned" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierActiveEnergyBurned],
        @"FlightsClimbed" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierFlightsClimbed],
        // Nutrition Identifiers
        @"DietaryEnergy" : [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDietaryEnergyConsumed],
        // Sleep
        @"SleepAnalysis" : [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierSleepAnalysis],
    };
    return writePerms;
}


// Returns HealthKit read permissions from options array
- (NSSet *)getReadPermsFromOptions:(NSArray *)options {
    NSDictionary *readPermDict = [self readPermsDict];
    NSMutableSet *readPermSet = [NSMutableSet setWithCapacity:1];

    for(int i=0; i<[options count]; i++) {
        NSString *optionKey = options[i];
        HKObjectType *val = [readPermDict objectForKey:optionKey];
        if(val != nil) {
            [readPermSet addObject:val];
        }
    }
    return readPermSet;
}


// Returns HealthKit write permissions from options array
- (NSSet *)getWritePermsFromOptions:(NSArray *)options {
    NSDictionary *writePermDict = [self writePermsDict];
    NSMutableSet *writePermSet = [NSMutableSet setWithCapacity:1];

    for(int i=0; i<[options count]; i++) {
        NSString *optionKey = options[i];
        HKObjectType *val = [writePermDict objectForKey:optionKey];
        if(val != nil) {
            [writePermSet addObject:val];
        }
    }
    return writePermSet;
}

@end
