//
//  AESDecrypt.m
//  BitmarkHealthPlus
//
//  Created by Anh Nguyen on 10/29/18.
//  Copyright © 2018 Bitmark Inc. All rights reserved.
//

#import "AESDecrypt.h"
#import <CommonCrypto/CommonCryptor.h>

@implementation AESDecrypt

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(decryptAES:(NSString *)filePath:(NSString *)keyString:(NSString *)ivString:(NSString *)cipher:(NSString *)outputFile:(RCTResponseSenderBlock)callback)
{
  NSData *key = [[self class] dataFromHexString:keyString];
  NSData *iv = [[self class] dataFromHexString:ivString];
  NSData *message = [NSData dataWithContentsOfFile:filePath];
  
  int length;
  if ([cipher isEqualToString:@"aes-256-ofb"]) {
    length = kCCKeySizeAES256;
  } else if ([cipher isEqualToString:@"aes-128-ofb"]) {
    length = kCCKeySizeAES128;
  } else {
    length = 0;
    callback(@[@NO, @"Invalid cipher"]);
    return;
  }
  
  CCCryptorRef cryptor;
  
  CCCryptorStatus result = CCCryptorCreateWithMode(kCCDecrypt,
                                                   kCCModeOFB,
                                                   kCCAlgorithmAES,
                                                   ccNoPadding,
                                                   [iv bytes],
                                                   [key bytes],
                                                   length,
                                                   NULL,
                                                   0,
                                                   0,
                                                   0,
                                                   &cryptor);
  
  
  size_t bufferLength = CCCryptorGetOutputLength(cryptor, message.length, false);
  NSMutableData *buffer = [NSMutableData dataWithLength:bufferLength];
  
  size_t outLength;
  
  
  result = CCCryptorUpdate(cryptor,
                           [message bytes],
                           [message length],
                           [buffer mutableBytes],
                           [buffer length],
                           &outLength);
  
  
  result = CCCryptorRelease(cryptor);
  
  if( result == kCCSuccess )
  {
    [buffer writeToFile:outputFile atomically:YES];
    callback(@[@YES]);
  } else {
    callback(@[@NO]);
  }
}

+ (NSData *)dataFromHexString:(NSString *)string
{
  string = [string lowercaseString];
  NSMutableData *data= [NSMutableData new];
  unsigned char whole_byte;
  char byte_chars[3] = {'\0','\0','\0'};
  int i = 0;
  NSUInteger length = string.length;
  while (i < length-1) {
    char c = [string characterAtIndex:i++];
    if (c < '0' || (c > '9' && c < 'a') || c > 'f')
      continue;
    byte_chars[0] = c;
    byte_chars[1] = [string characterAtIndex:i++];
    whole_byte = strtol(byte_chars, NULL, 16);
    [data appendBytes:&whole_byte length:1];
  }
  return data;
}

@end
