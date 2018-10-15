import moment from 'moment';
import {
  AppleHealthKitModel,
  BitmarkModel,
} from '../models';
import { FileUtil } from '../utils';
import randomString from 'random-string';

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

const SUNDAY = 7;
const SATURDAY = 6;
const TIME_SENT_NOTIFICATION = 11;

const getPreviousDay = (date, dayInWeek) => {
  let tempMoment = moment(date);
  if (dayInWeek) {
    let currentDayInWeek = tempMoment.day();
    if (currentDayInWeek >= dayInWeek) {
      tempMoment.date(tempMoment.date() + currentDayInWeek - dayInWeek);
    } else {
      tempMoment.date(tempMoment.date() + dayInWeek - currentDayInWeek - 7);
    }
  } else {
    tempMoment.date(tempMoment.date() - 1);
  }
  return tempMoment;
};

const getNextDay = (date, dayInWeek) => {
  let tempMoment = moment(date);
  if (dayInWeek) {
    let currentDayInWeek = tempMoment.day();
    if (currentDayInWeek <= dayInWeek) {
      tempMoment.date(tempMoment.date() + dayInWeek - currentDayInWeek);
    } else {
      tempMoment.date(tempMoment.date() + 7 + dayInWeek - currentDayInWeek);
    }
  } else {
    tempMoment.date(tempMoment.date() + 1);
  }
  return tempMoment;
};

const getBeginDay = (date) => {
  let tempMoment = moment(date);
  tempMoment.hour(0);
  tempMoment.minute(0);
  tempMoment.second(0);
  tempMoment.millisecond(0);
  return tempMoment;
};

const getEndDay = (date) => {
  let tempMoment = moment(date);
  tempMoment.hour(23);
  tempMoment.minute(59);
  tempMoment.second(59);
  tempMoment.millisecond(0);
  return tempMoment;
};



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
    AppleHealthKitModel['get' + type](options).then(resolve).catch(error => {
      console.log(`AppleHealthKitModel.get ${type} error :`, error);
      resolve(null);
    });
  });
}

const doGetHealthKitData = async (listTypes, startDate, endDate) => {
  let determinedTypes = await AppleHealthKitModel.getDeterminedHKPermission(listTypes);
  let mapData = {};
  for (let type of determinedTypes.permissions.read) {
    mapData[type] = await tryGetHealthDataOfType(type, startDate, endDate);
  }
  return mapData;
};

const doGetDataSources = async () => {
  await AppleHealthKitModel.initHealthKit(allDataTypes);
  let startDate = moment().toDate();
  startDate.setDate(startDate.getDate() - 7);
  let endDate = moment().toDate();
  let mapData = await doGetHealthKitData(allDataTypes, startDate, endDate);
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
  let assetFilename = prefix + '_' + userId + '_' + date.toString() + '_' + randomId;
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
const doBitmarkHealthData = async (touchFaceIdSession, bitmarkAccountNumber, list) => {
  let results = [];
  for (let dateRange of list) {
    let healthRawData = await doGetHealthKitData(allDataTypes, dateRange.startDate, dateRange.endDate);
    let randomId = randomString({ length: 8, numeric: true, letters: false, });
    let healthData = {
      date: dateRange.endDate,
      data: JSON.stringify(removeEmptyValueData(healthRawData)),

      assetName: 'HK' + randomId,
      assetMetadata: {
        "Source": 'HealthKit',
        "Saved Time": moment(dateRange.endDate).toISOString()
      },
      randomId,
    };
    let filePath = await doCreateFile('HealthKitData', bitmarkAccountNumber, healthData.date, healthData.data, healthData.randomId);
    let issueResult = await BitmarkModel.doIssueFile(touchFaceIdSession, filePath, healthData.assetName, healthData.assetMetadata, 1);
    await FileUtil.remove(filePath);

    let encryptedAssetFolder = FileUtil.DocumentDirectory + '/encrypted_' + bitmarkAccountNumber + '/' + issueResult.assetId;
    console.log('encryptedAssetFolder :', encryptedAssetFolder);
    await FileUtil.mkdir(encryptedAssetFolder);
    await FileUtil.create(encryptedAssetFolder + '/session_data.txt', JSON.stringify(issueResult.sessionData));

    let desEncryptedFilePath = encryptedAssetFolder + issueResult.encryptedFilePath.substring(issueResult.encryptedFilePath.lastIndexOf('/'), issueResult.encryptedFilePath.length);
    await FileUtil.moveFileSafe(issueResult.encryptedFilePath.replace('file://', ''), desEncryptedFilePath);
    issueResult.bitmarkIds.forEach(id => {
      results.push({ id, sessionData: issueResult.sessionData });
    });
  }
  return results;
};

const doCheckBitmarkHealthDataTask = (healthDataBitmarks, accountCreatedAt) => {
  let lastTimeBitmarkHealthData;
  (healthDataBitmarks || []).forEach(bitmark => {
    if (bitmark.asset.metadata['Saved Time']) {
      let saveTime = moment(bitmark.asset.metadata['Saved Time']);
      if (!lastTimeBitmarkHealthData || (saveTime.toDate().getTime() > lastTimeBitmarkHealthData.toDate().getTime())) {
        lastTimeBitmarkHealthData = saveTime;
      }
    }
  });
  let list = [];
  let startDate, endDate;
  if (!lastTimeBitmarkHealthData) {
    lastTimeBitmarkHealthData = moment(accountCreatedAt);
    startDate = getPreviousDay(lastTimeBitmarkHealthData, SUNDAY);
    startDate = getBeginDay(startDate);
    endDate = moment(lastTimeBitmarkHealthData);
    endDate.second(endDate.second() - 1);

    list.push({ startDate, endDate, });

    startDate = moment(lastTimeBitmarkHealthData);
    endDate = getNextDay(startDate, SATURDAY);
    endDate = getEndDay(endDate);
  } else {
    startDate = getNextDay(lastTimeBitmarkHealthData);
    startDate = getBeginDay(startDate);
    endDate = getNextDay(startDate, SATURDAY);
    endDate = getEndDay(endDate);
  }
  let currentDate = moment();
  if ((currentDate.day() === SUNDAY && currentDate.hour() >= TIME_SENT_NOTIFICATION) || currentDate.day() !== SUNDAY) {
    while (endDate.toDate() <= currentDate.toDate()) {
      list.push({
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
      });
      startDate = getNextDay(endDate);
      startDate = getBeginDay(startDate);
      endDate = getNextDay(startDate, SATURDAY);
      endDate = getEndDay(endDate);
    }
  }
  return list;
};
const initHealthKit = async () => {
  await AppleHealthKitModel.initHealthKit(allDataTypes);
};

const doCheckEmptyDataSource = async () => {
  let dataSourceStatuses = await doGetDataSources();
  let empty = true;
  for (let ds of dataSourceStatuses) {
    if (ds.status === 'Active') {
      empty = false;
      break;
    }
  }
  return empty;
}
const getNextSunday11AM = () => {
  let timeSendNotification = moment();
  if (timeSendNotification.day() === SUNDAY && timeSendNotification.hour() < TIME_SENT_NOTIFICATION) {
    timeSendNotification.hour(TIME_SENT_NOTIFICATION);
  } else {
    timeSendNotification = getNextDay(timeSendNotification, SUNDAY);
    timeSendNotification.hour(TIME_SENT_NOTIFICATION);
  }
  timeSendNotification.minute(0);
  timeSendNotification.second(0);
  return timeSendNotification;
};

const HealthKitService = {
  initHealthKit,
  doBitmarkHealthData,
  doGetDataSources,
  doCheckEmptyDataSource,
  doCheckBitmarkHealthDataTask,
  getNextSunday11AM,
};

export { HealthKitService };