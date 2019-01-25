import moment from 'moment';
import randomString from 'random-string';
import {
  AppleHealthKitAdapter,
  BitmarkModel,
  BitmarkSDK,
} from '../models';

import {
  FileUtil,
  // asyncAlert
} from 'src/utils';

let allDataTypes = [
  'ActiveEnergyBurned',
  'AppleExerciseTime',
  'BasalBodyTemperature',
  'BasalEnergyBurned',
  'BiologicalSex',
  'BloodAlcoholContent',
  'BloodGlucose',
  'BloodPressureDiastolic',
  'BloodPressureSystolic',
  'BloodType',
  'BodyFatPercentage',
  'BodyMassIndex',
  'BodyTemperature',
  'CervicalMucousQuality',
  'DateOfBirth',
  'DietaryBiotin',
  'DietaryCaffeine',
  'DietaryCalcium',
  'DietaryCarbohydrates',
  'DietaryChloride',
  'DietaryCholesterol',
  'DietaryChromium',
  'DietaryCopper',
  'DietaryEnergy',
  'DietaryFatMonounsaturated',
  'DietaryFatPolyunsaturated',
  'DietaryFatSaturated',
  'DietaryFatTotal',
  'DietaryFiber',
  'DietaryFolate',
  'DietaryIodine',
  'DietaryIron',
  'DietaryMagnesium',
  'DietaryManganese',
  'DietaryMolybdenum',
  'DietaryNiacin',
  'DietaryPantothenicAcid',
  'DietaryPhosphorus',
  'DietaryPotassium',
  'DietaryProtein',
  'DietaryRiboflavin',
  'DietarySelenium',
  'DietarySodium',
  'DietarySugar',
  'DietaryThiamin',
  'DietaryVitaminA',
  'DietaryVitaminB12',
  'DietaryVitaminB6',
  'DietaryVitaminC',
  'DietaryVitaminD',
  'DietaryVitaminE',
  'DietaryVitaminK',
  'DietaryWater',
  'DietaryZinc',
  'DistanceCycling',
  'DistanceSwimming',
  'DistanceWalkingRunning',
  'ElectrodermalActivity',
  'ExpiratoryFlowRate',
  'ExpiratoryVolume1',
  'FitzpatrickSkinType',
  'FlightsClimbed',
  'Food',
  'ForcedVitalCapacity',
  'HeartRate',
  'Height',
  'InhalerUsage',
  'IntermenstrualBleeding',
  'LeanBodyMass',
  'MenstrualFlow',
  'MindfulSession',
  'NikeFuel',
  'NumberOfTimesFallen',
  'OvulationTestResult',
  'OxygenSaturation',
  'PeripheralPerfusionIndex',
  'PushCount',
  'RespiratoryRate',
  'SexualActivity',
  'SleepAnalysis',
  'StandHour',
  'StepCount',
  'SwimmingStrokeCount',
  'UVExposure',
  // 'VO2Max', // TODO don't support in iOS10
  // 'WaistCircumference', // TODO don't support in iOS10
  'Weight',
  'WheelchairDistance',
  'WheelchairUse',
  // 'WorkoutType',// TODO don't support in iOS10
];

let BitmarkHealthDataTypes = [
  'SleepAnalysis',
  'StepCount'
];

let titleDataTypes = {
  'ActiveEnergyBurned': 'Active Energy',
  'AppleExerciseTime': 'Exercise Minutes',
  'BasalBodyTemperature': 'Basal Body Temperature',
  'BasalEnergyBurned': 'Resting energy',
  'BiologicalSex': 'Sex',
  'BloodAlcoholContent': 'Blood Alcohol Content',
  'BloodGlucose': 'Blood Glucose',
  'BloodPressureDiastolic': 'Diastolic Blood Pressure',
  'BloodPressureSystolic': 'Systolic Blood Pressure',
  'BloodType': 'Blood Type',
  'BodyFatPercentage': 'Body Fat Percentage',
  'BodyMassIndex': 'Body Mass Index',
  'BodyTemperature': 'Body Temperature',
  'CervicalMucousQuality': 'Cervical Mucous Quality',
  'DateOfBirth': 'Date of Birth',
  'DietaryBiotin': 'Biotin',
  'DietaryCaffeine': 'Caffeine',
  'DietaryCalcium': 'Calcium',
  'DietaryCarbohydrates': 'Carbohydrates',
  'DietaryChloride': 'Chloride',
  'DietaryCholesterol': 'Dietary Cholesterol',
  'DietaryChromium': 'Chromium',
  'DietaryCopper': 'Copper',
  'DietaryEnergy': 'Dietary Energy',
  'DietaryFatMonounsaturated': 'Monounsaturated Fat',
  'DietaryFatPolyunsaturated': 'Polyunsaturated Fat',
  'DietaryFatSaturated': 'Saturated Fat',
  'DietaryFatTotal': 'Total Fat',
  'DietaryFiber': 'Fiber',
  'DietaryFolate': 'Folate',
  'DietaryIodine': 'Iodine',
  'DietaryIron': 'Iron',
  'DietaryMagnesium': 'Magnesium',
  'DietaryManganese': 'Manganese',
  'DietaryMolybdenum': 'Molybdenum',
  'DietaryNiacin': 'Niacin',
  'DietaryPantothenicAcid': 'Pantothenic Acid',
  'DietaryPhosphorus': 'Phosphorus',
  'DietaryPotassium': 'Potassium',
  'DietaryProtein': 'Protein',
  'DietaryRiboflavin': 'Riboflavin',
  'DietarySelenium': 'Selenium',
  'DietarySodium': 'Sodium',
  'DietarySugar': 'Dietary Sugar',
  'DietaryThiamin': 'Thiamin',
  'DietaryVitaminA': 'Vitamin A',
  'DietaryVitaminB12': 'Vitamin B12',
  'DietaryVitaminB6': 'Vitamin B6',
  'DietaryVitaminC': 'Vitamin C',
  'DietaryVitaminD': 'Vitamin D',
  'DietaryVitaminE': 'Vitamin E',
  'DietaryVitaminK': 'Vitamin K',
  'DietaryWater': 'Water',
  'DietaryZinc': 'Zinc',
  'DistanceCycling': 'Cycling Distance',
  'DistanceSwimming': 'Swimming Distance',
  'DistanceWalkingRunning': 'Walking + Running Distance',
  'ElectrodermalActivity': 'Electrodermal Activity',
  'ExpiratoryFlowRate': 'Peak Expiratory Flow Rate',
  'ExpiratoryVolume1': 'Forced Expiratory Volume, 1 sec',
  'FitzpatrickSkinType': 'Fitzpatrick Skin Type',
  'FlightsClimbed': 'Flights Climbed',
  'Food': 'Food (Correlation Type)',
  'ForcedVitalCapacity': 'Forced Vital Capacity',
  'HeartRate': 'Heart Rate',
  'Height': 'Height',
  'InhalerUsage': 'Inhaler Usage',
  'IntermenstrualBleeding': 'Spotting',
  'LeanBodyMass': 'Lean Body Mass',
  'MenstrualFlow': 'Menstruation',
  'MindfulSession': 'Mindful Minutes',
  'NikeFuel': 'NikeFuel',
  'NumberOfTimesFallen': 'Number of Times Fallen',
  'OvulationTestResult': 'Ovulation Test Result',
  'OxygenSaturation': 'Oxygen Saturation',
  'PeripheralPerfusionIndex': 'Peripheral Perfusion Index',
  'PushCount': 'Pushes',
  'RespiratoryRate': 'Respiratory Rate',
  'SexualActivity': 'Sexual Activity',
  'SleepAnalysis': 'Sleep Analysis',
  'StandHour': 'Stand Hours',
  'StepCount': 'Steps',
  'SwimmingStrokeCount': 'Swimming Strokes',
  'UVExposure': 'UV Index',
  'VO2Max': 'VO2Max',
  'WaistCircumference': 'Waist circumference',
  'Weight': 'Weight',
  'WheelchairDistance': 'Wheelchair Distance',
  'WheelchairUse': 'Wheelchair',
  'WorkoutType': 'Workout Type Identifier',
};

// const SUNDAY = 7;
// const SATURDAY = 6;
const TIME_SENT_NOTIFICATION = 12;

// const getPreviousDay = (date, dayInWeek) => {
//   let tempMoment = moment(date);
//   if (dayInWeek) {
//     let currentDayInWeek = tempMoment.day();
//     if (currentDayInWeek >= dayInWeek) {
//       tempMoment.date(tempMoment.date() + currentDayInWeek - dayInWeek);
//     } else {
//       tempMoment.date(tempMoment.date() + dayInWeek - currentDayInWeek - 7);
//     }
//   } else {
//     tempMoment.date(tempMoment.date() - 1);
//   }
//   return tempMoment;
// };
//
// const getNextDay = (date, dayInWeek) => {
//   let tempMoment = moment(date);
//   if (dayInWeek) {
//     let currentDayInWeek = tempMoment.day();
//     if (currentDayInWeek <= dayInWeek) {
//       tempMoment.date(tempMoment.date() + dayInWeek - currentDayInWeek);
//     } else {
//       tempMoment.date(tempMoment.date() + 7 + dayInWeek - currentDayInWeek);
//     }
//   } else {
//     tempMoment.date(tempMoment.date() + 1);
//   }
//   return tempMoment;
// };
//
// const getBeginDay = (date) => {
//   let tempMoment = moment(date);
//   tempMoment.hour(0);
//   tempMoment.minute(0);
//   tempMoment.second(0);
//   tempMoment.millisecond(0);
//   return tempMoment;
// };
//
// const getEndDay = (date) => {
//   let tempMoment = moment(date);
//   tempMoment.hour(23);
//   tempMoment.minute(59);
//   tempMoment.second(59);
//   tempMoment.millisecond(0);
//   return tempMoment;
// };

const isEmptyHealthData = (healthData) => {
  if (!(!healthData || (healthData instanceof Array && healthData.length === 0) ||
    (!(healthData instanceof Array) && (!healthData.value || healthData.value === 'unknown' || healthData.value === 'not set')))) {
    return false;
  }
  return true;
}

const tryGetHealthDataOfType = (type, startDate, endDate) => {
  let options = {
    startDate: moment(startDate).toDate().toISOString(),
    endDate: moment(endDate).toDate().toISOString(),
  };
  return new Promise((resolve) => {
    AppleHealthKitAdapter['get' + type](options).then(resolve).catch(error => {
      console.log(`AppleHealthKitAdapter.get ${type} error :`, error);
      resolve(null);
    });
  });
}

const doGetHealthKitDataForDifferentDateRange = async (listTypes, dateRage) => {
  let determinedTypes = await AppleHealthKitAdapter.getDeterminedHKPermission(listTypes);
  let mapData = {};
  for (let type of determinedTypes.permissions.read) {
    let startDate, endDate;
    if (type === 'SleepAnalysis') {
      startDate = dateRage.SleepAnalysis.startDate;
      endDate = dateRage.SleepAnalysis.endDate
    } else {
      startDate = dateRage.StepCount.startDate;
      endDate = dateRage.StepCount.endDate
    }

    mapData[type] = await tryGetHealthDataOfType(type, startDate, endDate);
  }
  return mapData;
};

const doGetHealthKitData = async (listTypes, startDate, endDate) => {
  let determinedTypes = await AppleHealthKitAdapter.getDeterminedHKPermission(listTypes);
  let mapData = {};
  for (let type of determinedTypes.permissions.read) {
    mapData[type] = await tryGetHealthDataOfType(type, startDate, endDate);
  }
  return mapData;
};

const doGetDataSources = async (areAllDataTypes) => {
  let dataTypes = areAllDataTypes ? allDataTypes : BitmarkHealthDataTypes;
  // await AppleHealthKitAdapter.initHealthKit(dataTypes);
  let startDate = moment().toDate();
  startDate.setDate(startDate.getDate() - 7);
  let endDate = moment().toDate();
  let mapData = await doGetHealthKitData(dataTypes, startDate, endDate);
  let dataSourceStatuses = [];
  for (let type in mapData) {
    if (isEmptyHealthData(mapData[type])) {
      dataSourceStatuses.push({
        key: type,
        title: titleDataTypes[type],
        status: 'Inactive',
      });
    } else {
      dataSourceStatuses.push({
        key: type,
        title: titleDataTypes[type],
        status: 'Active'
      });
    }
  }
  return dataSourceStatuses;
};

let doCreateFile = async (prefix, userId, date, data, randomId, extFiles) => {
  let folderPath = FileUtil.CacheDirectory + '/' + userId;
  let assetFilename = prefix + '_' + userId + '_' + date.toISOString() + '_' + randomId;
  let assetFolder = folderPath + '/' + assetFilename;

  let filename = assetFilename + '.txt';
  let filePath = assetFolder + '/' + filename;
  await FileUtil.mkdir(assetFolder);
  await FileUtil.create(filePath, data);
  let assetFilePath = assetFolder + '.zip';

  if (!extFiles) {
    await FileUtil.zip(assetFolder, assetFilePath);
    return assetFilePath;
  }


  for (let extFilePath of extFiles) {
    let extFilename = extFilePath.substring(extFilePath.lastIndexOf("/") + 1, extFilePath.length);
    let destinationExtFilePath = assetFolder + '/' + extFilename;
    await FileUtil.moveFileSafe(extFilePath, destinationExtFilePath);
  }
  await FileUtil.zip(assetFolder, assetFilePath);
  return assetFilePath;
};

const removeEmptyValueData = (healthData) => {
  let realData = {};
  for (let key in healthData) {
    if (!isEmptyHealthData(healthData[key])) {
      realData[key] = healthData[key];
    }
  }
  return realData;
};

const doBitmarkHealthData = async (bitmarkAccountNumber, list) => {
  let results = [];
  for (let dateRange of list) {
    let healthRawData = await doGetHealthKitDataForDifferentDateRange(allDataTypes, dateRange);
    let randomId = randomString({ length: 8, numeric: true, letters: false, });
    let healthData = {
      date: dateRange.StepCount.endDate,
      data: JSON.stringify(removeEmptyValueData(healthRawData)),

      assetName: `HD${moment().format('YYYYMMMDDHHmmss')}`.toUpperCase(),
      assetMetadata: {
        "Type": 'Health',
        "Source": 'HealthKit',
        "Period": 'Daily',
        "Collection Date": moment(dateRange.StepCount.endDate).toISOString()
      },
      randomId,
    };
    let filePath = await doCreateFile('HealthKitData', bitmarkAccountNumber, healthData.date, healthData.data, healthData.randomId);

    let issueResult = await BitmarkModel.doIssueFile(filePath, healthData.assetName, healthData.assetMetadata, 1);

    let assetFolderPath = `${FileUtil.getLocalAssetsFolderPath(bitmarkAccountNumber)}/${issueResult.assetId}`;
    let downloadedFolder = `${assetFolderPath}/downloaded`;
    await FileUtil.mkdir(assetFolderPath);
    await FileUtil.mkdir(downloadedFolder);
    let filename = filePath.substring(filePath.lastIndexOf('/') + 1, filePath.length);
    await BitmarkSDK.storeFileSecurely(filePath, `${downloadedFolder}/${filename}`);
    await FileUtil.removeSafe(filePath);

    let listFiles = await FileUtil.readDir(downloadedFolder);
    let zipFilePath = `${downloadedFolder}/${listFiles[0]}`;
    await FileUtil.unzip(zipFilePath, `${assetFolderPath}/view`);

    issueResult.bitmarkIds.forEach(id => {
      results.push({
        id,
        assetId: issueResult.asset,
        healthData,
        filePath: `${downloadedFolder}/${listFiles[0]}`
      });
    });
  }
  return results;
};

const doCheckBitmarkHealthDataTask = (dailyHealthDataBitmarks, activeAt, resetAt) => {
  let lastTimeBitmarkHealthData;

  // Detect last time for daily health data
  (dailyHealthDataBitmarks || []).forEach(bitmark => {
    if (bitmark.asset.metadata['Collection Date']) {
      let saveTime = moment(bitmark.asset.metadata['Collection Date']);
      if (!lastTimeBitmarkHealthData || (saveTime.toDate().getTime() > lastTimeBitmarkHealthData.toDate().getTime())) {
        lastTimeBitmarkHealthData = saveTime;
      }
    }
  });
  console.log('lastTimeBitmarkHealthData:', lastTimeBitmarkHealthData && lastTimeBitmarkHealthData.toDate());

  if ((lastTimeBitmarkHealthData && resetAt && lastTimeBitmarkHealthData.toDate().getTime() < moment(resetAt).toDate().getTime()) ||
    (!lastTimeBitmarkHealthData && resetAt)) {
    // Need to set to reset time
    lastTimeBitmarkHealthData = resetAt;
  } else if (lastTimeBitmarkHealthData) {
    // Should add one day for last issue time for checking new daily health data
    lastTimeBitmarkHealthData = lastTimeBitmarkHealthData.date(lastTimeBitmarkHealthData.date() + 1).startOf('day');
  }

  // Calculate periods collect time
  let periods = [];
  let startDate, endDate;

  if (!lastTimeBitmarkHealthData) {
    // Don't have last time yet
    lastTimeBitmarkHealthData = moment(activeAt);
    if (lastTimeBitmarkHealthData.toDate().getTime() > moment().toDate().getTime()) {
      return periods;
    }
  }

  // TODO: This for adding test data
  // lastTimeBitmarkHealthData = moment().date(moment().date() - 3);

  console.log('lastTime for checking new daily bitmark:', lastTimeBitmarkHealthData.toDate());
  startDate = moment(lastTimeBitmarkHealthData);
  startDate.hour(0);
  startDate.minute(0);
  startDate.second(0);
  startDate.millisecond(0);

  endDate = moment(lastTimeBitmarkHealthData);

  let currentDate = moment();
  let lastMidnight = moment(currentDate.hour(0).minute(0).second(0).millisecond(0));

  while (endDate.diff(lastMidnight, 'minutes') < 0) {
    periods.push({
      StepCount: {
        startDate: moment(startDate).toDate(),
        endDate: moment(endDate).hour(23).minute(59).second(0).millisecond(0).toDate()
      },
      SleepAnalysis: {
        startDate: moment(startDate).hour(12).minute(0).second(0).millisecond(0).toDate(),
        endDate: getSleepEndDate(endDate).toDate()
      }
    });

    startDate = moment(startDate).date(startDate.date() + 1);
    endDate = moment(endDate).date(endDate.date() + 1);
  }

  console.log('periods:', periods);

  return periods;
};

const getSleepEndDate = (endDate) => {
  let currentDate = moment();
  let nextDate = moment(endDate).date(endDate.date() + 1);
  let nextEndDate;

  if (!nextDate.isSame(currentDate, 'd')) {
    nextEndDate = moment(nextDate).hour(12).minute(0).second(0).millisecond(0);
  } else {
    if (currentDate.hour() < 12) {
      nextEndDate = currentDate;
    } else {
      nextEndDate = moment(currentDate).hour(12).minute(0).second(0).millisecond(0);
    }
  }

  return nextEndDate;
};

const initHealthKit = async (areAllDataTypes) => {
  let result = await AppleHealthKitAdapter.initHealthKit(areAllDataTypes ? allDataTypes : BitmarkHealthDataTypes);
  return result;
};

const doCheckEmptyDataSource = async (areAllDataTypes) => {
  let dataSourceStatuses = await doGetDataSources(areAllDataTypes);
  let empty = true;
  for (let ds of dataSourceStatuses) {
    if (ds.status === 'Active') {
      empty = false;
      break;
    }
  }
  return empty;
};

const getNext12AM = () => {
  let timeSendNotification = moment().add(1, 'day');
  timeSendNotification.hour(TIME_SENT_NOTIFICATION);
  timeSendNotification.minute(0);
  timeSendNotification.second(0);
  return timeSendNotification;
};

const doDeterminedHKPermission = async () => {
  return await AppleHealthKitAdapter.getDeterminedHKPermission(allDataTypes);
};

const doGetOtherAllowedHKPermissionLabels = async () => {
  let dataSourceStatuses = await doGetDataSources(true);
  let allowedPermissionLabels = dataSourceStatuses.filter(item => item.status == 'Active' && !BitmarkHealthDataTypes.includes(item.key)).map(item => item.title);

  return allowedPermissionLabels;
};

const isAbleToDisplayAppleHealthPermissionForm = async () => {
  let isAble = false;
  let determinedHKPermissions = await doDeterminedHKPermission();

  if (determinedHKPermissions && determinedHKPermissions.permissions.read) {
    isAble = determinedHKPermissions.permissions.read.length !== allDataTypes.length;
  }

  return isAble;
};

const HealthKitService = {
  initHealthKit,
  doBitmarkHealthData,
  doGetDataSources,
  doCheckEmptyDataSource,
  doCheckBitmarkHealthDataTask,
  getNext12AM: getNext12AM,
  doDeterminedHKPermission,
  doGetOtherAllowedHKPermissionLabels,
  isAbleToDisplayAppleHealthPermissionForm
};

export { HealthKitService };