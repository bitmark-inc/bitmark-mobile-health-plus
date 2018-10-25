//
//  RNTextDetector.m
//  BitmarkHealthPlus
//
//  Created by Dung Le on 10/12/18.
//  Copyright © 2018 Bitmark Inc. All rights reserved.
//

#import "RNTextDetector.h"

#if __has_include(<React/RCTBridge.h>)
#import <React/RCTBridge.h>
#elif __has_include("React/RCTBridge.h")
#import "React/RCTBridge.h"
#else
#import "RCTBridge.h"
#endif

#import <CoreML/CoreML.h>
#import <Vision/Vision.h>

#import <TesseractOCR/TesseractOCR.h>

@implementation RNTextDetector


- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}
RCT_EXPORT_MODULE()

static NSString *const detectionNoResultsMessage = @"Something went wrong";

RCT_REMAP_METHOD(detectFromUri, detectFromUri:(NSDictionary *)options resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  if (![options valueForKey:@"imagePath"]) {
    resolve(@NO);
    return;
  }
  NSString *imagePath = [options valueForKey:@"imagePath"];
  
  if (![options valueForKey:@"language"]) {
    resolve(@NO);
    return;
  }
  NSString *language = [options valueForKey:@"language"];
  
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    VNDetectTextRectanglesRequest *textReq = [VNDetectTextRectanglesRequest new];
    NSDictionary *d = [[NSDictionary alloc] init];
    NSString* urlTextEscaped = [imagePath stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    NSData *imageData = [NSData dataWithContentsOfURL:[NSURL URLWithString:urlTextEscaped]];
    UIImage *image = [UIImage imageWithData:imageData];
    
    if (!image) {
      dispatch_async(dispatch_get_main_queue(), ^{
        resolve(@NO);
      });
      return;
    }
    
    VNImageRequestHandler *handler = [[VNImageRequestHandler alloc] initWithData:imageData options:d];
    
    NSError *error;
    [handler performRequests:@[textReq] error:&error];
    if (error || !textReq.results || textReq.results.count == 0) {
      NSString *errorString = error ? error.localizedDescription : detectionNoResultsMessage;
      NSDictionary *pData = @{
                              @"error": [NSMutableString stringWithFormat:@"On-Device text detection failed with error: %@", errorString],
                              };
      // Running on background thread, don't call UIKit
      dispatch_async(dispatch_get_main_queue(), ^{
        resolve(pData);
      });
      return;
    }
    
    
    G8Tesseract *tesseract = [[G8Tesseract alloc] initWithLanguage:language];
    tesseract.delegate = self;
    
    NSString *charBlacklist = [options valueForKey:@"charBlacklist"];
    if (charBlacklist) {
      tesseract.charBlacklist = charBlacklist;
    }
    
    NSString *charWhitelist = [options valueForKey:@"charWhitelist"];
    if (charBlacklist) {
      tesseract.charWhitelist = charWhitelist;
    }
    
    [tesseract setImage:image];
    CGRect boundingBox;
    CGSize size;
    CGPoint origin;
    NSMutableArray *output = [NSMutableArray array];
    
    for(VNTextObservation *observation in textReq.results){
      if(observation){
        NSMutableDictionary *block = [NSMutableDictionary dictionary];
        NSMutableDictionary *bounding = [NSMutableDictionary dictionary];
        
        boundingBox = observation.boundingBox;
        size = CGSizeMake(boundingBox.size.width * image.size.width, boundingBox.size.height * image.size.height);
        origin = CGPointMake(boundingBox.origin.x * image.size.width, (1-boundingBox.origin.y)*image.size.height - size.height);
        
        tesseract.rect = CGRectMake(origin.x, origin.y, size.width, size.height);
        [tesseract recognize];
        
        bounding[@"top"] = @(origin.y);
        bounding[@"left"] = @(origin.x);
        bounding[@"width"] = @(size.width);
        bounding[@"height"] = @(size.height);
        block[@"text"] = [tesseract.recognizedText stringByReplacingOccurrencesOfString:@"\n" withString:@""];
        block[@"bounding"] = bounding;
        [output addObject:block];
      }
    }
    dispatch_async(dispatch_get_main_queue(), ^{
      resolve(output);
    });
  });
  
}

@end
