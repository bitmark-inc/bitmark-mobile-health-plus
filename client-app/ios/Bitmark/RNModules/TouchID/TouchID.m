//
//  TouchID.m
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 8/2/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import "TouchID.h"
#import <React/RCTUtils.h>
#import <LocalAuthentication/LocalAuthentication.h>

@implementation TouchID

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(isSupported: (RCTResponseSenderBlock)callback)
{
  LAContext *context = [[LAContext alloc] init];
  NSError *error;
  
  if ([context canEvaluatePolicy:LAPolicyDeviceOwnerAuthentication error:&error]) {
    callback(@[@YES]);
    // Device does not support TouchID
  } else {
    callback(@[@NO]);
    return;
  }
}

RCT_EXPORT_METHOD(authenticate: (NSString *)reason
                  callback: (RCTResponseSenderBlock)callback)
{
  LAContext *context = [[LAContext alloc] init];
  NSError *error;
  
  // Device has TouchID
  if ([context canEvaluatePolicy:LAPolicyDeviceOwnerAuthentication error:&error]) {
    // Attempt Authentification
    [context evaluatePolicy:LAPolicyDeviceOwnerAuthentication
            localizedReason:reason
                      reply:^(BOOL success, NSError *error)
     {
       // Failed Authentication
       if (error) {
         NSString *errorReason;
         
         switch (error.code) {
           case LAErrorAuthenticationFailed:
             errorReason = @"LAErrorAuthenticationFailed";
             break;
             
           case LAErrorUserCancel:
             errorReason = @"LAErrorUserCancel";
             break;
             
           case LAErrorUserFallback:
             errorReason = @"LAErrorUserFallback";
             break;
             
           case LAErrorSystemCancel:
             errorReason = @"LAErrorSystemCancel";
             break;
             
           case LAErrorPasscodeNotSet:
             errorReason = @"LAErrorPasscodeNotSet";
             break;
             
           case LAErrorTouchIDNotAvailable:
             errorReason = @"LAErrorTouchIDNotAvailable";
             break;
             
           case LAErrorTouchIDNotEnrolled:
             errorReason = @"LAErrorTouchIDNotEnrolled";
             break;
             
           default:
             errorReason = @"RCTTouchIDUnknownError";
             break;
         }
         
         NSLog(@"Authentication failed: %@", errorReason);
         callback(@[@NO, RCTMakeError(errorReason, nil, nil)]);
         return;
       }
       
       // Authenticated Successfully
       callback(@[@YES]);
     }];
    
    // Device does not support TouchID
  } else {
    callback(@[@NO]);
    return;
  }
}



@end
