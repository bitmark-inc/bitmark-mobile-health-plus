//
//  WomenHealthStudy.m
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 7/21/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import "WomenHealthStudy.h"
#import <React/RCTConvert.h>
#import <UIKit/UIKit.h>
#import <React/RCTLog.h>
#import <ResearchKit/ResearchKit.h>
#import "StudyHelper.h"
#import "StudyTheme.h"
#import "LocaleUnit.h"

@interface WomenHealthStudy() <ORKTaskViewControllerDelegate>

@property (nonatomic, copy, nullable) RCTResponseSenderBlock signupFlowCallback;
@property (nonatomic, copy, nullable) RCTResponseSenderBlock intakeSurveyCallback;
@property (nonatomic, copy, nullable) RCTResponseSenderBlock consentCallback;

@end

@implementation WomenHealthStudy

RCT_EXPORT_MODULE();

#pragma mark - Eligibility Survey
RCT_EXPORT_METHOD(showSignUpFlow:(RCTResponseSenderBlock)callback) {
  RCTLogInfo(@"Begin signup flow");
  self.signupFlowCallback = callback;
  
  ORKInstructionStep *introductionStep = [[ORKInstructionStep alloc] initWithIdentifier:@"step-0"];
  introductionStep.title = @"Eligibility Survey";
  introductionStep.detailText = @"First, we'd like to ask you a few questions to make sure you are eligible to participate in the Global Women's Health Outcomes Study.";
  
#pragma mark Step 1 - M3.1
  ORKBooleanAnswerFormat *maleFemaleBooleanAnswerFormat = [ORKBooleanAnswerFormat booleanAnswerFormatWithYesString:@"Male" noString:@"Female"];
  ORKBooleanAnswerFormat *defaultBooleanAnswerFormat = [ORKBooleanAnswerFormat booleanAnswerFormat];
  
  ORKFormItem *step1FormItem1 = [[ORKFormItem alloc] initWithIdentifier:@"formquestion1"
                                                                   text:@"What is your biological sex?"
                                                           answerFormat:maleFemaleBooleanAnswerFormat];
  step1FormItem1.optional = NO;
  ORKFormItem *step1FormItem2 = [[ORKFormItem alloc] initWithIdentifier:@"formquestion2"
                                                                   text:@"Are you currently pregnant?"
                                                           answerFormat:defaultBooleanAnswerFormat];
  step1FormItem2.optional = NO;
  ORKFormItem *step1FormItem3 = [[ORKFormItem alloc] initWithIdentifier:@"formquestion3"
                                                                   text:@"Are you age 18 or older?"
                                                           answerFormat:defaultBooleanAnswerFormat];
  step1FormItem3.optional = NO;
  ORKFormItem *step1FormItem4 = [[ORKFormItem alloc] initWithIdentifier:@"formquestion4"
                                                                   text:@"Are you willing to download an app to track your reproductive health?"
                                                           answerFormat:defaultBooleanAnswerFormat];
  step1FormItem4.optional = NO;
  ORKFormItem *step1FormItem5 = [[ORKFormItem alloc] initWithIdentifier:@"formquestion5"
                                                                   text:@"Are you willing to share your reproductive and behavioral health data through HealthKit?"
                                                           answerFormat:defaultBooleanAnswerFormat];
  step1FormItem5.optional = NO;
  ORKFormItem *step1FormItem6 = [[ORKFormItem alloc] initWithIdentifier:@"formquestion6"
                                                                   text:@"Are you currently a student from UC Berkeley?"
                                                           answerFormat:defaultBooleanAnswerFormat];
  step1FormItem6.optional = NO;
  
  ORKFormStep *step1FormStep = [[ORKFormStep alloc] initWithIdentifier:@"step-1"];
  step1FormStep.formItems = @[step1FormItem1,
                              step1FormItem2,
                              step1FormItem3,
                              step1FormItem4,
                              step1FormItem5,
                              step1FormItem6];
  step1FormStep.optional = NO;
  
  ORKOrderedTask *task = [[ORKOrderedTask alloc] initWithIdentifier:@"signup-flow" steps:@[introductionStep,
                                                                                           step1FormStep]];
  
  __weak WomenHealthStudy *wSelf = self;
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
  reviewStep.reasonForConsent = @"If you wish to participate in this study, please click \"Agree\" below.";
  
  // Create task
  ORKOrderedTask *task = [[ORKOrderedTask alloc] initWithIdentifier:@"consent-survey" steps:@[step0ConsentStep,
                                                                                              reviewStep]];
  
  __weak WomenHealthStudy *wSelf = self;
  dispatch_async(dispatch_get_main_queue(), ^{
    ORKTaskViewController *taskViewController = [[ORKTaskViewController alloc] initWithTask:task taskRunUUID:nil];
    taskViewController.delegate = wSelf;
    [StudyTheme applyThemeAndPresentTaskViewController:taskViewController];
  });
}

#pragma mark - Intake survey
RCT_EXPORT_METHOD(showIntakeSurvey:(RCTResponseSenderBlock)callback) {
  self.intakeSurveyCallback = callback;
  
  ORKInstructionStep *introductionStep = [[ORKInstructionStep alloc] initWithIdentifier:@"step-0"];
  introductionStep.title = @"Intake Survey";
  introductionStep.detailText = @"Awesome! We'd like to start by getting to know you better. The next few screens will ask a few questions about your background and current status.";
  
#pragma mark Step 2 - M5.1

#pragma mark Step 1 - M5
  ORKTextChoice *step1Option1TextChoice = [ORKTextChoice choiceWithText:@"American Indian or Alaska Native" value:@"opt-1"];
  ORKTextChoice *step1Option2TextChoice = [ORKTextChoice choiceWithText:@"Asian" value:@"opt-2"];
  ORKTextChoice *step1Option3TextChoice = [ORKTextChoice choiceWithText:@"Black or African American" value:@"opt-3"];
  ORKTextChoice *step1Option4TextChoice = [ORKTextChoice choiceWithText:@"Native Hawaiian or Other Pacific Islander" value:@"opt-4"];
  ORKTextChoice *step1Option5TextChoice = [ORKTextChoice choiceWithText:@"White" value:@"opt-5"];
  
  ORKAnswerFormat *step1AnswerFormat = [ORKAnswerFormat choiceAnswerFormatWithStyle:ORKChoiceAnswerStyleMultipleChoice
                                                                        textChoices:@[step1Option1TextChoice,
                                                                                      step1Option2TextChoice,
                                                                                      step1Option3TextChoice,
                                                                                      step1Option4TextChoice,
                                                                                      step1Option5TextChoice]];
  
  ORKQuestionStep *step1QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-1" title:@"Please specify your race.\nSelect all that apply" answer:step1AnswerFormat];
  step1QuestionStep.optional = NO;
  
  
  ORKTextChoice *step2Option1TextChoice = [ORKTextChoice choiceWithText:@"Hispanic or Latino" value:@"opt-1"];
  ORKTextChoice *step2Option2TextChoice = [ORKTextChoice choiceWithText:@"Not Hispanic or Latino" value:@"opt-2"];
  
  ORKAnswerFormat *step2AnswerFormat = [ORKAnswerFormat choiceAnswerFormatWithStyle:ORKChoiceAnswerStyleSingleChoice textChoices:@[step2Option1TextChoice,
                                                                                                                                   step2Option2TextChoice]];
  
  ORKQuestionStep *step2QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-2" title:@" Please specify your ethnicity." answer:step2AnswerFormat];
  step2QuestionStep.optional = NO;
  
  ORKNumericAnswerFormat *step3AnswerFormat = [[ORKNumericAnswerFormat alloc] initWithStyle:ORKNumericAnswerStyleDecimal unit:@"years"];
  step3AnswerFormat.minimum = @18;
  step3AnswerFormat.maximum = @100;
  
  ORKQuestionStep *step3QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-3" title:@"What is your current age?" answer:step3AnswerFormat];
  step3QuestionStep.optional = NO;
  
#pragma mark Step 3 - M5.2
  ORKTextChoice *step4Option1TextChoice = [ORKTextChoice choiceWithText:@"Married" value:@"opt-1"];
  ORKTextChoice *step4Option2TextChoice = [ORKTextChoice choiceWithText:@"Widowed" value:@"opt-2"];
  ORKTextChoice *step4Option3TextChoice = [ORKTextChoice choiceWithText:@"Divorced" value:@"opt-3"];
  ORKTextChoice *step4Option4TextChoice = [ORKTextChoice choiceWithText:@"Separated" value:@"opt-4"];
  ORKTextChoice *step4Option5TextChoice = [ORKTextChoice choiceWithText:@"Never married" value:@"opt-5"];
  
  ORKAnswerFormat *step4AnswerFormat = [ORKAnswerFormat choiceAnswerFormatWithStyle:ORKChoiceAnswerStyleSingleChoice textChoices:@[step4Option1TextChoice,
                                                                                                                                   step4Option2TextChoice,
                                                                                                                                   step4Option3TextChoice,
                                                                                                                                   step4Option4TextChoice,
                                                                                                                                   step4Option5TextChoice]];
  
  ORKQuestionStep *step4QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-4" title:@"What is your marital status?" answer:step4AnswerFormat];
  step4QuestionStep.optional = NO;
  
#pragma mark Step 3 - M5.3
  ORKTextChoice *step5Option1TextChoice = [ORKTextChoice choiceWithText:@"No schooling completed" value:@"opt-1"];
  ORKTextChoice *step5Option2TextChoice = [ORKTextChoice choiceWithText:@"Nursery school to 8th grade" value:@"opt-2"];
  ORKTextChoice *step5Option3TextChoice = [ORKTextChoice choiceWithText:@"9th, 10th or 11th grade" value:@"opt-3"];
  ORKTextChoice *step5Option4TextChoice = [ORKTextChoice choiceWithText:@"12th grade, no diploma" value:@"opt-4"];
  ORKTextChoice *step5Option5TextChoice = [ORKTextChoice choiceWithText:@"High school graduate - high school diploma or the equivalent (for example: GED)" value:@"opt-5"];
  ORKTextChoice *step5Option6TextChoice = [ORKTextChoice choiceWithText:@"Some college credit, but less than 1 year" value:@"opt-6"];
  ORKTextChoice *step5Option7TextChoice = [ORKTextChoice choiceWithText:@"1 or more years of college, no degree" value:@"opt-7"];
  ORKTextChoice *step5Option8TextChoice = [ORKTextChoice choiceWithText:@"Associate degree (for example: AA, AS)" value:@"opt-8"];
  ORKTextChoice *step5Option9TextChoice = [ORKTextChoice choiceWithText:@"Bachelor's degree (for example: BA, AB, BS)" value:@"opt-9"];
  ORKTextChoice *step5Option10TextChoice = [ORKTextChoice choiceWithText:@"Master's degree (for example: MA, MS, MEng, MEd, MSW, MBA)" value:@"opt-10"];
  ORKTextChoice *step5Option11TextChoice = [ORKTextChoice choiceWithText:@"Professional degree (for example: MD, DDS, DVM, LLB, JD)" value:@"opt-11"];
  ORKTextChoice *step5Option12TextChoice = [ORKTextChoice choiceWithText:@"Doctorate degree (for example: PhD, EdD)" value:@"opt-12"];
  
  ORKAnswerFormat *step5AnswerFormat = [ORKAnswerFormat choiceAnswerFormatWithStyle:ORKChoiceAnswerStyleSingleChoice textChoices:@[step5Option1TextChoice,
                                                                                                                                   step5Option2TextChoice,
                                                                                                                                   step5Option3TextChoice,
                                                                                                                                   step5Option4TextChoice,
                                                                                                                                   step5Option5TextChoice,
                                                                                                                                   step5Option6TextChoice,
                                                                                                                                   step5Option7TextChoice,
                                                                                                                                   step5Option8TextChoice,
                                                                                                                                   step5Option9TextChoice,
                                                                                                                                   step5Option10TextChoice,
                                                                                                                                   step5Option11TextChoice,
                                                                                                                                   step5Option12TextChoice]];
  
  ORKQuestionStep *step5QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-5"
                                                                             title:@"What is the highest degree or level of education you have completed?"
                                                                            answer:step5AnswerFormat];
  step5QuestionStep.optional = NO;
  
#pragma mark Step 4 - M5.4
  ORKTextChoice *step6Option1TextChoice = [ORKTextChoice choiceWithText:@"Less than $10,000" value:@"opt-1"];
  ORKTextChoice *step6Option2TextChoice = [ORKTextChoice choiceWithText:@"$10,000 to $19,999" value:@"opt-2"];
  ORKTextChoice *step6Option3TextChoice = [ORKTextChoice choiceWithText:@"$20,000 to $29,999" value:@"opt-3"];
  ORKTextChoice *step6Option4TextChoice = [ORKTextChoice choiceWithText:@"$30,000 to $39,999" value:@"opt-4"];
  ORKTextChoice *step6Option5TextChoice = [ORKTextChoice choiceWithText:@"$40,000 to $49,999" value:@"opt-5"];
  ORKTextChoice *step6Option6TextChoice = [ORKTextChoice choiceWithText:@"$50,000 to $59,999" value:@"opt-6"];
  ORKTextChoice *step6Option7TextChoice = [ORKTextChoice choiceWithText:@"$60,000 to $69,999" value:@"opt-7"];
  ORKTextChoice *step6Option8TextChoice = [ORKTextChoice choiceWithText:@"$70,000 to $79,999" value:@"opt-8"];
  ORKTextChoice *step6Option9TextChoice = [ORKTextChoice choiceWithText:@"$80,000 to $89,999" value:@"opt-9"];
  ORKTextChoice *step6Option10TextChoice = [ORKTextChoice choiceWithText:@"$90,000 to $99,999" value:@"opt-10"];
  ORKTextChoice *step6Option11TextChoice = [ORKTextChoice choiceWithText:@"$100,000 to $149,999" value:@"opt-11"];
  ORKTextChoice *step6Option12TextChoice = [ORKTextChoice choiceWithText:@"$150,000 or more" value:@"opt-12"];
  
  ORKAnswerFormat *step6AnswerFormat = [ORKAnswerFormat valuePickerAnswerFormatWithTextChoices:@[step6Option1TextChoice,
                                                                                                 step6Option2TextChoice,
                                                                                                 step6Option3TextChoice,
                                                                                                 step6Option4TextChoice,
                                                                                                 step6Option5TextChoice,
                                                                                                 step6Option6TextChoice,
                                                                                                 step6Option7TextChoice,
                                                                                                 step6Option8TextChoice,
                                                                                                 step6Option9TextChoice,
                                                                                                 step6Option10TextChoice,
                                                                                                 step6Option11TextChoice,
                                                                                                 step6Option12TextChoice]];
  
  ORKQuestionStep *step6QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-6"
                                                                             title:@"What is your total household income?"
                                                                            answer:step6AnswerFormat];
  step6QuestionStep.optional = NO;
  
#pragma mark Step 5 - M5.5

  ORKNumericAnswerFormat *step7AnswerFormat = [[ORKNumericAnswerFormat alloc] initWithStyle:ORKNumericAnswerStyleDecimal unit:@"hours"];
  step7AnswerFormat.minimum = @0;
  step7AnswerFormat.maximum = @24;
  ORKQuestionStep *step7QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-7" title:@"On average, how many hours do you sleep per night?" answer:step7AnswerFormat];
  step7QuestionStep.optional = NO;

  ORKNumericAnswerFormat *step8AnswerFormat = [[ORKNumericAnswerFormat alloc] initWithStyle:ORKNumericAnswerStyleDecimal unit:@"hours"];
  step8AnswerFormat.minimum = @0;
  step8AnswerFormat.maximum = @24;
  ORKQuestionStep *step8QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-8" title:@"On average, how many hours do you exercise per day?" answer:step8AnswerFormat];
  step8QuestionStep.optional = NO;
  
  ORKAnswerFormat *step9AnswerFormat = [[ORKNumericAnswerFormat alloc] initWithStyle:ORKNumericAnswerStyleDecimal unit:[LocaleUnit mediumLengthUnit].symbol];
  ORKQuestionStep *step9QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-9" title:@"What is your height?" answer:step9AnswerFormat];
  step9QuestionStep.optional = NO;
  
  ORKAnswerFormat *step10AnswerFormat = [[ORKNumericAnswerFormat alloc] initWithStyle:ORKNumericAnswerStyleDecimal unit:[LocaleUnit mediumMassUnit].symbol];
  ORKQuestionStep *step10QuestionStep = [ORKQuestionStep questionStepWithIdentifier:@"step-10" title:@"What is your current weight?" answer:step10AnswerFormat];
  step10QuestionStep.optional = NO;
  
  // Create task
  ORKOrderedTask *task = [[ORKOrderedTask alloc] initWithIdentifier:@"intake-survey" steps:@[introductionStep,
                                                                                             step1QuestionStep,
                                                                                             step2QuestionStep,
                                                                                             step3QuestionStep,
                                                                                             step4QuestionStep,
                                                                                             step5QuestionStep,
                                                                                             step6QuestionStep,
                                                                                             step7QuestionStep,
                                                                                             step8QuestionStep,
                                                                                             step9QuestionStep,
                                                                                             step10QuestionStep]];
  
  __weak WomenHealthStudy *wSelf = self;
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
    if (self.signupFlowCallback != nil) {
      self.signupFlowCallback(@[@NO]);
      self.signupFlowCallback = nil;
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
        NSDateFormatter *dateFormat = [NSDateFormatter new];
        //correcting format to include seconds and decimal place
        dateFormat.dateFormat = @"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
        return [dateFormat stringFromDate:r.dateAnswer];
      }
      
      else if ([stepResult.identifier isEqualToString:@"step-4"]) {
        ORKBooleanQuestionResult *r = (ORKBooleanQuestionResult *)stepResult.results.firstObject;
        return r.booleanAnswer;
      }
      return nil;
    }];
    
    self.signupFlowCallback(callbackResults);
    self.signupFlowCallback = nil;
  }
  else if ([taskViewController.task.identifier isEqualToString:@"intake-survey"]) {
    
    NSArray *callbackResults = [StudyHelper iterateTaskResult:taskViewController.result withDataIteratingBlock:^NSObject *(ORKStepResult *stepResult) {
      if ([stepResult.identifier isEqualToString:@"step-1"] ||
          [stepResult.identifier isEqualToString:@"step-2"] ||
          [stepResult.identifier isEqualToString:@"step-4"] ||
          [stepResult.identifier isEqualToString:@"step-5"] ||
          [stepResult.identifier isEqualToString:@"step-6"]) {
        ORKChoiceQuestionResult *r = (ORKChoiceQuestionResult *)stepResult.results.firstObject;
        return r.choiceAnswers;
      }
      
      else if ([stepResult.identifier isEqualToString:@"step-3"] ||
               [stepResult.identifier isEqualToString:@"step-7"] ||
               [stepResult.identifier isEqualToString:@"step-8"]) {
        ORKNumericQuestionResult *r = (ORKNumericQuestionResult *)stepResult.results.firstObject;
        return [NSString stringWithFormat:@"%@ %@", r.numericAnswer, r.unit];
      }
      
      else if ([stepResult.identifier isEqualToString:@"step-9"]) {
        ORKNumericQuestionResult *r = (ORKNumericQuestionResult *)stepResult.results.firstObject;
        return [LocaleUnit convertToSIWithUnit:[LocaleUnit mediumLengthUnit] value:r.numericAnswer.doubleValue];
      }
      
      else if ([stepResult.identifier isEqualToString:@"step-10"]) {
        ORKNumericQuestionResult *r = (ORKNumericQuestionResult *)stepResult.results.firstObject;
        return [LocaleUnit convertToSIWithUnit:[LocaleUnit mediumMassUnit] value:r.numericAnswer.doubleValue];
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
  
  ORKConsentSection *s1 = [[ORKConsentSection alloc] initWithType:ORKConsentSectionTypeOverview];
  s1.title = @"Consent Form";
  s1.summary = @"This overview will explain the research study. After you learn about the study, you can review the consent form in more detail before choosing to participate. This may take about 20 minutes to complete.";
  
  ORKConsentSection *s2 = [[ORKConsentSection alloc] initWithType:ORKConsentSectionTypeCustom];
  s2.title = @"Bitmark Blockchain";
  s2.summary = @"The Bitmark Blockchain enables UC Berkeley researchers to introduce a new paradigm of collecting personal health data. \n\nWe recognize that reproductive health information can be deeply sensitive and tough to share in a digital environment. By leveraging blockchain technology, we hope to give you full control over your data.\n\nYou will have the power to donate what you wish, in an anonymous and informed manner, and establish rights to that data.";
  s2.customImage = [UIImage imageNamed:@"consent_generic_bitmark_logo"];
  
  ORKConsentSection *s3 = [[ORKConsentSection alloc] initWithType:ORKConsentSectionTypeStudySurvey];
  s3.title = @"Surveys";
  s3.summary = @"Some of the tasks in this study will require you to answer survey questions about your background and participant experience.";
  
  ORKConsentSection *s4 = [[ORKConsentSection alloc] initWithType:ORKConsentSectionTypeCustom];
  s4.title = @"Sensors and Health Data";
  s4.summary = @"This study will gather sensor and health data from your iPhone and personal devices with your permission.";
  s4.customImage = [UIImage imageNamed:@"consent_sensors_health_data"];
  
  ORKConsentSection *s5 = [[ORKConsentSection alloc] initWithType:ORKConsentSectionTypeDataGathering];
  s5.title = @"Data Gathering";
  s5.summary = @"You can specify which HealthKit data you would like to contribute to the study. This data will be gathered from the Health app in preparation for each donation.";
  
  ORKConsentSection *s6 = [[ORKConsentSection alloc] initWithType:ORKConsentSectionTypeDataUse];
  s6.title = @"Data Use";
  s6.summary = @"Your donated health data will be used for the purposes of this research study only. Your data will not be shared with other researchers.";
  
  ORKConsentSection *s7 = [[ORKConsentSection alloc] initWithType:ORKConsentSectionTypeTimeCommitment];
  s7.title = @"Time Commitment";
  s7.summary = @"Your initial study participation will take 5-10 minutes per day. We hope you can contribute to the study daily for up to three months.";
  
  ORKConsentSection *s8 = [[ORKConsentSection alloc] initWithType:ORKConsentSectionTypePrivacy];
  s8.title = @"Confidentiality & Privacy";
  s8.summary = @"Each of your data donations will be transferred anonymously to researchers. Data will be merged if they are from the same participants, denoted by a unique public key code. No personal identifiable information will be collected.";
  
  ORKConsentSection *s9 = [[ORKConsentSection alloc] initWithType:ORKConsentSectionTypeCustom];
  s9.title = @"Issues to Consider";
  s9.summary = @"We understand sharing some personal information can make you uncomfortable. You can simply choose to not donate your data at any time.";
  s9.customImage = [UIImage imageNamed:@"consent_issue_to_consider"];
  
  // Create additional section objects for later sections
  consentDocument.sections = @[s1,
                               s2,
                               s3,
                               s4,
                               s5,
                               s6,
                               s7,
                               s8,
                               s9];
  
  consentDocument.htmlReviewContent = htmlContent;
  
//  ORKConsentSignature *signature = [ORKConsentSignature signatureForPersonWithTitle:@"Ms" dateFormatString:nil identifier:@"consent-signature"];
//  [consentDocument addSignature:signature];
  
  return consentDocument;
}

//- (void)saveConsentDocument {
//  [[self consentDocument] makePDFWithCompletionHandler:^(NSData * _Nullable PDFData, NSError * _Nullable error) {
//    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory,NSUserDomainMask, YES);
//    NSString *documentsDirectory = [paths objectAtIndex:0];
//    NSString *filePath = [NSString stringWithFormat:@"%@/womenhealth-consent.pdf", documentsDirectory];
//    [PDFData writeToFile:filePath atomically:NO];
//    NSLog(@"Saved to: %@", filePath);
//  }];
//}

@end
