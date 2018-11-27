/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import <CodePush/CodePush.h>

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTLinkingManager.h>
#import <React/RCTPushNotificationManager.h>
#import <React/RCTLog.h>
#import "ReactNativeExceptionHandler.h"
#import "Intercom/intercom.h"
@import iCloudDocumentSync;
@import HockeySDK;

@interface AppDelegate ()

@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{

  // Intercom
  [Intercom setApiKey:@"ios_sdk-73c4808d20211944196736d561a405f6ffcdaded" forAppId:@"ejkeunzw"];

  NSURL *jsCodeLocation;
    #ifdef DEBUG
        jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
    #else
        jsCodeLocation = [CodePush bundleURL];
    #endif

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"BitmarkHealthPlus"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  
#ifndef DEBUG
  NSString *hockeyAppID = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"HockeyAppID"];
  if (hockeyAppID.length > 0) {
    [[BITHockeyManager sharedHockeyManager] configureWithIdentifier:hockeyAppID];
    [[BITHockeyManager sharedHockeyManager].crashManager setCrashManagerStatus: BITCrashManagerStatusAutoSend];
    [[BITHockeyManager sharedHockeyManager] startManager];
    [[BITHockeyManager sharedHockeyManager].authenticator authenticateInstallation];
  }
#endif
#ifdef HOCKEYAPP_UPDATE
  [[BITHockeyManager sharedHockeyManager].updateManager setUpdateSetting:BITUpdateCheckStartup];
#endif

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  // iCloud sync
  [[iCloud sharedCloud] setupiCloudDocumentSyncWithUbiquityContainer:nil];
  if ([[iCloud sharedCloud] checkCloudAvailability]) {
    RCTLog(@"iCloud is available on this device");
  }
  else {
    RCTLog(@"iCloud is not available on this device");
  }
  
  // Handle Crash App by native code
  [ReactNativeExceptionHandler replaceNativeExceptionHandlerBlock:^(NSException *exception, NSString *readeableException){
    
    // THIS IS THE IMPORTANT PART
    // By default when an exception is raised we will show an alert box as per our code.
    // But since our buttons wont work because our click handlers wont work.
    // to close the app or to remove the UI lockup on exception.
    // we need to call this method
    // [ReactNativeExceptionHandler releaseExceptionHold]; // to release the lock and let the app crash.
    
    // Hence we set a timer of 1 secs and then call the method releaseExceptionHold to quit the app after
    // 1 secs of showing the popup
    [NSTimer scheduledTimerWithTimeInterval:1.0
                                     target:[ReactNativeExceptionHandler class]
                                   selector:@selector(releaseExceptionHold)
                                   userInfo:nil
                                    repeats:NO];
  }];
  return YES;
}

- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}

// Required to register for notifications
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
{
  [RCTPushNotificationManager didRegisterUserNotificationSettings:notificationSettings];
}
// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [RCTPushNotificationManager didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}
// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  [RCTPushNotificationManager didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}
// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  [RCTPushNotificationManager didFailToRegisterForRemoteNotificationsWithError:error];
}
// Required for the localNotification event.
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
{
  [RCTPushNotificationManager didReceiveLocalNotification:notification];
}

@end
