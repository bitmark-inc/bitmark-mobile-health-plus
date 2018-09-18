//
//  LocaleUnit.m
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 8/30/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import "LocaleUnit.h"

@implementation LocaleUnit

+ (NSUnit *)mediumLengthUnit {
  if ([[NSLocale autoupdatingCurrentLocale] usesMetricSystem]) {
    return [NSUnitLength meters];
  }
  else {
    return [NSUnitLength feet];
  }
}

+ (NSUnit *)smallLengthUnit {
  if ([[NSLocale autoupdatingCurrentLocale] usesMetricSystem]) {
    return [NSUnitLength centimeters];
  }
  else {
    return [NSUnitLength inches];
  }
}

+ (NSUnit *)heightUnit {
  if ([[NSLocale autoupdatingCurrentLocale] usesMetricSystem]) {
    return [NSUnitLength centimeters];
  }
  else {
    return [NSUnitLength feet];
  }
}

+ (NSUnit *)mediumMassUnit {
  if ([[NSLocale autoupdatingCurrentLocale] usesMetricSystem]) {
    return [NSUnitMass kilograms];
  }
  else {
    return [NSUnitMass poundsMass];
  }
}

+ (NSString *)convertToSIWithUnit:(NSUnit *)unit value:(double)value {
  NSMeasurement *measurement = [[NSMeasurement alloc] initWithDoubleValue:value unit:unit];
  NSMeasurement *converted = nil;
  
  if ([unit isMemberOfClass:[NSUnitLength class]]) {
    converted = [measurement measurementByConvertingToUnit:[NSUnitLength meters]];
  }
  else if ([unit isMemberOfClass:[NSUnitMass class]]) {
    converted = [measurement measurementByConvertingToUnit:[NSUnitMass grams]];
  }
  else {
    converted = measurement;
  }
  
  return [NSString stringWithFormat:@"%f %@", converted.doubleValue, converted.unit.symbol];
  
//  NSMeasurementFormatter *formatter = [NSMeasurementFormatter new];
//  formatter.locale = [[NSLocale alloc] initWithLocaleIdentifier:@"en_GB"];
//  NSString *result = [formatter stringFromMeasurement:measurement];
//  return [formatter stringFromMeasurement:converted];
}

@end
