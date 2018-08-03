//
//  NSDate+Computing.m
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 9/19/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import "NSDate+Computing.h"

@implementation NSDate (Computing)

- (NSDate *)dateForNumberOfYearsAgo:(NSUInteger)numberOfYears {
  NSDate *today = [[NSDate alloc] init];
  NSCalendar *calendar = [NSCalendar calendarWithIdentifier:NSCalendarIdentifierGregorian];
  
  /*
   Create a date components to represent the number of years to add to the current date.
   In this case, we add -1 to subtract one year.
   */
  
  NSDateComponents *addComponents = [[NSDateComponents alloc] init];
  addComponents.year = - numberOfYears;
  
  return [calendar dateByAddingComponents:addComponents toDate:today options:0];
}

@end
