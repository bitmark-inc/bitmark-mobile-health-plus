//
//  NSDate+Converting.m
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 8/31/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import "NSDate+Converting.h"

@implementation NSDate (Converting)

- (NSString *)iso8601String
{
  static NSDateFormatter *formatter = nil;
  if (!formatter)
  {
    formatter = [[NSDateFormatter alloc] init];
    [formatter setLocale: [NSLocale localeWithLocaleIdentifier:@"en_US_POSIX"]];
    formatter.timeZone = [NSTimeZone timeZoneWithAbbreviation: @"UTC"];
    [formatter setDateFormat:@"yyyy-MM-dd'T'HH:mm:ss.SSS"];
    
  }
  NSString *iso8601String = [formatter stringFromDate:self];
  return [iso8601String stringByAppendingString: @"Z"];
}

@end
