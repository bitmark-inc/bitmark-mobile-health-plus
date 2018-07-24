//
//  InternationalDiabeteRenussionTask.m
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 9/11/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import "InternationalDiabeteRenussionTask.h"
#import <React/RCTConvert.h>
#import <ResearchKit/ResearchKit.h>
#import <ResearchKit/ORKCompletionStep.h>
#import "ORKImagePickerStep.h"
#import "StudyHelper.h"
#import "StudyTheme.h"
#import "NSDate+Converting.h"
#import "ORKImagePickerStepResult.h"
#import "PhotoExporting.h"

@interface ActiveTask2SkipStepRule : ORKSkipStepNavigationRule

@end

@implementation ActiveTask2SkipStepRule

- (BOOL)stepShouldSkipWithTaskResult:(ORKTaskResult *)taskResult {
  ORKStepResult *lastStepResult = (ORKStepResult *)taskResult.results.lastObject;
  
  if ([lastStepResult.identifier isEqualToString:@"step-ask-recent-value"]) {
    ORKBooleanQuestionResult *r = (ORKBooleanQuestionResult *)lastStepResult.results.firstObject;
    return ![r.booleanAnswer boolValue];
  }
  
  
  return NO;
}

@end

@interface InternationalDiabeteRenussionTask () <ORKTaskViewControllerDelegate>

@property (nonatomic, copy, nullable) RCTResponseSenderBlock activeTask1Callback;
@property (nonatomic, copy, nullable) RCTResponseSenderBlock activeTask2Callback;
@property (nonatomic, copy, nullable) RCTResponseSenderBlock activeTask3Callback;
@property (nonatomic, copy, nullable) RCTResponseSenderBlock activeTask4Callback;

@end

@implementation InternationalDiabeteRenussionTask

RCT_EXPORT_MODULE();

#pragma mark - Active Task 1 - HBA1c

RCT_EXPORT_METHOD(showActiveTask1:(RCTResponseSenderBlock)callback) {
  self.activeTask1Callback = callback;
  
  ORKInstructionStep *introductionStep = [[ORKInstructionStep alloc] initWithIdentifier:@"step-welcome"];
  introductionStep.title = @"We need to collect your value of blood glucose HbA1c.";
  
  ORKNumericAnswerFormat *HbA1CPercentValueAnswerFormat = [ORKAnswerFormat decimalAnswerFormatWithUnit:@"%"];
  HbA1CPercentValueAnswerFormat.maximum = @16;
  HbA1CPercentValueAnswerFormat.minimum = @3;
  ORKFormItem *HbA1cScaleAItem = [[ORKFormItem alloc] initWithIdentifier:@"formquestion1"
                                                                    text:@"Scale A"
                                                            answerFormat:HbA1CPercentValueAnswerFormat];
  HbA1cScaleAItem.optional = YES;
  
  ORKNumericAnswerFormat *HbA1CMolValueAnswerFormat = [ORKAnswerFormat decimalAnswerFormatWithUnit:@"mmol/mol"];
  HbA1CMolValueAnswerFormat.maximum = @100;
  HbA1CMolValueAnswerFormat.minimum = @10;
  ORKFormItem *HbA1cScaleBItem = [[ORKFormItem alloc] initWithIdentifier:@"formquestion2"
                                                                    text:@"Scale B"
                                                            answerFormat:HbA1CMolValueAnswerFormat];
  HbA1cScaleBItem.optional = YES;
  
  ORKFormStep *latestHbA1cFormStep = [[ORKFormStep alloc] initWithIdentifier:@"step-latestHbA1cValue"];
  latestHbA1cFormStep.title = @"What's your latest value of  HbA1c (glycosylated hemoglobin)?";
  latestHbA1cFormStep.text = @"Please only choose one scale to fill in.";
  latestHbA1cFormStep.formItems = @[HbA1cScaleAItem,
                                    HbA1cScaleBItem];
  latestHbA1cFormStep.optional = NO;
  
  ORKQuestionStep *dateMeasurementStep = [ORKQuestionStep questionStepWithIdentifier:@"step-latestHbA1cDate"
                                                                               title:@"Date of Measurement"
                                                                              answer:[ORKDateAnswerFormat dateAnswerFormatWithDefaultDate:nil
                                                                                                                              minimumDate:nil
                                                                                                                              maximumDate:[NSDate date]
                                                                                                                                 calendar:nil]];
  dateMeasurementStep.optional = NO;
  
  ORKCompletionStep *completionStep = [[ORKCompletionStep alloc] initWithIdentifier:@"step-completion"];
  completionStep.detailText = @"Thank you!\nYour glucose HbA1c task is complete!";
  
  // Create task
  ORKOrderedTask *task = [[ORKOrderedTask alloc] initWithIdentifier:@"active-task-1" steps:@[introductionStep,
                                                                                              latestHbA1cFormStep,
                                                                                              dateMeasurementStep,
                                                                                              completionStep]];
  
  __weak InternationalDiabeteRenussionTask<ORKTaskViewControllerDelegate> *wSelf = self;
  dispatch_async(dispatch_get_main_queue(), ^{
    ORKTaskViewController *taskViewController = [[ORKTaskViewController alloc] initWithTask:task taskRunUUID:nil];
    taskViewController.delegate = wSelf;
    [StudyTheme applyThemeAndPresentTaskViewController:taskViewController];
  });
}

#pragma mark - Active Task 2 - HBA1c

RCT_EXPORT_METHOD(showActiveTask2:(NSDictionary *)input:(RCTResponseSenderBlock)callback) {
  self.activeTask2Callback = callback;
  
  NSString *latestValue = [RCTConvert NSString:input[@"latest_value"][@"value"]];
  NSString *latestDate = [RCTConvert NSString:input[@"latest_value"][@"date"]];
  
  ORKInstructionStep *introductionStep = [[ORKInstructionStep alloc] initWithIdentifier:@"step-welcome"];
  introductionStep.title = @"It’s time to update your values of blood glucose HbA1c!";
  
  ORKQuestionStep *updateLatestValueStep = [ORKQuestionStep questionStepWithIdentifier:@"step-ask-recent-value"
                                                                                 title:[NSString stringWithFormat:@"Your last value of glycosylated hemoglobin (HbA1c) was %@ on %@. Do you have a more recent value?", latestValue, latestDate]
                                                                                answer:[ORKAnswerFormat booleanAnswerFormat]];
  updateLatestValueStep.optional = NO;
  
  ORKNumericAnswerFormat *HbA1CPercentValueAnswerFormat = [ORKAnswerFormat decimalAnswerFormatWithUnit:@"%"];
  HbA1CPercentValueAnswerFormat.maximum = @16;
  HbA1CPercentValueAnswerFormat.minimum = @3;
  ORKFormItem *HbA1cScaleAItem = [[ORKFormItem alloc] initWithIdentifier:@"formquestion1"
                                                                    text:@"Scale A"
                                                            answerFormat:HbA1CPercentValueAnswerFormat];
  HbA1cScaleAItem.optional = YES;
  
  ORKNumericAnswerFormat *HbA1CMolValueAnswerFormat = [ORKAnswerFormat decimalAnswerFormatWithUnit:@"mmol/mol"];
  HbA1CMolValueAnswerFormat.maximum = @100;
  HbA1CMolValueAnswerFormat.minimum = @10;
  ORKFormItem *HbA1cScaleBItem = [[ORKFormItem alloc] initWithIdentifier:@"formquestion2"
                                                                    text:@"Scale B"
                                                            answerFormat:HbA1CMolValueAnswerFormat];
  HbA1cScaleAItem.optional = YES;
  
  ORKFormStep *latestHbA1cFormStep = [[ORKFormStep alloc] initWithIdentifier:@"step-latestHbA1cValue"];
  latestHbA1cFormStep.title = @"What's your latest value of  HbA1c (glycosylated hemoglobin)?";
  latestHbA1cFormStep.text = @"Please only choose one scale to fill in.";
  latestHbA1cFormStep.formItems = @[HbA1cScaleAItem,
                                    HbA1cScaleBItem];
  latestHbA1cFormStep.optional = NO;
  
  ORKQuestionStep *dateMeasurementStep = [ORKQuestionStep questionStepWithIdentifier:@"step-latestHbA1cDate"
                                                                               title:@"Date of Measurement"
                                                                              answer:[ORKDateAnswerFormat dateAnswerFormatWithDefaultDate:nil
                                                                                                                              minimumDate:nil
                                                                                                                              maximumDate:[NSDate date]
                                                                                                                                 calendar:nil]];
  dateMeasurementStep.optional = NO;
  
  ORKCompletionStep *completionStep = [[ORKCompletionStep alloc] initWithIdentifier:@"step-completion"];
  completionStep.detailText = @"Thank you!\nYour glucose HbA1c task is complete!";
  
  // Create task
  ORKNavigableOrderedTask *task = [[ORKNavigableOrderedTask alloc] initWithIdentifier:@"active-task-2"
                                                                                steps:@[introductionStep,
                                                                                        updateLatestValueStep,
                                                                                        latestHbA1cFormStep,
                                                                                        dateMeasurementStep,
                                                                                        completionStep]];
  ActiveTask2SkipStepRule *skipStep3NavigationRule = [ActiveTask2SkipStepRule new];
  task.shouldReportProgress = YES;
  [task setSkipNavigationRule:skipStep3NavigationRule forStepIdentifier:@"step-latestHbA1cValue"];
  [task setSkipNavigationRule:skipStep3NavigationRule forStepIdentifier:@"step-latestHbA1cDate"];
  
  __weak InternationalDiabeteRenussionTask<ORKTaskViewControllerDelegate> *wSelf = self;
  dispatch_async(dispatch_get_main_queue(), ^{
    ORKTaskViewController *taskViewController = [[ORKTaskViewController alloc] initWithTask:task taskRunUUID:nil];
    taskViewController.delegate = wSelf;
    [StudyTheme applyThemeAndPresentTaskViewController:taskViewController];
  });
}

#pragma mark - Active Task 3

RCT_EXPORT_METHOD(showActiveTask3:(RCTResponseSenderBlock)callback) {
  self.activeTask3Callback = callback;
  
  ORKInstructionStep *introductionPage1Step = [[ORKInstructionStep alloc] initWithIdentifier:@"step-dietary-mission"];
  introductionPage1Step.title = @"Dietary practice mission";
  introductionPage1Step.detailText = @"Help us understand your dietary practices. Show us the places where you buy, store, prepare, cook, and eat your foods.";
  
  ORKInstructionStep *introductionPage2Step = [[ORKInstructionStep alloc] initWithIdentifier:@"step-when"];
  introductionPage2Step.title = @"When";
  introductionPage2Step.detailText = @"Starting tomorrow morning";
  
  ORKInstructionStep *introductionPage3Step = [[ORKInstructionStep alloc] initWithIdentifier:@"step-what"];
  introductionPage3Step.title = @"What";
  introductionPage3Step.detailText = @"Show us each context where you obtain, store, prepare, and eat your food. We are also interested in the tools you use to prepare and eat your foods. For example, show us where you buy your bread on Saturday mornings, the fridge where you store your foods, the table at your home, and the kitchen tools, dishes, and cups that you use to eat your meals. The purpose of this is to get to know your dietary practices and understand how you stick to them. Ideally, ask someone to take the pictures while you are cooking or eating your meals.";
  
  ORKInstructionStep *introductionPage4Step = [[ORKInstructionStep alloc] initWithIdentifier:@"step-how"];
  introductionPage4Step.title = @"How";
  introductionPage4Step.detailText = @"Create one entry per meal (i.e. breakfast, lunch, dinner). Start taking pictures as you obtain your foods or get them from your pantry or fridge. Continue as you prepare, cook, serve and eat them. You can have multiple photos or short videos showing us how you do it.";
  
  // Create task
  ORKOrderedTask *task = [[ORKOrderedTask alloc] initWithIdentifier:@"active-task-3"
                                                              steps:@[introductionPage1Step,
                                                                      introductionPage2Step,
                                                                      introductionPage3Step,
                                                                      introductionPage4Step]];
  
  __weak InternationalDiabeteRenussionTask<ORKTaskViewControllerDelegate> *wSelf = self;
  dispatch_async(dispatch_get_main_queue(), ^{
    
    
    ORKTaskViewController *taskViewController = [[ORKTaskViewController alloc] initWithTask:task taskRunUUID:nil];
    taskViewController.delegate = wSelf;
    [StudyTheme applyThemeAndPresentTaskViewController:taskViewController];
  });
}


#pragma mark - Active Task 4

RCT_EXPORT_METHOD(showActiveTask4:(RCTResponseSenderBlock)callback) {
  self.activeTask4Callback = callback;
  
  ORKInstructionStep *introductionStep = [[ORKInstructionStep alloc] initWithIdentifier:@"step-introduction"];
  introductionStep.title = @"It’s time to upload pictures of your meals from the past day.";
  
  ORKImagePickerStep *mealImageCaptureStep = [[ORKImagePickerStep alloc] initWithIdentifier:@"step-meal-image"];
  mealImageCaptureStep.title = @"Meal images";
  mealImageCaptureStep.text = @"Please choose up to 10.";
  mealImageCaptureStep.buttonImage = [UIImage imageNamed:@"camera-icon"];
  mealImageCaptureStep.selectImageMessage = @"Select your meal picture";
  mealImageCaptureStep.optional = NO;
  
  ORKQuestionStep *mealTextQuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-meal-text"
                                                                                     title:@"Explanation"
                                                                                    answer:[ORKAnswerFormat textAnswerFormat]];
  mealTextQuestionStep.text = @"In a few sentences, please explain your meal choices.";
  mealTextQuestionStep.optional = NO;
  
  ORKCompletionStep *completionStep = [[ORKCompletionStep alloc] initWithIdentifier:@"step-completion"];
  completionStep.detailText = @"You have completed your Dietary Practice Mission. Thanks!";
  
  // Create task
  ORKOrderedTask *task = [[ORKOrderedTask alloc] initWithIdentifier:@"active-task-4"
                                                              steps:@[introductionStep,
                                                                      mealImageCaptureStep,
                                                                      mealTextQuestionStep,
                                                                      completionStep]];
  
  __weak InternationalDiabeteRenussionTask<ORKTaskViewControllerDelegate> *wSelf = self;
  dispatch_async(dispatch_get_main_queue(), ^{
    ORKTaskViewController *taskViewController = [[ORKTaskViewController alloc] initWithTask:task taskRunUUID:nil];
    taskViewController.delegate = wSelf;
    [StudyTheme applyThemeAndPresentTaskViewController:taskViewController];
  });
}

#pragma mark - ResearchKit callback

- (void)taskViewController:(ORKTaskViewController *)taskViewController didFinishWithReason:(ORKTaskViewControllerFinishReason)reason error:(nullable NSError *)error {
  [taskViewController dismissViewControllerAnimated:YES completion:^{
  }];
  
  if (reason == ORKTaskViewControllerFinishReasonDiscarded) {
    if (self.activeTask1Callback != nil) {
      self.activeTask1Callback(@[@NO]);
      self.activeTask1Callback = nil;
    }
    
    if (self.activeTask2Callback != nil) {
      self.activeTask2Callback(@[@NO]);
      self.activeTask2Callback = nil;
    }
    
    if (self.activeTask3Callback != nil) {
      self.activeTask3Callback(@[@NO]);
      self.activeTask3Callback = nil;
    }
    
    if (self.activeTask4Callback != nil) {
      self.activeTask4Callback(@[@NO]);
      self.activeTask4Callback = nil;
    }
    
    return;
  }
  
  
  if ([taskViewController.task.identifier isEqualToString:@"active-task-1"]) {
    NSArray *callbackResults = [StudyHelper iterateTaskResult:taskViewController.result withDataIteratingBlock:^NSObject *(ORKStepResult *stepResult) {
      if ([stepResult.identifier isEqualToString:@"step-latestHbA1cValue"]) {
        NSMutableDictionary *data = [NSMutableDictionary dictionary];
        for (ORKNumericQuestionResult *result in stepResult.results) {
          [data setValue:result.numericAnswer forKey:result.identifier];
        }
        return data;
      }
      
      else if ([stepResult.identifier isEqualToString:@"step-latestHbA1cDate"]) {
        ORKDateQuestionResult *result = (ORKDateQuestionResult *)stepResult.results[0];
        return [result.dateAnswer iso8601String];
      }
      
      return nil;
    }];
    
    self.activeTask1Callback(callbackResults);
    self.activeTask1Callback = nil;
  }
  
  else if ([taskViewController.task.identifier isEqualToString:@"active-task-2"]) {
    NSArray *callbackResults = [StudyHelper iterateTaskResult:taskViewController.result withDataIteratingBlock:^NSObject *(ORKStepResult *stepResult) {
      if ([stepResult.identifier isEqualToString:@"step-latestHbA1cValue"]) {
        NSMutableDictionary *data = [NSMutableDictionary dictionary];
        for (ORKNumericQuestionResult *result in stepResult.results) {
          [data setValue:result.numericAnswer forKey:result.identifier];
        }
        return data;
      }
      
      else if ([stepResult.identifier isEqualToString:@"step-latestHbA1cDate"]) {
        ORKDateQuestionResult *result = (ORKDateQuestionResult *)stepResult.results[0];
        return [result.dateAnswer iso8601String];
      }
      
      else if ([stepResult.identifier isEqualToString:@"step-ask-recent-value"]) {
        ORKBooleanQuestionResult *result = (ORKBooleanQuestionResult *)stepResult.results[0];
        return result.booleanAnswer;
      }
      
      return nil;
    }];
    
    self.activeTask2Callback(callbackResults);
    self.activeTask2Callback = nil;
  }
  
  else if ([taskViewController.task.identifier isEqualToString:@"active-task-3"]) {
    self.activeTask3Callback(@[@YES]);
    self.activeTask3Callback = nil;
  }
  
  else if ([taskViewController.task.identifier isEqualToString:@"active-task-4"]) {
    NSMutableDictionary *callbackResults = [NSMutableDictionary dictionary];
    
    ORKStepResult *step3Result = (ORKStepResult *)taskViewController.result.results[2];
    ORKTextQuestionResult *mealTextQuestionResult = (ORKTextQuestionResult *)step3Result.results.firstObject;
    [callbackResults setValue:mealTextQuestionResult.textAnswer forKey:mealTextQuestionResult.identifier];
    
    ORKStepResult *step2Result = (ORKStepResult *)taskViewController.result.results[1];
    ORKImagePickerStepResult *imagePickerStepResult = (ORKImagePickerStepResult *)step2Result.results.firstObject;
    
    NSString *randomFolderName = [NSUUID UUID].UUIDString;
    NSString *tmpDirectory = NSTemporaryDirectory();
    NSString *taskOutputDirectory = [tmpDirectory stringByAppendingPathComponent:randomFolderName];
    [[NSFileManager defaultManager] createDirectoryAtPath:taskOutputDirectory withIntermediateDirectories:NO attributes:nil error:nil];
    
    __weak InternationalDiabeteRenussionTask *wSelf = self;
    [PhotoExporting exportAssets:imagePickerStepResult.assets toFolder:taskOutputDirectory completionHandler:^(NSArray<NSString *> *results) {
      [callbackResults setValue:results forKey:imagePickerStepResult.identifier];
      wSelf.activeTask4Callback(@[@YES, callbackResults]);
      wSelf.activeTask4Callback = nil;
    }];
  }
}

@end
