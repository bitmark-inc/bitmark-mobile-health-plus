//
//  LocaleUnit.h
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 8/30/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface LocaleUnit : NSObject

+ (NSUnit *)mediumLengthUnit;
+ (NSUnit *)heightUnit;
+ (NSUnit *)smallLengthUnit;
+ (NSUnit *)mediumMassUnit;

+ (NSString *)convertToSIWithUnit:(NSUnit *)unit value:(double)value;

@end
