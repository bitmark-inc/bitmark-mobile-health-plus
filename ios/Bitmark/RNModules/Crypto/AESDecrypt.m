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
  
  char keyPtr[length+1]; // room for terminator (unused)
  bzero( keyPtr, sizeof( keyPtr ) ); // fill with zeroes (for padding)
  
  NSUInteger dataLength = [message length];
  
  //See the doc: For block ciphers, the output size will always be less than or
  //equal to the input size plus the size of one block.
  //That's why we need to add the size of one block here
  size_t bufferSize = dataLength + kCCBlockSizeAES128;
  void *buffer = malloc( bufferSize );
  
  size_t numBytesDecrypted = 0;
  CCCryptorStatus cryptStatus = CCCrypt( kCCDecrypt, kCCAlgorithmAES128, kCCOptionPKCS7Padding,
                                        key.bytes, length,
                                        iv.bytes,
                                        [message bytes], dataLength, /* input */
                                        buffer, bufferSize, /* output */
                                        &numBytesDecrypted );
  
  if( cryptStatus == kCCSuccess )
  {
    //the returned NSData takes ownership of the buffer and will free it on deallocation
    NSData *decrypted = [NSData dataWithBytesNoCopy:buffer length:numBytesDecrypted];
    free( buffer );
    [decrypted writeToFile:outputFile atomically:YES];
    callback(@[@YES]);
  } else {
    free( buffer );
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
