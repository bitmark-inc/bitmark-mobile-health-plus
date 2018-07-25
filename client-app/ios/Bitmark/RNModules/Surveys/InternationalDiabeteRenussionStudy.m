//
//  InternationalDiabeteRenussionStudy.m
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 8/29/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import "InternationalDiabeteRenussionStudy.h"
#import <React/RCTConvert.h>
#import <UIKit/UIKit.h>
#import <React/RCTLog.h>
#import <ResearchKit/ResearchKit.h>
#import "StudyHelper.h"
#import "StudyTheme.h"
#import "NSDate+Converting.h"
#import "NSDate+Computing.h"
#import "LocaleUnit.h"

@interface IntakeStep7SkipRule : ORKSkipStepNavigationRule

@end

@implementation IntakeStep7SkipRule

- (BOOL)stepShouldSkipWithTaskResult:(ORKTaskResult *)taskResult {
  ORKStepResult *lastStepResult = (ORKStepResult *)taskResult.results.lastObject;
  
  if ([lastStepResult.identifier isEqualToString:@"step-6"]) {
    ORKChoiceQuestionResult *r = (ORKChoiceQuestionResult *)lastStepResult.results.firstObject;
    if (![(NSString *)r.choiceAnswers.firstObject isEqualToString:@"opt-5"]) {
      return YES;
    }
  }

  
  return NO;
}

@end

@interface IntakeStep6SkipRule : ORKStepNavigationRule

@end

@implementation IntakeStep6SkipRule

- (NSString *)identifierForDestinationStepWithTaskResult:(ORKTaskResult *)taskResult {
  ORKStepResult *lastStepResult = (ORKStepResult *)taskResult.results.lastObject;
  
  if ([lastStepResult.identifier isEqualToString:@"step-5"]) {
    ORKChoiceQuestionResult *r = (ORKChoiceQuestionResult *)lastStepResult.results.firstObject;
    if ([(NSString *)r.choiceAnswers.firstObject isEqualToString:@"opt-2"]) {
      return @"step-8";
    }
  }
  
  return @"step-6";
}

@end

@interface InternationalDiabeteRenussionStudy () <ORKTaskViewControllerDelegate>

@property (nonatomic, copy, nullable) RCTResponseSenderBlock selectionSurveyCallback;
@property (nonatomic, copy, nullable) RCTResponseSenderBlock intakeSurveyCallback;
@property (nonatomic, copy, nullable) RCTResponseSenderBlock consentCallback;

@end

@implementation InternationalDiabeteRenussionStudy

RCT_EXPORT_MODULE();

#pragma mark - Eligibility Survey
RCT_EXPORT_METHOD(showSelectionSurvey:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"Begin signup flow");
  self.selectionSurveyCallback = callback;
  
  ORKInstructionStep *introductionStep = [[ORKInstructionStep alloc] initWithIdentifier:@"step-0"];
  introductionStep.title = @"Eligibility Survey";
  introductionStep.detailText = @"We need to ask you a few short questions to help us understand if you fit into the study’s demographics. It will only take ~2 mins.";
  
#pragma mark Step 1 - M3.1
  ORKBooleanAnswerFormat *defaultBooleanAnswerFormat = [ORKBooleanAnswerFormat booleanAnswerFormat];
  
  ORKFormItem *step1FormItem1 = [[ORKFormItem alloc] initWithIdentifier:@"formquestion1"
                                                                   text:@"Do you speak English? (the study is only available in English)"
                                                           answerFormat:defaultBooleanAnswerFormat];
  step1FormItem1.optional = NO;
  ORKFormItem *step1FormItem2 = [[ORKFormItem alloc] initWithIdentifier:@"formquestion2"
                                                                   text:@"Are you willing to use your camera app to take photos and videos for the study?"
                                                           answerFormat:defaultBooleanAnswerFormat];
  step1FormItem2.optional = NO;
  ORKFormItem *step1FormItem3 = [[ORKFormItem alloc] initWithIdentifier:@"formquestion3"
                                                                   text:@"Are you 18 years or older?"
                                                           answerFormat:defaultBooleanAnswerFormat];
  step1FormItem3.optional = NO;
  ORKFormItem *step1FormItem4 = [[ORKFormItem alloc] initWithIdentifier:@"formquestion4"
                                                                   text:@"Are you currently a UC Berkeley student?"
                                                           answerFormat:defaultBooleanAnswerFormat];
  
  ORKFormStep *step1FormStep = [[ORKFormStep alloc] initWithIdentifier:@"step-1"];
  step1FormStep.formItems = @[step1FormItem1,
                              step1FormItem2,
                              step1FormItem3,
                              step1FormItem4];
  step1FormStep.optional = NO;
  
  ORKOrderedTask *task = [[ORKOrderedTask alloc] initWithIdentifier:@"signup-flow" steps:@[introductionStep,
                                                                                           step1FormStep]];
  
  __weak InternationalDiabeteRenussionStudy *wSelf = self;
  dispatch_async(dispatch_get_main_queue(), ^{
    ORKTaskViewController *taskViewController = [[ORKTaskViewController alloc] initWithTask:task taskRunUUID:nil];
    taskViewController.delegate = wSelf;
    [StudyTheme applyThemeAndPresentTaskViewController:taskViewController];
  });
}

#pragma mark - Consent survey
RCT_EXPORT_METHOD(showConsentSurvey:(NSDictionary *)input:(RCTResponseSenderBlock)callback) {
  
  self.consentCallback = callback;
  
  NSString *consentHTMLContent = [RCTConvert NSString:input[@"consent_html"]];
  
#pragma mark Step 0 - M4
  
  ORKConsentDocument *consentDocument = [self consentDocumentWithHTMLContent:consentHTMLContent];
  
  ORKVisualConsentStep *step0ConsentStep = [[ORKVisualConsentStep alloc] initWithIdentifier:@"step-consent" document:consentDocument];
  
#pragma mark Step 1 - 4.6 toward
  
  ORKConsentReviewStep *reviewStep = [[ORKConsentReviewStep alloc] initWithIdentifier:@"consent-review"
                                                                            signature:consentDocument.signatures[0]
                                                                           inDocument:consentDocument];
  reviewStep.text = @"Review";
  reviewStep.reasonForConsent = @"By pressing \"Agree\", you are acknowledging that you have read the informed consent and agree to participate in this study.";
  
  // Create task
  ORKOrderedTask *task = [[ORKOrderedTask alloc] initWithIdentifier:@"consent-survey" steps:@[step0ConsentStep,
                                                                                              reviewStep]];
  
  __weak InternationalDiabeteRenussionStudy *wSelf = self;
  dispatch_async(dispatch_get_main_queue(), ^{
    ORKTaskViewController *taskViewController = [[ORKTaskViewController alloc] initWithTask:task taskRunUUID:nil];
    taskViewController.delegate = wSelf;
    [StudyTheme applyThemeAndPresentTaskViewController:taskViewController];
  });
}

#pragma mark - Intake survey
RCT_EXPORT_METHOD(showIntakeSurvey:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"Begin showing study");
  
  self.intakeSurveyCallback = callback;
  
  ORKInstructionStep *introductionStep = [[ORKInstructionStep alloc] initWithIdentifier:@"step-0"];
  introductionStep.title = @"Intake Survey";
  introductionStep.detailText = @"Let's get some basic information about you!";
  
//#pragma mark Step 2 - M5.1
//  ORKTextChoice *step1Option1TextChoice = [ORKTextChoice choiceWithText:@"English" value:@"opt-1"];
//  ORKTextChoice *step1Option2TextChoice = [ORKTextChoice choiceWithText:@"Spanish (coming soon...)" value:@"opt-2"];
//
//  ORKAnswerFormat *step1AnswerFormat = [ORKAnswerFormat choiceAnswerFormatWithStyle:ORKChoiceAnswerStyleSingleChoice textChoices:@[step1Option1TextChoice,
//                                                                                                                                   step1Option2TextChoice]];
//
//  ORKQuestionStep *step1QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-1" title:@"What is the language you would like to use for the app?" answer:step1AnswerFormat];
//  step1QuestionStep.optional = NO;
  
#pragma mark Step 1 - M5
  ORKTextChoice *step1Option1TextChoice = [ORKTextChoice choiceWithText:@"Female" value:@"opt-1"];
  ORKTextChoice *step1Option2TextChoice = [ORKTextChoice choiceWithText:@"Male" value:@"opt-2"];
  
  ORKAnswerFormat *step1AnswerFormat = [ORKAnswerFormat choiceAnswerFormatWithStyle:ORKChoiceAnswerStyleSingleChoice
                                                                        textChoices:@[step1Option1TextChoice,
                                                                                      step1Option2TextChoice]];
  
  ORKQuestionStep *step1QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-1" title:@"What is your biological gender?" answer:step1AnswerFormat];
  step1QuestionStep.optional = NO;
  
  ORKAnswerFormat *step2AnswerFormat = [[ORKDateAnswerFormat alloc] initWithStyle:ORKDateAnswerStyleDate
                                                                      defaultDate:[[NSDate date] dateForNumberOfYearsAgo:18]
                                                                      minimumDate:nil
                                                                      maximumDate:[[NSDate date] dateForNumberOfYearsAgo:18]
                                                                         calendar:nil];
  
  ORKQuestionStep *step2QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-2" title:@"What is your date of birth?" answer:step2AnswerFormat];
  step2QuestionStep.optional = NO;
  
  NSUnit *heightUnit = [LocaleUnit heightUnit];
  ORKNumericAnswerFormat *step3AnswerFormat = [[ORKNumericAnswerFormat alloc] initWithStyle:ORKNumericAnswerStyleDecimal unit:heightUnit.symbol];
  if (heightUnit == [NSUnitLength centimeters]) {
    step3AnswerFormat.minimum = @130;
    step3AnswerFormat.maximum = @260;
  } else {
    step3AnswerFormat.minimum = @4;
    step3AnswerFormat.maximum = @9;
  }

  ORKQuestionStep *step3QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-3" title:@"What is your height?" answer:step3AnswerFormat];
  step3QuestionStep.optional = NO;
  
  NSUnit *weightUnit = [LocaleUnit mediumMassUnit];
  ORKNumericAnswerFormat *step4AnswerFormat = [[ORKNumericAnswerFormat alloc] initWithStyle:ORKNumericAnswerStyleDecimal unit:[LocaleUnit mediumMassUnit].symbol];
  if (weightUnit == [NSUnitMass kilograms]) {
    step4AnswerFormat.minimum = @40;
    step4AnswerFormat.maximum = @300;
  } else {
    step4AnswerFormat.minimum = @88;
    step4AnswerFormat.maximum = @661;
  }
  ORKQuestionStep *step4QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-4" title:@"What is your current weight?" answer:step4AnswerFormat];
  step4QuestionStep.optional = NO;
  
  
  ORKTextChoice *step5Option1TextChoice = [ORKTextChoice choiceWithText:@"Yes" value:@"opt-1"];
  ORKTextChoice *step5Option2TextChoice = [ORKTextChoice choiceWithText:@"No" value:@"opt-2"];
  ORKAnswerFormat *step5AnswerFormat = [ORKAnswerFormat choiceAnswerFormatWithStyle:ORKChoiceAnswerStyleSingleChoice
                                                                        textChoices:@[step5Option1TextChoice,
                                                                                      step5Option2TextChoice]];
  ORKQuestionStep *step5QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-5"
                                                                             title:@"Have you been tested for high insulin, high glucose or diabetes?"
                                                                            answer:step5AnswerFormat];
  
#pragma mark Step 3 - M5.2
  ORKTextChoice *step6Option1TextChoice = [ORKTextChoice choiceWithText:@"None" value:@"opt-1"];
  ORKTextChoice *step6Option2TextChoice = [ORKTextChoice choiceWithText:@"Prediabetes" value:@"opt-2"];
  ORKTextChoice *step6Option3TextChoice = [ORKTextChoice choiceWithText:@"Diabetes type 1" value:@"opt-3"];
  ORKTextChoice *step6Option4TextChoice = [ORKTextChoice choiceWithText:@"Diabetes type 2" value:@"opt-4"];
  ORKTextChoice *step6Option5TextChoice = [ORKTextChoice choiceWithText:@"Other type of diabetes" value:@"opt-5"];
  
  ORKAnswerFormat *step6AnswerFormat = [ORKAnswerFormat choiceAnswerFormatWithStyle:ORKChoiceAnswerStyleSingleChoice
                                                                        textChoices:@[step6Option1TextChoice,
                                                                                      step6Option2TextChoice,
                                                                                      step6Option3TextChoice,
                                                                                      step6Option4TextChoice,
                                                                                      step6Option5TextChoice]];
  
  ORKQuestionStep *step6QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-6" title:@"What was the result of the diabetes test?" answer:step6AnswerFormat];
  
  ORKQuestionStep *step7QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-7"
                                                                             title:@"What type of diabetes have you been diagnosed?"
                                                                            answer:[ORKAnswerFormat textAnswerFormat]];
  
  
//  ORKFormItem *step9FormItem1 = [[ORKFormItem alloc] initWithIdentifier:@"formquestion1"
//                                                                   text:@"Value"
//                                                           answerFormat:[ORKAnswerFormat integerAnswerFormatWithUnit:@"%"]];
//  ORKFormItem *step9FormItem2 = [[ORKFormItem alloc] initWithIdentifier:@"formquestion2"
//                                                                   text:@"Date of test value"
//                                                           answerFormat:[ORKAnswerFormat dateAnswerFormat]];
//  
//  ORKFormStep *step9FormStep = [[ORKFormStep alloc] initWithIdentifier:@"step-9"];
//  step9FormStep.title = @"What's your latest value of glycosylated hemoglobin (HbA1c)?";
//  step9FormStep.formItems = @[step9FormItem1,
//                              step9FormItem2];
  
#pragma mark Step 3 - M5.3
  ORKTextChoice *step8Option1TextChoice = [ORKTextChoice choiceWithText:@"Regular 8 hours" value:@"opt-1"];
  ORKTextChoice *step8Option2TextChoice = [ORKTextChoice choiceWithText:@"Regular non 8 hours" value:@"opt-2"];
  ORKTextChoice *step8Option3TextChoice = [ORKTextChoice choiceWithText:@"Morning" value:@"opt-3"];
  ORKTextChoice *step8Option4TextChoice = [ORKTextChoice choiceWithText:@"Midday" value:@"opt-4"];
  ORKTextChoice *step8Option5TextChoice = [ORKTextChoice choiceWithText:@"Evening" value:@"opt-5"];
  ORKTextChoice *step8Option6TextChoice = [ORKTextChoice choiceWithText:@"Night" value:@"opt-6"];
  ORKTextChoice *step8Option7TextChoice = [ORKTextChoice choiceWithText:@"Mixed shift" value:@"opt-7"];
  
  ORKAnswerFormat *step8AnswerFormat = [ORKAnswerFormat choiceAnswerFormatWithStyle:ORKChoiceAnswerStyleMultipleChoice
                                                                         textChoices:@[step8Option1TextChoice,
                                                                                       step8Option2TextChoice,
                                                                                       step8Option3TextChoice,
                                                                                       step8Option4TextChoice,
                                                                                       step8Option5TextChoice,
                                                                                       step8Option6TextChoice,
                                                                                       step8Option7TextChoice]];
  
  ORKQuestionStep *step8QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-8"
                                                                             title:@"What are your working hours?\nPlease select all that applies to you."
                                                                            answer:step8AnswerFormat];
  
  NSDateComponents *defaultTime = [NSDateComponents new];
  defaultTime.hour = 0;
  ORKTimeOfDayAnswerFormat *timeOfDayAnswerFormat = [ORKTimeOfDayAnswerFormat timeOfDayAnswerFormatWithDefaultComponents:defaultTime];
  
  ORKQuestionStep *step9QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-9"
                                                                              title:@"Please tell us at what time you usually wake up?"
                                                                             answer:timeOfDayAnswerFormat];
  
  ORKQuestionStep *step10QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-10"
                                                                              title:@"Please tell us at what time you usually go to sleep?"
                                                                             answer:timeOfDayAnswerFormat];
  
  ORKQuestionStep *step11QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-11"
                                                                              title:@"Please tell us at what time you usually have breakfast or first beverage with caloric content?"
                                                                             answer:timeOfDayAnswerFormat];
  
  ORKQuestionStep *step12QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-12"
                                                                              title:@"Please tell us at what time you usually have your last meal of the day?"
                                                                             answer:timeOfDayAnswerFormat];
  
  // Create task
  ORKNavigableOrderedTask *task = [[ORKNavigableOrderedTask alloc] initWithIdentifier:@"intake-survey" steps:@[introductionStep,
                                                                                                               step1QuestionStep,
                                                                                                               step2QuestionStep,
                                                                                                               step3QuestionStep,
                                                                                                               step4QuestionStep,
                                                                                                               step5QuestionStep,
                                                                                                               step6QuestionStep,
                                                                                                               step7QuestionStep,
                                                                                                               step8QuestionStep,
                                                                                                               step9QuestionStep,
                                                                                                               step10QuestionStep,
                                                                                                               step11QuestionStep,
                                                                                                               step12QuestionStep]];

  IntakeStep7SkipRule *skipStep7NavigationRule = [IntakeStep7SkipRule new];
  task.shouldReportProgress = YES;
  [task setSkipNavigationRule:skipStep7NavigationRule forStepIdentifier:@"step-7"];
  
  IntakeStep6SkipRule *skipStep6NavigationRule = [IntakeStep6SkipRule new];
  task.shouldReportProgress = YES;
  [task setNavigationRule:skipStep6NavigationRule forTriggerStepIdentifier:@"step-5"];
  
  __weak InternationalDiabeteRenussionStudy *wSelf = self;
  dispatch_async(dispatch_get_main_queue(), ^{
    ORKTaskViewController *taskViewController = [[ORKTaskViewController alloc] initWithTask:task taskRunUUID:nil];
    taskViewController.delegate = wSelf;
    [StudyTheme applyThemeAndPresentTaskViewController:taskViewController];
  });
}

- (void)taskViewController:(ORKTaskViewController *)taskViewController didFinishWithReason:(ORKTaskViewControllerFinishReason)reason error:(nullable NSError *)error {
  [taskViewController dismissViewControllerAnimated:YES completion:^{
  }];
  
  if (reason == ORKTaskViewControllerFinishReasonDiscarded) {
    if (self.selectionSurveyCallback != nil) {
      self.selectionSurveyCallback(@[@NO]);
      self.selectionSurveyCallback = nil;
    }
    
    if (self.intakeSurveyCallback != nil) {
      self.intakeSurveyCallback(@[@NO]);
      self.intakeSurveyCallback = nil;
    }
    
    if (self.consentCallback != nil) {
      self.consentCallback(@[@NO]);
      self.consentCallback = nil;
    }
    
    return;
  }
  
  if ([taskViewController.task.identifier isEqualToString:@"signup-flow"]) {
    NSArray *callbackResults = [StudyHelper iterateTaskResult:taskViewController.result withDataIteratingBlock:^NSObject *(ORKStepResult *stepResult) {
      if ([stepResult.identifier isEqualToString:@"step-1"]) {
        NSMutableDictionary *data = [NSMutableDictionary dictionary];
        for (ORKBooleanQuestionResult *result in stepResult.results) {
          [data setValue:result.booleanAnswer forKey:result.identifier];
        }
        return data;
      }
      
      else if ([stepResult.identifier isEqualToString:@"step-2"]) {
        ORKNumericQuestionResult *r = (ORKNumericQuestionResult *)stepResult.results.firstObject;
        return r.numericAnswer;
      }
      
      else if ([stepResult.identifier isEqualToString:@"step-3"]) {
        ORKDateQuestionResult *r = (ORKDateQuestionResult *)stepResult.results.firstObject;
        return [r.dateAnswer iso8601String];
      }
      
      else if ([stepResult.identifier isEqualToString:@"step-4"]) {
        ORKBooleanQuestionResult *r = (ORKBooleanQuestionResult *)stepResult.results.firstObject;
        return r.booleanAnswer;
      }
      return nil;
    }];
    
    self.selectionSurveyCallback(callbackResults);
    self.selectionSurveyCallback = nil;
  }
  else if ([taskViewController.task.identifier isEqualToString:@"intake-survey"]) {
    
    NSArray *callbackResults = [StudyHelper iterateTaskResult:taskViewController.result withDataIteratingBlock:^NSObject *(ORKStepResult *stepResult) {
      if ([stepResult.identifier isEqualToString:@"step-1"] ||
          [stepResult.identifier isEqualToString:@"step-5"] ||
          [stepResult.identifier isEqualToString:@"step-6"] ||
          [stepResult.identifier isEqualToString:@"step-8"]) {
        ORKChoiceQuestionResult *r = (ORKChoiceQuestionResult *)stepResult.results.firstObject;
        return r.choiceAnswers;
      }
      
      else if ([stepResult.identifier isEqualToString:@"step-2"]) {
        ORKDateQuestionResult *r = (ORKDateQuestionResult *)stepResult.results.firstObject;
        return [r.dateAnswer iso8601String];
      }
      
      else if ([stepResult.identifier isEqualToString:@"step-3"]) {
        ORKNumericQuestionResult *r = (ORKNumericQuestionResult *)stepResult.results.firstObject;
        return [LocaleUnit convertToSIWithUnit:[LocaleUnit heightUnit] value:r.numericAnswer.doubleValue];
      }
      
      else if ([stepResult.identifier isEqualToString:@"step-4"]) {
        ORKNumericQuestionResult *r = (ORKNumericQuestionResult *)stepResult.results.firstObject;
        return [LocaleUnit convertToSIWithUnit:[LocaleUnit mediumMassUnit] value:r.numericAnswer.doubleValue];

      }

      
      else if ([stepResult.identifier isEqualToString:@"step-10"] ||
               [stepResult.identifier isEqualToString:@"step-11"] ||
               [stepResult.identifier isEqualToString:@"step-12"] ||
               [stepResult.identifier isEqualToString:@"step-9"]) {
        ORKTimeOfDayQuestionResult *r = (ORKTimeOfDayQuestionResult *)stepResult.results.firstObject;
        return [NSString stringWithFormat:@"%ld:%ld", r.dateComponentsAnswer.hour, r.dateComponentsAnswer.minute];
      }
      
      else if ([stepResult.identifier isEqualToString:@"step-7"]) {
        ORKTextQuestionResult *r = (ORKTextQuestionResult *)stepResult.results.firstObject;
        return r.textAnswer;
      }
      
      return nil;
    }];
    
    self.intakeSurveyCallback(callbackResults);
    self.intakeSurveyCallback = nil;
  }
  else if ([taskViewController.task.identifier isEqualToString:@"consent-survey"]) {
    
    ORKStepResult *stepResult = (ORKStepResult *)taskViewController.result.results[1];
    BOOL consented = NO;
    
    if ([stepResult.identifier isEqualToString:@"consent-review"]) {
      ORKConsentSignatureResult *r = (ORKConsentSignatureResult *)stepResult.results.firstObject;
      consented = r.consented;
    }
    
    self.consentCallback(@[[NSNumber numberWithBool:consented]]);
    self.consentCallback = nil;
  }
  
}

#pragma mark - Private methods

- (ORKConsentDocument *)consentDocumentWithHTMLContent:(NSString *)htmlContent {
  ORKConsentDocument *consentDocument = [ORKConsentDocument new];
  
  ORKConsentSection *s1 = [[ORKConsentSection alloc] initWithType:ORKConsentSectionTypeCustom];
  s1.title = @"Welcome";
  s1.customImage = [[UIImage imageNamed:@"Hba1c"] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal];
  s1.summary = @"This brief walkthrough will describe the study procedures and will allow you to provide consent to participate.\n\nYour participation in this study is completely voluntary. Please read through this document and if you agree, sign at the informed consent screen to show that you understand the benefits and risks of the study. You will receive a copy of the signed consent form for your records. Thank you for your contribution to diabetes research!\n\nYou can contact us to answer any questions you may have concerning this research study. Please write to the following email address: info@diabetesremission.org";
  s1.htmlContent = @"<p><strong>Description of diabetes remission &amp; the purpose of this study</strong></p><p>What is diabetes remission? It is a state where, after being diagnosed with diabetes, the person no longer shows symptoms of the disease. While it has been know for some years that diabetes remission is feasible after some digestive surgical procedures (i.e. bariatric surgery), it was until recently that scientific experiments points out that it might be feasible under some circumstances. </p><p>The purpose of this study is to observe people that are interested in achieving remission of the disease or that have achieved it, in order to get insights on how they have achieved and improve standards of diabetes care. </p><p>Since diabetes is a very complex disease, each person would have a particular combination of causes for their hypoglycemia. Therefore it is most important to study at a large scale and for a prolonged time, to see closely the evolution of each patient that is aiming or has already achieved normal levels of glucose after achieving diagnosis. By collecting data from large number of individuals of different ages, from different places and of different ethnicities, researchers can have an unprecedented understanding of how lifestyles, medication and genes interact to reverse diabetes.</p><p>This study is registered at UC Berkeley. The principal investigator of the study is DrPH(c) Victor Villalobos.</p>";
  s1.customLearnMoreButtonTitle = @"Learn more";
  
  ORKConsentSection *s2 = [[ORKConsentSection alloc] initWithType:ORKConsentSectionTypeStudySurvey];
  s2.title = @"Activities";
  s2.summary = @"During this study, we will ask you questions regarding your food and physical activity habits. Occasionally, we will ask you to take a picture of those habits.\n\nThe app is designed to send you occasional reminders to complete these study tasks.";
  s2.customLearnMoreButtonTitle = @"Learn more";
  
  ORKConsentSection *s3 = [[ORKConsentSection alloc] initWithType:ORKConsentSectionTypeCustom];
  s3.title = @"Sensor and Health Data";
  s3.summary = @"This study collects data from your smartphone in order to know more about your lifestyle and health, for example walking or sitting patterns.";
  s3.customImage = [UIImage imageNamed:@"consent_sensors_health_data"];
  s3.htmlContent = @"<p>In order to get more accurate data, we encourage you to carry the smartphone on your person as much as possible (e.g., in your pocket, or clipped to your waist). If the phone is left on a desk or in your car when you go for a walk, it will not be able to detect your walking.</p><p>IDRR will use the sensors in certain phones and the built-in activity monitoring to keep track of physical activity. Most smartphones have nowadays multiple sensors to detect such activity. The IDRR app will not demand more use of your battery power, since it is something that is done by the operative system or other apps. </p><p>Because this study is digital, it will allow a greater swath of daily information to be collected over the period that the study will run. Glucose management is something that requires attention throughout the day, as such, this study will ask you questions regarding food and physical activity patterns, dietary intake, etc.. Previous studies monitoring this have been limited because they are not digital, and people have to be in-person to share this data. </p><p>The data that you share through this research will generate one of the most important databases of daily behaviors and diabetes reversal outcomes. You can play a role in deciphering how behaviors, health and habits are interconnected. Collected data may reveal how to improve the quality of life of people with diabetes, and also advance clinical research into Glucose Metabolism. By combining a personal app and a research study, IDRR will help explore how the smartphone may be used with new kinds of clinical research in the future. </p><p>We hope that this app will not only aid research but also help you to keep track of health behaviors such as diet, activity, sleep and taking your medications or supplements, to better improve your daily health routines.</p>";
  s3.customLearnMoreButtonTitle = @"Learn more";
  
  ORKConsentSection *s4 = [[ORKConsentSection alloc] initWithType:ORKConsentSectionTypeDataUse];
  s4.title = @"Privacy and Data Use";
  s4.summary = @"The data you share will remain confidential and protected with encryption methods. The app will not collect identifiable information. Only de-identified data will be used and shared for scientific research.";
  s4.htmlContent = @"<p><strong>How our privacy works</strong></p><p>To protect your privacy, we have taken several steps. First, we do not collect any data that can identify you. Neither your name, nor your email or phone number is passed to the researchers. Second, all data that is collected is encrypted. The encryption technology is of the highest level of security, it protects the exchange of data between you and the researchers. The communication flows between you and the researchers, but the researchers are never able to know any detail about where or who you are. Third, no third parties can have access to your information, not even the company that provides this technology, <strong>Bitmark</strong>.</p><p>In addition, whenever app data is transferred to a research study computer, it will be encrypted so that others cannot interpret the data or associate it back to you. All the data is encrypted, from your phone to our database. Only you can give the key to decrypt the information. &nbsp;&nbsp;</p><p>These steps ensure that the data cannot be accessed without your consent and cannot be linked to your identity. The researchers analyzing the coded study data will not be able to connect it to any individual user. All <strong>data communication utilizes encryption channels at all times</strong>.</p><p><strong>Data use</strong></p><p>The researchers will analyze data from everyone who completes the consent form, but they will be unable to connect it back to any individual user.</p><p>The analysis and conclusions of this research may be published in a scientific or medical research journal for scientific purposes. No report or publication will be made in a way that would allow data to be associated with individual users.</p><p>After the research is completed, other researchers might be able to request access to the study data (already in de-identified form), so that it can be analyzed in a new way to benefit medical research. These researchers must agree to use the data for research in accordance with applicable regulations. &nbsp;These data requests will be reviewed by a group of study investigators. As with original researchers, these researchers will not be able to connect the data back to study participants. Also, study data will never be sold to any third party.</p>";
  s4.customLearnMoreButtonTitle = @"Learn more";
  
  ORKConsentSection *s5 = [[ORKConsentSection alloc] initWithType:ORKConsentSectionTypeCustom];
  s5.title = @"Some Issues To Consider";
  s5.summary = @"At most, your participation in this study will take 90 minutes. It will take you a few minutes each week.";
  s5.htmlContent = @"<p>This is the time you will spend when entering information and responding to surveys. Occasionally, tasks may take a little longer (e.g., a survey or longer questionnaire to assess your opinions about the study and the app).</p><p>Some questions may make you uncomfortable. If so, you are free to leave questions blank. You can decline to answer survey questions or participate in the apps tasks.</p><p>Your participation in this study does not require you to change anything in your mobile service. The app can use either wifi only, or also cell phone data. In both cases, the amount of data transferred is very small. You may configure the app to only use wifi connection to limit the impact on your data plan.</p><p>If you choose to participate, every week your phone will send data to us. Every six months the app will ask you for permission to continue collecting data. Your data will be analyzed to study patterns on your physical activity and glucose metabolism variables. &nbsp;</p><p>Whenever the app realizes that there has been a major change in your blood glucose (positive or negative) the app will prompt you to answer a few more questions. At that moment, you will also have the option of contacting the research study members to perform a more detailed research of your case. Since we do not have your contact information, it is not possible for us to start this communication.</p>";
  s5.customImage = [UIImage imageNamed:@"consent_issue_to_consider"];
  s5.customLearnMoreButtonTitle = @"Learn more";
  
  ORKConsentSection *s6 = [[ORKConsentSection alloc] initWithType:ORKConsentSectionTypeStudyTasks];
  s6.title = @"Study Survey and Tasks";
  s6.summary = @"This study will require you to answer survey questions about several health and lifestyle factors, take some photos of the places where you eat or do exercise and, possibly, to make an interview by phone or internet.";
  s6.htmlContent = @"<p>IDRR will collect data on your health behaviors through short survey questions, such as:</p><p>What was your breakfast today?</p><p>How many hours did you sleep?</p><p>From zero to ten, how do you feel today?</p><p>Also, occasionally, there will also be longer surveys to evaluate aspects of your life such as your sleeping, social interactions, etc.</p><p>For dietary information, IDRR will prompt you to take pictures of the food, beverage, water, medication, and supplement(s) you take. When taking pictures is not appropriated or difficult, you can just text or link to a previous picture you have taken. &nbsp;&nbsp;</p><p>The actions in this study are designed to improve the quality of the data you provide to the study. IDRR will ask you about some specific aspects of yourself such as: your blood glucose, weight, height, waist circumference (occasionally). The app also has fields to enter your blood pressure. In order to sense your levels of activity, it is important to carry your smartphone on your person (e.g., in your pocket, or clipped to your waist).</p>";
  s6.customLearnMoreButtonTitle = @"Learn more";
  
  ORKConsentSection *s7 = [[ORKConsentSection alloc] initWithType:ORKConsentSectionTypeWithdrawing];
  s7.title = @"Withdrawing";
  s7.summary = @"You have the right to discontinue, pause or completely withdraw your participation at any time.";
  s7.htmlContent = @"<p>If you wish to do so, just contact the study investigators through the app. There would be no penalty for that nor any effect on your medical care through your usual physicians or providers. Afterwards, you are free to delete the app from your smartphone.</p><p>Also, the study investigators may also withdraw you from the study without your consent at any time for any reason, including if the study is cancelled.</p>";
  s7.customLearnMoreButtonTitle = @"Learn more";
  
  ORKConsentSection *s8 = [[ORKConsentSection alloc] initWithType:ORKConsentSectionTypeCustom];
  s8.title = @"Potential Benefits";
  s8.summary = @"There are no direct benefits from participating in this study. However, by keeping track of your lifestyles you might discover some insights to improve your own health.";
  s8.htmlContent = @"<p>One of the biggest challenges for people aiming to prevent, control or remit diabetes is the difficulty of developing and tracking consistent and useful patterns on diet, activity, sleep, medication/supplements, and other health behaviors. Participating in this study may help by streamlining these daily tracking tasks.</p><p>Moreover this research study will create an important database of daily behaviors and glucose control. The study will help researchers better understand the relationships between glucose metabolism, diet, physical activity, and sleep in real-world settings. It will also help explore how the smartphone and encryption mechanisms can enable new kinds of clinical research.</p>";
  s8.customImage = [UIImage imageNamed:@"consent_potential_benefits"];
  s8.customLearnMoreButtonTitle = @"Learn more";
  
  ORKConsentSection *s9 = [[ORKConsentSection alloc] initWithType:ORKConsentSectionTypeCustom];
  s9.title = @"Risks";
  s9.summary = @"Answering and monitoring your lifestyles and blood glucose might change how you feel.";
  s9.htmlContent = @"<p>As with any study, there is the possibility of some discomfort from answering question in the study. If that would be the case, you are free to leave such questions unanswered. </p><p>The app is not designed to give medical advice, nor make suggestions related to treatment or medications. Prior to any change in your medical treatment, consult a physician.</p><p>By filling in the information below, you are acknowledging that you have read the informed consent and agree to participate in this study.</p>";
  s9.customImage = [UIImage imageNamed:@"consent_risks"];
  s9.customLearnMoreButtonTitle = @"Learn more";
  
  ORKConsentSection *s10 = [[ORKConsentSection alloc] initWithType:ORKConsentSectionTypeCustom];
  s10.title = @"Summary";
  s10.summary = @"1. Your participation in this study is voluntary.\n\n2. Try to wear your phone at all times, to track your physical activity.\n\n3. Remember to use a compatible app to track your dietary intake.";
  s10.contentURL = [NSURL URLWithString:@"https://www.rdiabetes.com/registry"];
  s10.customImage = [UIImage imageNamed:@"consent_issue_to_consider"];
  s10.customLearnMoreButtonTitle = @"Learn more";
  
  // Create additional section objects for later sections
  consentDocument.sections = @[s1,
                               s2,
                               s3,
                               s4,
                               s5,
                               s6,
                               s7,
                               s8,
                               s9,
                               s10];
  
  consentDocument.htmlReviewContent = htmlContent;
  //  ORKConsentSignature *signature = [ORKConsentSignature signatureForPersonWithTitle:@"Ms" dateFormatString:nil identifier:@"consent-signature"];
  //  [consentDocument addSignature:signature];
  
  return consentDocument;
}


@end
