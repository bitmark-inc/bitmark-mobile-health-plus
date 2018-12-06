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

let AppleHealthKitAdapter = {};

AppleHealthKitAdapter.initHealthKit = (readDataType) => {
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

    let tryInitHealthKit = () => {
      AppleHealthKit.initHealthKit({ permissions: permissions }, (error, response) => {
        if (error) {
          if (response && response === 5) {
            tryInitHealthKit();
          } else {
            reject(error, response);
          }
        } else {
          resolve(response);
        }
      });
    }
    tryInitHealthKit();
  });
};

AppleHealthKitAdapter.getDeterminedHKPermission = (readDataType) => {
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

AppleHealthKitAdapter.getFood = (options) => {
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

AppleHealthKitAdapter.getWorkoutType = (options) => {
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

AppleHealthKitAdapter.getBloodType = (options) => {
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

AppleHealthKitAdapter.getFitzpatrickSkinType = (options) => {
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

AppleHealthKitAdapter.getWaistCircumference = (options) => {
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

AppleHealthKitAdapter.getVO2Max = (options) => {
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

AppleHealthKitAdapter.getBodyMassIndex = (options) => {
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
AppleHealthKitAdapter.getBodyFatPercentage = (options) => {
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
AppleHealthKitAdapter.getHeight = (options) => {
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
AppleHealthKitAdapter.getWeight = (options) => {
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
AppleHealthKitAdapter.getLeanBodyMass = (options) => {
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
AppleHealthKitAdapter.getStepCount = (options) => {
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
AppleHealthKitAdapter.getDistanceWalkingRunning = (options) => {
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
AppleHealthKitAdapter.getDistanceCycling = (options) => {
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
AppleHealthKitAdapter.getWheelchairDistance = (options) => {
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
AppleHealthKitAdapter.getBasalEnergyBurned = (options) => {
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
AppleHealthKitAdapter.getActiveEnergyBurned = (options) => {
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
AppleHealthKitAdapter.getFlightsClimbed = (options) => {
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
AppleHealthKitAdapter.getNikeFuel = (options) => {
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
AppleHealthKitAdapter.getAppleExerciseTime = (options) => {
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
AppleHealthKitAdapter.getPushCount = (options) => {
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
AppleHealthKitAdapter.getDistanceSwimming = (options) => {
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
AppleHealthKitAdapter.getSwimmingStrokeCount = (options) => {
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
AppleHealthKitAdapter.getHeartRate = (options) => {
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
AppleHealthKitAdapter.getBodyTemperature = (options) => {
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
AppleHealthKitAdapter.getBasalBodyTemperature = (options) => {
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
AppleHealthKitAdapter.getBloodPressureSystolic = (options) => {
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
AppleHealthKitAdapter.getBloodPressureDiastolic = (options) => {
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
AppleHealthKitAdapter.getRespiratoryRate = (options) => {
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
AppleHealthKitAdapter.getOxygenSaturation = (options) => {
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
AppleHealthKitAdapter.getPeripheralPerfusionIndex = (options) => {
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
AppleHealthKitAdapter.getBloodGlucose = (options) => {
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
AppleHealthKitAdapter.getNumberOfTimesFallen = (options) => {
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
AppleHealthKitAdapter.getElectrodermalActivity = (options) => {
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
AppleHealthKitAdapter.getInhalerUsage = (options) => {
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
AppleHealthKitAdapter.getBloodAlcoholContent = (options) => {
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
AppleHealthKitAdapter.getForcedVitalCapacity = (options) => {
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
AppleHealthKitAdapter.getExpiratoryVolume1 = (options) => {
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
AppleHealthKitAdapter.getExpiratoryFlowRate = (options) => {
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
AppleHealthKitAdapter.getDietaryFatTotal = (options) => {
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
AppleHealthKitAdapter.getDietaryFatPolyunsaturated = (options) => {
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
AppleHealthKitAdapter.getDietaryFatMonounsaturated = (options) => {
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
AppleHealthKitAdapter.getDietaryFatSaturated = (options) => {
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
AppleHealthKitAdapter.getDietaryCholesterol = (options) => {
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
AppleHealthKitAdapter.getDietarySodium = (options) => {
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
AppleHealthKitAdapter.getDietaryCarbohydrates = (options) => {
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
AppleHealthKitAdapter.getDietaryFiber = (options) => {
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
AppleHealthKitAdapter.getDietarySugar = (options) => {
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
AppleHealthKitAdapter.getDietaryEnergy = (options) => {
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
AppleHealthKitAdapter.getDietaryProtein = (options) => {
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
AppleHealthKitAdapter.getDietaryVitaminA = (options) => {
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
AppleHealthKitAdapter.getDietaryVitaminB6 = (options) => {
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
AppleHealthKitAdapter.getDietaryVitaminB12 = (options) => {
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
AppleHealthKitAdapter.getDietaryVitaminC = (options) => {
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
AppleHealthKitAdapter.getDietaryVitaminD = (options) => {
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
AppleHealthKitAdapter.getDietaryVitaminE = (options) => {
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
AppleHealthKitAdapter.getDietaryVitaminK = (options) => {
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
AppleHealthKitAdapter.getDietaryCalcium = (options) => {
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
AppleHealthKitAdapter.getDietaryIron = (options) => {
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
AppleHealthKitAdapter.getDietaryThiamin = (options) => {
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
AppleHealthKitAdapter.getDietaryRiboflavin = (options) => {
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
AppleHealthKitAdapter.getDietaryNiacin = (options) => {
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
AppleHealthKitAdapter.getDietaryFolate = (options) => {
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
AppleHealthKitAdapter.getDietaryBiotin = (options) => {
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
AppleHealthKitAdapter.getDietaryPantothenicAcid = (options) => {
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
AppleHealthKitAdapter.getDietaryPhosphorus = (options) => {
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
AppleHealthKitAdapter.getDietaryIodine = (options) => {
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
AppleHealthKitAdapter.getDietaryMagnesium = (options) => {
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
AppleHealthKitAdapter.getDietaryZinc = (options) => {
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
AppleHealthKitAdapter.getDietarySelenium = (options) => {
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
AppleHealthKitAdapter.getDietaryCopper = (options) => {
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
AppleHealthKitAdapter.getDietaryManganese = (options) => {
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
AppleHealthKitAdapter.getDietaryChromium = (options) => {
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
AppleHealthKitAdapter.getDietaryMolybdenum = (options) => {
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
AppleHealthKitAdapter.getDietaryChloride = (options) => {
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
AppleHealthKitAdapter.getDietaryPotassium = (options) => {
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
AppleHealthKitAdapter.getDietaryCaffeine = (options) => {
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
AppleHealthKitAdapter.getDietaryWater = (options) => {
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
AppleHealthKitAdapter.getUVExposure = (options) => {
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
AppleHealthKitAdapter.getSleepAnalysis = (options) => {
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
AppleHealthKitAdapter.getCervicalMucousQuality = (options) => {
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
AppleHealthKitAdapter.getOvulationTestResult = (options) => {
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
AppleHealthKitAdapter.getMenstrualFlow = (options) => {
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
AppleHealthKitAdapter.getIntermenstrualBleeding = (options) => {
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
AppleHealthKitAdapter.getSexualActivity = (options) => {
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
AppleHealthKitAdapter.getBiologicalSex = (options) => {
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
AppleHealthKitAdapter.getDateOfBirth = (options) => {
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
AppleHealthKitAdapter.getWheelchairUse = (options) => {
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

AppleHealthKitAdapter.getStandHour = (options) => {
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

AppleHealthKitAdapter.getMindfulSession = (options) => {
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

export { AppleHealthKitAdapter };