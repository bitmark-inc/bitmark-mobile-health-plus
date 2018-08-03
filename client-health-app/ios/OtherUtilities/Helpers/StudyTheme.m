//
//  StudyTheme.m
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 8/1/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import "StudyTheme.h"
#import <UIKit/UIKit.h>

#define kTitleBackgroundColor [UIColor whiteColor]
#define kTitleTextColor [UIColor colorWithRed:1/255.0 green:58/255.0 blue:113/255.0 alpha:1]

@implementation StudyTheme

+ (void)applyThemeAndPresentTaskViewController:(ORKTaskViewController *)viewController {
  viewController.navigationBar.barTintColor = kTitleBackgroundColor;
  viewController.navigationBar.tintColor = kTitleTextColor;
  viewController.navigationBar.titleTextAttributes = @{NSForegroundColorAttributeName: kTitleTextColor,
                                                       NSFontAttributeName: [UIFont fontWithName:@"Avenir-Black" size:15]};
  
  UIViewController *rootViewController = [[[UIApplication sharedApplication] keyWindow] rootViewController];
  [rootViewController presentViewController:viewController animated:YES completion:^{
  }];
}

@end
