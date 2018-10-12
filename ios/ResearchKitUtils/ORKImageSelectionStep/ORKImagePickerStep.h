//
//  ORKImagePickerStep.h
//  BitmarkDataDonation
//
//  Created by Anh Nguyen on 9/12/17.
//  Copyright © 2017 Bitmark. All rights reserved.
//

#import <ResearchKit/ResearchKit.h>

@interface ORKImagePickerStep : ORKStep

@property (nonatomic, strong) UIImage *buttonImage;
@property (nonatomic, strong) NSString *selectImageMessage;

@end
