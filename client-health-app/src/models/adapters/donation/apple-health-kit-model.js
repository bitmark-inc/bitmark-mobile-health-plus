import { NativeModules } from 'react-native';
let AppleHealthKit = NativeModules.AppleHealthKit

const supportedDataTypes = {
  'BodyMassIndex': 'getBodyMassIndex',
  'BodyFatPercentage': 'getBodyFatPercentage',
  'Height': 'getHeight',
  'Weight': 'getWeight',
  'LeanBodyMass': 'getLeanBodyMass',
  'StepCount': 'getStepCount',
  'DistanceWalkingRunning': 'getDistanceWalkingRunning',
  'DistanceCycling': 'getDistanceCycling',
  'WheelchairDistance': 'getWheelchairDistance',
  'BasalEnergyBurned': 'getBasalEnergyBurned',
  'ActiveEnergyBurned': 'getActiveEnergyBurned',
  'FlightsClimbed': 'getFlightsClimbed',
  'NikeFuel': 'getNikeFuel',
  'AppleExerciseTime': 'getAppleExerciseTime',
  'PushCount': 'getPushCount',
  'DistanceSwimming': 'getDistanceSwimming',
  'SwimmingStrokeCount': 'getSwimmingStrokeCount',
  'HeartRate': 'getHeartRate',
  'BodyTemperature': 'getBodyTemperature',
  'BasalBodyTemperature': 'getBasalBodyTemperature',
  'BloodPressureSystolic': 'getBloodPressureSystolic',
  'BloodPressureDiastolic': 'getBloodPressureDiastolic',
  'RespiratoryRate': 'getRespiratoryRate',
  'OxygenSaturation': 'getOxygenSaturation',
  'PeripheralPerfusionIndex': 'getPeripheralPerfusionIndex',
  'BloodGlucose': 'getBloodGlucose',
  'NumberOfTimesFallen': 'getNumberOfTimesFallen',
  'ElectrodermalActivity': 'getElectrodermalActivity',
  'InhalerUsage': 'getInhalerUsage',
  'BloodAlcoholContent': 'getBloodAlcoholContent',
  'ForcedVitalCapacity': 'getForcedVitalCapacity',
  'ExpiratoryVolume1': 'getExpiratoryVolume1',
  'ExpiratoryFlowRate': 'getExpiratoryFlowRate',
  'DietaryFatTotal': 'getDietaryFatTotal',
  'DietaryFatPolyunsaturated': 'getDietaryFatPolyunsaturated',
  'DietaryFatMonounsaturated': 'getDietaryFatMonounsaturated',
  'DietaryFatSaturated': 'getDietaryFatSaturated',
  'DietaryCholesterol': 'getDietaryCholesterol',
  'DietarySodium': 'getDietarySodium',
  'DietaryCarbohydrates': 'getDietaryCarbohydrates',
  'DietaryFiber': 'getDietaryFiber',
  'DietarySugar': 'getDietarySugar',
  'DietaryEnergy': 'getDietaryEnergy',
  'DietaryProtein': 'getDietaryProtein',
  'DietaryVitaminA': 'getDietaryVitaminA',
  'DietaryVitaminB6': 'getDietaryVitaminB6',
  'DietaryVitaminB12': 'getDietaryVitaminB12',
  'DietaryVitaminC': 'getDietaryVitaminC',
  'DietaryVitaminD': 'getDietaryVitaminD',
  'DietaryVitaminE': 'getDietaryVitaminE',
  'DietaryVitaminK': 'getDietaryVitaminK',
  'DietaryCalcium': 'getDietaryCalcium',
  'DietaryIron': 'getDietaryIron',
  'DietaryThiamin': 'getDietaryThiamin',
  'DietaryRiboflavin': 'getDietaryRiboflavin',
  'DietaryNiacin': 'getDietaryNiacin',
  'DietaryFolate': 'getDietaryFolate',
  'DietaryBiotin': 'getDietaryBiotin',
  'DietaryPantothenicAcid': 'getDietaryPantothenicAcid',
  'DietaryPhosphorus': 'getDietaryPhosphorus',
  'DietaryIodine': 'getDietaryIodine',
  'DietaryMagnesium': 'getDietaryMagnesium',
  'DietaryZinc': 'getDietaryZinc',
  'DietarySelenium': 'getDietarySelenium',
  'DietaryCopper': 'getDietaryCopper',
  'DietaryManganese': 'getDietaryManganese',
  'DietaryChromium': 'getDietaryChromium',
  'DietaryMolybdenum': 'getDietaryMolybdenum',
  'DietaryChloride': 'getDietaryChloride',
  'DietaryPotassium': 'getDietaryPotassium',
  'DietaryCaffeine': 'getDietaryCaffeine',
  'DietaryWater': 'getDietaryWater',
  'UVExposure': 'getUVExposure',
  'SleepAnalysis': 'getSleepAnalysis',
  'CervicalMucousQuality': 'getCervicalMucousQuality',
  'OvulationTestResult': 'getOvulationTestResult',
  'MenstrualFlow': 'getMenstrualFlow',
  'IntermenstrualBleeding': 'getIntermenstrualBleeding',
  'SexualActivity': 'getSexualActivity',
  'BiologicalSex': 'getBiologicalSex',
  'DateOfBirth': 'getDateOfBirth',
  'WheelchairUse': 'getWheelchairUse',
  'StandHour': 'getStandHour',
  'MindfulSession': 'getMindfulSession',
  'BloodType': 'getBloodType',
  'FitzpatrickSkinType': 'getFitzpatrickSkinType',
  'WaistCircumference': 'getWaistCircumference',
  'VO2Max': 'getVO2Max',
  'WorkoutType': 'getWorkoutType',
  'Food': 'getFood'
};

let AppleHealthKitModel = {};

AppleHealthKitModel.initHealthKit = (readDataType) => {
  return new Promise((resolve, reject) => {
    if (!readDataType) {
      return reject(new Error('Invalid read data types!'));
    }
    let permissions = {};
    if (readDataType && readDataType.length > 0) {
      for (let index in readDataType) {
        if (!supportedDataTypes[readDataType[index]]) {
          return reject(new Error('Read data type "' + readDataType[index] + '" is not support!'));
        }
      }
      permissions.read = readDataType;
    }
    AppleHealthKit.initHealthKit({ permissions: permissions }, (error, response) => {
      if (error) {
        console.log('error: ', error);
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

AppleHealthKitModel.getDeterminedHKPermission = (readDataType) => {
  return new Promise((resolve, reject) => {
    if (!readDataType) {
      return reject(new Error('Invalid read data types!'));
    }
    let permissions = {};
    if (readDataType && readDataType.length > 0) {
      for (let type of readDataType) {
        if (!supportedDataTypes[type]) {
          return reject(new Error('Read data type "' + type + '" is not support!'));
        }
      }
      permissions.read = readDataType;
    }
    AppleHealthKit.getDeterminedHKPermission({ permissions: permissions }, (ok, result) => {
      if (!ok) {
        reject(new Error('Can not detect data type is granted!'));
      } else {
        resolve(result);
      }
    });
  });
};

AppleHealthKitModel.getFood = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getFoodSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    });
  });
};

AppleHealthKitModel.getWorkoutType = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getWorkoutTypeOnDay(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    });
  });
};

AppleHealthKitModel.getBloodType = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getBloodType(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    });
  });
};

AppleHealthKitModel.getFitzpatrickSkinType = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getFitzpatrickSkinType(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    });
  });
};

AppleHealthKitModel.getWaistCircumference = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getLatestWaistCircumference(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    });
  });
};

AppleHealthKitModel.getVO2Max = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getVO2MaxOnDay(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    });
  });
};

AppleHealthKitModel.getBodyMassIndex = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getLatestBmi(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    });
  });
};
AppleHealthKitModel.getBodyFatPercentage = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getLatestBodyFatPercentage(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getHeight = (options) => {
  return new Promise((resolve) => {
    if (options) {
      AppleHealthKit.getHeightSamples(options, (error, result) => {
        if (error) {
          console.log('error: ', error);
          resolve(null);
        } else {
          resolve(result);
        }
      });
    } else {
      AppleHealthKit.getLatestHeight(options, (error, result) => {
        if (error) {
          console.log('error: ', error);
          resolve(null);
        } else {
          resolve(result);
        }
      });
    }
  });
};
AppleHealthKitModel.getWeight = (options) => {
  return new Promise((resolve) => {
    if (options) {
      AppleHealthKit.getWeightSamples(options, (error, result) => {
        if (error) {
          console.log('error: ', error);
          resolve(null);
        } else {
          resolve(result);
        }
      });
    } else {
      AppleHealthKit.getLatestWeight(options, (error, result) => {
        if (error) {
          console.log('error: ', error);
          resolve(null);
        } else {
          resolve(result);
        }
      });
    }
  });
};
AppleHealthKitModel.getLeanBodyMass = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getLatestLeanBodyMass(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getStepCount = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getDailyStepCountSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDistanceWalkingRunning = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getDistanceWalkingRunning(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDistanceCycling = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getDistanceCycling(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getWheelchairDistance = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getWheelchairDistanceOnDay(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getBasalEnergyBurned = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getBasalEnergyBurnedOnDay(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getActiveEnergyBurned = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getActiveEnergyBurnedOnDay(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getFlightsClimbed = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getFlightsClimbed(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getNikeFuel = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getNikeFuelOnDay(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getAppleExerciseTime = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getAppleExerciseTimeOnDay(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getPushCount = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getPushCountOnDay(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDistanceSwimming = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getDistanceSwimmingOnDay(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getSwimmingStrokeCount = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getSwimmingStrokeCountOnDay(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getHeartRate = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getHeartRateSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getBodyTemperature = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getBodyTemperatureSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getBasalBodyTemperature = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getBasalBodyTemperatureSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getBloodPressureSystolic = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getBloodPressureSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        var realResult = [];
        result.forEach(item => {
          realResult.push({
            bloodPressureSystolicValue: item.bloodPressureSystolicValue,
            startDate: item.startDate,
            endDate: item.endDate,
          });
        });
        resolve(realResult);
      }
    })
  });
};
AppleHealthKitModel.getBloodPressureDiastolic = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getBloodPressureSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        var realResult = [];
        result.forEach(item => {
          realResult.push({
            bloodPressureDiastolicValue: item.bloodPressureDiastolicValue,
            startDate: item.startDate,
            endDate: item.endDate,
          });
        });
        resolve(realResult);
      }
    })
  });
};
AppleHealthKitModel.getRespiratoryRate = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getRespiratoryRateSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getOxygenSaturation = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getOxygenSaturationSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getPeripheralPerfusionIndex = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getPeripheralPerfusionIndexSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getBloodGlucose = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getBloodGlucoseSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getNumberOfTimesFallen = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getNumberOfTimesFallenSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getElectrodermalActivity = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getElectrodermalActivitySamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getInhalerUsage = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getInhalerUsageSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getBloodAlcoholContent = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getBloodAlcoholContentSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getForcedVitalCapacity = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getForcedVitalCapacitySamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getExpiratoryVolume1 = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getExpiratoryVolume1Samples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getExpiratoryFlowRate = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getExpiratoryFlowRateSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryFatTotal = (options) => {
  options.nutrition_item = 'DietaryFatTotal';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryFatPolyunsaturated = (options) => {
  options.nutrition_item = 'DietaryFatPolyunsaturated';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryFatMonounsaturated = (options) => {
  options.nutrition_item = 'DietaryFatMonounsaturated';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryFatSaturated = (options) => {
  options.nutrition_item = 'DietaryFatSaturated';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryCholesterol = (options) => {
  options.nutrition_item = 'DietaryCholesterol';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietarySodium = (options) => {
  options.nutrition_item = 'DietarySodium';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryCarbohydrates = (options) => {
  options.nutrition_item = 'DietaryCarbohydrates';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryFiber = (options) => {
  options.nutrition_item = 'DietaryFiber';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietarySugar = (options) => {
  options.nutrition_item = 'DietarySugar';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryEnergy = (options) => {
  options.nutrition_item = 'DietaryEnergy';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryProtein = (options) => {
  options.nutrition_item = 'DietaryProtein';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryVitaminA = (options) => {
  options.nutrition_item = 'DietaryVitaminA';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryVitaminB6 = (options) => {
  options.nutrition_item = 'DietaryVitaminB6';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryVitaminB12 = (options) => {
  options.nutrition_item = 'DietaryVitaminB12';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryVitaminC = (options) => {
  options.nutrition_item = 'DietaryVitaminC';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryVitaminD = (options) => {
  options.nutrition_item = 'DietaryVitaminD';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryVitaminE = (options) => {
  options.nutrition_item = 'DietaryVitaminE';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryVitaminK = (options) => {
  options.nutrition_item = 'DietaryVitaminK';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryCalcium = (options) => {
  options.nutrition_item = 'DietaryCalcium';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryIron = (options) => {
  options.nutrition_item = 'DietaryIron';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryThiamin = (options) => {
  options.nutrition_item = 'DietaryThiamin';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryRiboflavin = (options) => {
  options.nutrition_item = 'DietaryRiboflavin';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryNiacin = (options) => {
  options.nutrition_item = 'DietaryNiacin';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryFolate = (options) => {
  options.nutrition_item = 'DietaryFolate';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryBiotin = (options) => {
  options.nutrition_item = 'DietaryBiotin';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryPantothenicAcid = (options) => {
  options.nutrition_item = 'DietaryPantothenicAcid';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryPhosphorus = (options) => {
  options.nutrition_item = 'DietaryPhosphorus';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryIodine = (options) => {
  options.nutrition_item = 'DietaryIodine';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryMagnesium = (options) => {
  options.nutrition_item = 'DietaryMagnesium';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryZinc = (options) => {
  options.nutrition_item = 'DietaryZinc';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietarySelenium = (options) => {
  options.nutrition_item = 'DietarySelenium';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryCopper = (options) => {
  options.nutrition_item = 'DietaryCopper';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryManganese = (options) => {
  options.nutrition_item = 'DietaryManganese';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryChromium = (options) => {
  options.nutrition_item = 'DietaryChromium';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryMolybdenum = (options) => {
  options.nutrition_item = 'DietaryMolybdenum';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryChloride = (options) => {
  options.nutrition_item = 'DietaryChloride';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryPotassium = (options) => {
  options.nutrition_item = 'DietaryPotassium';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryCaffeine = (options) => {
  options.nutrition_item = 'DietaryCaffeine';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDietaryWater = (options) => {
  options.nutrition_item = 'DietaryWater';
  return new Promise((resolve) => {
    AppleHealthKit.getNutritionSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getUVExposure = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getUVExposure(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getSleepAnalysis = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getSleepSamples(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getCervicalMucousQuality = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getCervicalMucousQuality(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getOvulationTestResult = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getOvulationTestResult(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getMenstrualFlow = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getMenstrualFlow(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getIntermenstrualBleeding = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getIntermenstrualBleeding(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getSexualActivity = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getSexualActivity(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getBiologicalSex = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getBiologicalSex(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getDateOfBirth = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getDateOfBirth(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    })
  });
};
AppleHealthKitModel.getWheelchairUse = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getWheelchairUse(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    });
  });
};

AppleHealthKitModel.getStandHour = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getStandHour(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    });
  });
};

AppleHealthKitModel.getMindfulSession = (options) => {
  return new Promise((resolve) => {
    AppleHealthKit.getMindfullSession(options, (error, result) => {
      if (error) {
        console.log('error: ', error);
        resolve(null);
      } else {
        resolve(result);
      }
    });
  });
};

export { AppleHealthKitModel };