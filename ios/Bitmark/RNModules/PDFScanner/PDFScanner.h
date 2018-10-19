//
//  PDFScanner.h
//  BitmarkHealthPlus
//
//  Created by Anh Nguyen on 10/19/18.
//  Copyright © 2018 Bitmark Inc. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
@import QuartzCore;

void arrayCallback(CGPDFScannerRef inScanner, void *userInfo);
void stringCallback(CGPDFScannerRef inScanner, void *userInfo);

@interface PDFScanner : NSObject <RCTBridgeModule>

@end
