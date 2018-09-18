#import "RCTAppleHealthKit.h"

@interface RCTAppleHealthKit (Methods_Results)

- (void)results_getOxygenSaturationSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)results_getPeripheralPerfusionIndexSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)results_getBloodGlucoseSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)results_getNumberOfTimesFallenSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)results_getElectrodermalActivitySamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)results_getInhalerUsageSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)results_getBloodAlcoholContentSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)results_getForcedVitalCapacitySamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)results_getExpiratoryVolume1Samples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;
- (void)results_getExpiratoryFlowRateSamples:(NSDictionary *)input callback:(RCTResponseSenderBlock)callback;

@end
