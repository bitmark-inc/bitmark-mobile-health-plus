//
//  NSString+IdentitiesRemove.m
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 9/29/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import "NSString+IdentitiesRemove.h"

@implementation NSString (IdentitiesRemove)

- (NSString *)removeIdentity {
  NSRange findingRange = [self rangeOfString:@"'s "];
  if (findingRange.location == NSNotFound) {
    findingRange = [self rangeOfString:@"’s "];
  }
  
  if (findingRange.location != NSNotFound) {
    return [self substringFromIndex:(findingRange.location + findingRange.length)];
  }
  
  return self;
}

@end
