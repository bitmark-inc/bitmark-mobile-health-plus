//
//  PDFScanner.m
//  BitmarkHealthPlus
//
//  Created by Anh Nguyen on 10/19/18.
//  Copyright © 2018 Bitmark Inc. All rights reserved.
//

#import "PDFScanner.h"

@interface PDFScanner ()

@property (readwrite, strong, nonatomic) NSMutableArray<NSString *> *pageStrings;

@end

@implementation PDFScanner

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(pdfScan:(NSString *)filePath:(RCTResponseSenderBlock)callback)
{
  NSURL *url = [NSURL fileURLWithPath:filePath];
  self.pageStrings = [NSMutableArray<NSString *> new];
  
  CGPDFDocumentRef pdf = CGPDFDocumentCreateWithURL((__bridge CFURLRef)url);
  CGPDFDocumentRef document = CGPDFDocumentRetain(pdf);
  CFRelease(pdf);
  
  CGPDFOperatorTableRef table = CGPDFOperatorTableCreate();
  CGPDFOperatorTableSetCallback(table, "TJ", arrayCallback);
  CGPDFOperatorTableSetCallback(table, "Tj", stringCallback);
  
  CGPDFPageRef page = CGPDFDocumentGetPage(document, 1);
  CGPDFContentStreamRef stream = CGPDFContentStreamCreateWithPage(page);
  CGPDFScannerRef scanner = CGPDFScannerCreate(stream, table, (__bridge void *)self);
  CGPDFScannerScan(scanner);
  CGPDFScannerRelease(scanner);
  CGPDFContentStreamRelease(stream);
  if (document) {
    CGPDFDocumentRelease(document);
  }
  callback(@[@YES, self.pageStrings]);
}

@end

void arrayCallback(CGPDFScannerRef inScanner, void *userInfo) {
  PDFScanner *parser = (__bridge PDFScanner *)userInfo;
  CGPDFArrayRef array;
  bool success = CGPDFScannerPopArray(inScanner, &array);
  for (size_t n = 0; n < CGPDFArrayGetCount(array); n += 2) {
    if (n >= CGPDFArrayGetCount(array)) {
      continue;
    }
    CGPDFStringRef pdfString;
    success = CGPDFArrayGetString(array, n, &pdfString);
    if (success) {
      NSString *string = (__bridge_transfer NSString *)CGPDFStringCopyTextString(pdfString);
      [parser.pageStrings addObject:string];
    }
  }
}

void stringCallback(CGPDFScannerRef inScanner, void *userInfo) {
  PDFScanner *searcher = (__bridge PDFScanner *)userInfo;
  CGPDFStringRef pdfString;
  bool success = CGPDFScannerPopString(inScanner, &pdfString);
  if (success) {
    NSString *string = (__bridge_transfer NSString *)CGPDFStringCopyTextString(pdfString);
    [searcher.pageStrings addObject:string];
  }
}
