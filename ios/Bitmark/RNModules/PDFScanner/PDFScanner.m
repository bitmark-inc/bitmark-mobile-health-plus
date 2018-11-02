//
//  PDFScanner.m
//  BitmarkHealthPlus
//
//  Created by Anh Nguyen on 10/19/18.
//  Copyright © 2018 Bitmark Inc. All rights reserved.
//

#import "PDFScanner.h"
@import PDFKit;

@interface PDFScanner ()

@property (readwrite, strong, nonatomic) NSMutableArray<NSMutableArray<NSString *> *> *pageStrings;
@property (readwrite, nonatomic) NSUInteger currentPage;

@end

@implementation PDFScanner

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(pdfScan:(NSString *)filePath:(RCTResponseSenderBlock)callback)
{
  NSURL *url = [NSURL fileURLWithPath:filePath];

  CGPDFDocumentRef pdf = CGPDFDocumentCreateWithURL((__bridge CFURLRef)url);
  CGPDFDocumentRef document = CGPDFDocumentRetain(pdf);
  CFRelease(pdf);

  CGPDFOperatorTableRef table = CGPDFOperatorTableCreate();
  CGPDFOperatorTableSetCallback(table, "TJ", arrayCallback);
  CGPDFOperatorTableSetCallback(table, "Tj", stringCallback);
  
  NSUInteger pagesCount = (NSUInteger)CGPDFDocumentGetNumberOfPages(document);
  self.pageStrings = [[NSMutableArray<NSMutableArray<NSString *> *> alloc] initWithCapacity:pagesCount];
  
  for (NSUInteger i = 0; i < pagesCount; i ++ ) {
    self.currentPage = i;
    self.pageStrings[i] = [NSMutableArray<NSString *> new];
    CGPDFPageRef page = CGPDFDocumentGetPage(document, i);
    CGPDFContentStreamRef stream = CGPDFContentStreamCreateWithPage(page);
    CGPDFScannerRef scanner = CGPDFScannerCreate(stream, table, (__bridge void *)self);
    CGPDFScannerScan(scanner);
    CGPDFScannerRelease(scanner);
    CGPDFContentStreamRelease(stream);
  }

  if (document) {
    CGPDFDocumentRelease(document);
  }
  callback(@[@YES, self.pageStrings]);
}

RCT_EXPORT_METHOD(pdfCombine:(NSArray<NSString *> *)imagePaths:(NSString *)outputPath:(RCTResponseSenderBlock)callback)
{
  PDFDocument *document = [[PDFDocument alloc] init];
  for (int i = 0; i < imagePaths.count; i++) {
    UIImage *image = [UIImage imageWithContentsOfFile:imagePaths[i]];
    PDFPage *page = [[PDFPage alloc] initWithImage:image];
    [document insertPage:page atIndex:i];
  }

  [document writeToFile:outputPath];

  callback(@[@YES]);
}

RCT_EXPORT_METHOD(pdfThumbnail:(NSString *)pdfFilePath:(int)width:(int)height:(NSString *)outputPath:(RCTResponseSenderBlock)callback)
{
  NSURL* pdfFileUrl = [NSURL fileURLWithPath:pdfFilePath];
  PDFDocument *document = [[PDFDocument alloc] initWithURL:pdfFileUrl];
  PDFPage *firstPage = [document pageAtIndex:0];
  UIImage *thumbnail = [firstPage thumbnailOfSize:CGSizeMake(width, height) forBox:kPDFDisplayBoxMediaBox];
  [UIImagePNGRepresentation(thumbnail) writeToFile:outputPath atomically:YES];

  callback(@[@YES]);
}

@end

void arrayCallback(CGPDFScannerRef inScanner, void *userInfo) {
  PDFScanner *parser = (__bridge PDFScanner *)userInfo;
  CGPDFArrayRef array;
  bool success = CGPDFScannerPopArray(inScanner, &array);
  NSMutableString *finalString = [NSMutableString string];
  for (size_t n = 0; n < CGPDFArrayGetCount(array); n += 2) {
    if (n >= CGPDFArrayGetCount(array)) {
      continue;
    }
    CGPDFStringRef pdfString;
    success = CGPDFArrayGetString(array, n, &pdfString);
    if (success) {
      NSString *string = (__bridge_transfer NSString *)CGPDFStringCopyTextString(pdfString);
      [finalString appendString:string];
    }
  }
  [parser.pageStrings[parser.currentPage] addObject:finalString];
}

void stringCallback(CGPDFScannerRef inScanner, void *userInfo) {
  PDFScanner *searcher = (__bridge PDFScanner *)userInfo;
  CGPDFStringRef pdfString;
  bool success = CGPDFScannerPopString(inScanner, &pdfString);
  if (success) {
    NSString *string = (__bridge_transfer NSString *)CGPDFStringCopyTextString(pdfString);
    [searcher.pageStrings[searcher.currentPage] addObject:string];
  }
}
