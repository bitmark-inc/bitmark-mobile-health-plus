const _ = require('lodash');
const moment = require('moment');
const helper = require('./../../utils/helper');
const newModel = require('./../../models/new-model');
const studyCommonService = require('./common');

const SUNDAY = 7;
const SATURDAY = 6;
const study1Service = require('./study1');
const study2Service = require('./study2');

const mapStudies = {
  study1: study1Service,
  study2: study2Service,
};

const commonTasks = {
  'bitmark_health_data': {
    title: 'Weekly Health Data Bitmark',
    description: 'Sign your bitmark issuance for your health data',
    notification: "Bitmark has converted your health data for this week into digital property. Please sign your bitmark issuance now to claim it."
  }
};

const commonTaskIds = {
  bitmark_health_data: 'bitmark_health_data',
  bitmark_health_issuance: 'bitmark_health_issuance',
};

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


let getStudyInformation = (studyId) => {
  return _.merge({}, mapStudies[studyId].studyInformation);
};

let getAllStudyInformation = () => {
  let results = [];
  for (let studyId in mapStudies) {
    results.push(_.merge({}, mapStudies[studyId].studyInformation));
  }
  return results;
};

let getAllActiveStudyInformation = () => {
  let results = [];
  for (let studyId in mapStudies) {
    if (mapStudies[studyId] && mapStudies[studyId].studyInformation && mapStudies[studyId].studyInformation.available) {
      results.push(_.merge({}, mapStudies[studyId].studyInformation));
    }
  }
  return results;
};

const getTimeline = (userInformation, timezone) => {
  let timelines = [];

  if (userInformation.completedTasks && userInformation.completedTasks.length > 0) {
    timelines = userInformation.completedTasks.filter(completedTask => (completedTask.taskType === commonTaskIds.bitmark_health_data || completedTask.taskType === commonTaskIds.bitmark_health_issuance));
  }


  if (userInformation.activeBitmarkHealthDataAt) {
    let lastTimeBitmarkHealthData = studyCommonService.getMomentLocalTime(userInformation.activeBitmarkHealthDataAt || new Date(), timezone);

    let startDate = studyCommonService.getPreviousDayInLocalTime(lastTimeBitmarkHealthData, timezone, SUNDAY);
    startDate = studyCommonService.getBeginDayInLocalTime(startDate, timezone);
    let endDate = studyCommonService.getMomentLocalTime(lastTimeBitmarkHealthData, timezone);
    endDate.second(endDate.second() - 1);

    let completedTask = timelines.find(ct => (ct.taskType === commonTaskIds.bitmark_health_data && moment(ct.completedAt).toDate().getTime() === endDate.toDate().getTime()));
    if (!completedTask) {
      timelines.push({
        bitmarkAccount: userInformation.bitmarkAccount,
        taskType: commonTaskIds.bitmark_health_data,
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
        completedAt: endDate.toDate(),
      });
    }
    startDate = studyCommonService.getMomentLocalTime(lastTimeBitmarkHealthData, timezone);
    endDate = studyCommonService.getNextDayInLocalTime(startDate, timezone, SATURDAY);
    endDate = studyCommonService.getEndDayInLocalTime(endDate);

    let currentDate = studyCommonService.getMomentLocalTime(new Date(), timezone);
    while (endDate.toDate() <= currentDate.toDate()) {
      let completedTask = timelines.find(ct => (ct.taskType === commonTaskIds.bitmark_health_data && moment(ct.completedAt).toDate().getTime() === endDate.toDate().getTime()));
      if (!completedTask) {
        timelines.push({
          bitmarkAccount: userInformation.bitmarkAccount,
          taskType: commonTaskIds.bitmark_health_data,
          startDate: startDate.toDate(),
          endDate: endDate.toDate(),
          completedAt: endDate.toDate(),
        });
      }
      startDate = studyCommonService.getNextDayInLocalTime(endDate, timezone);
      startDate = studyCommonService.getBeginDayInLocalTime(startDate);
      endDate = studyCommonService.getNextDayInLocalTime(startDate, timezone, SATURDAY);
      endDate = studyCommonService.getEndDayInLocalTime(endDate);
    }
  }

  return timelines;
};

const getFullUserInformation = async (userInformation, joinedStudies, timezone) => {
  let mapJoinedStudies = {};
  let otherStudies = [];
  if (!timezone) {
    timezone = userInformation.timezone ? -userInformation.timezone : null;
  }
  joinedStudies.forEach(joinedStudy => {
    let joinedStudyId = joinedStudy.studyId;
    _.merge(joinedStudy, mapStudies[joinedStudyId].getFullJoinedInformation(joinedStudy, timezone));
    mapJoinedStudies[joinedStudy.studyId] = true;
  });

  let allStudies = getAllStudyInformation();
  allStudies.forEach((study) => {
    if (!mapJoinedStudies[study.studyId]) {
      otherStudies.push(study);
    }
  });
  userInformation.otherStudies = otherStudies;
  userInformation.joinedStudies = joinedStudies;

  if (userInformation.activeBitmarkHealthDataAt) {
    let lastTimeBitmarkHealthData = null;
    if (userInformation.completedTasks && userInformation.completedTasks.length > 0) {
      userInformation.completedTasks.forEach(item => {
        if (item.taskType === commonTaskIds.bitmark_health_data &&
          (!lastTimeBitmarkHealthData || moment(item.completedAt).toDate() > lastTimeBitmarkHealthData)) {
          lastTimeBitmarkHealthData = moment(item.completedAt).toDate();
        }
      });
    }
    let startDate, endDate;
    let list = [];
    if (!lastTimeBitmarkHealthData) {
      lastTimeBitmarkHealthData = studyCommonService.getMomentLocalTime(userInformation.activeBitmarkHealthDataAt || new Date(), timezone);

      startDate = studyCommonService.getPreviousDayInLocalTime(lastTimeBitmarkHealthData, timezone, SUNDAY);
      startDate = studyCommonService.getBeginDayInLocalTime(startDate, timezone);
      endDate = studyCommonService.getMomentLocalTime(lastTimeBitmarkHealthData, timezone);
      endDate.second(endDate.second() - 1);
      list.push({
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
      });
      startDate = studyCommonService.getMomentLocalTime(lastTimeBitmarkHealthData, timezone);
      endDate = studyCommonService.getNextDayInLocalTime(startDate, timezone, SATURDAY);
      endDate = studyCommonService.getEndDayInLocalTime(endDate);
    } else {
      startDate = studyCommonService.getNextDayInLocalTime(lastTimeBitmarkHealthData, timezone);
      startDate = studyCommonService.getBeginDayInLocalTime(startDate);
      endDate = studyCommonService.getNextDayInLocalTime(startDate, timezone, SATURDAY);
      endDate = studyCommonService.getEndDayInLocalTime(endDate);
    }

    let currentDate = studyCommonService.getMomentLocalTime(new Date(), timezone);
    while (endDate.toDate() <= currentDate.toDate()) {
      list.push({
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
      });
      startDate = studyCommonService.getNextDayInLocalTime(endDate, timezone);
      startDate = studyCommonService.getBeginDayInLocalTime(startDate);
      endDate = studyCommonService.getNextDayInLocalTime(startDate, timezone, SATURDAY);
      endDate = studyCommonService.getEndDayInLocalTime(endDate);
    }
    userInformation.bitmarkHealthDataTask = {
      list: list,
    };
  }

  userInformation.timelines = getTimeline(userInformation, timezone);
  userInformation.news = await newModel.doGetAllNewsInformation();
  userInformation.commonTaskIds = commonTaskIds;
  userInformation.commonTasks = commonTasks;
  return userInformation;
};

const doSendBitmarkHealthDataNotifications = async (userInformation) => {
  if (!userInformation) {
    return;
  }
  let timezone = userInformation.timezone ? -userInformation.timezone : null;
  let currentTimeInLocal = studyCommonService.getMomentLocalTime(new Date(), timezone);
  let sendBitmarkNotification = false;
  let lastTimeBitmarkHealthData = null;
  if (userInformation.completedTasks && userInformation.completedTasks.length > 0) {
    userInformation.completedTasks.forEach(item => {
      if (item.taskType === commonTaskIds.bitmark_health_data &&
        (!lastTimeBitmarkHealthData || moment(item.completedAt).toDate() > lastTimeBitmarkHealthData)) {
        lastTimeBitmarkHealthData = moment(item.completedAt).toDate();
      }
    });
  }
  if (userInformation.activeBitmarkHealthDataAt && currentTimeInLocal.hour() === 11 && currentTimeInLocal.day() === SUNDAY) {
    if (!lastTimeBitmarkHealthData) {
      sendBitmarkNotification = true;
    } else {
      let lastTimeDonateInLocal = studyCommonService.getMomentLocalTime(lastTimeBitmarkHealthData, timezone);
      let nextTimeSendNotification = studyCommonService.getNextDayInLocalTime(lastTimeDonateInLocal, timezone, SUNDAY);
      nextTimeSendNotification.hour(11);
      nextTimeSendNotification.minute(0);
      nextTimeSendNotification.second(0);
      nextTimeSendNotification.millisecond(0);
      sendBitmarkNotification = currentTimeInLocal.toDate() >= nextTimeSendNotification.toDate();
    }
  }
  if (sendBitmarkNotification) {
    let title = '';
    let message = 'Bitmark has converted your health data for this week into digital property. Please sign your bitmark issuance now to claim it.';
    await helper.doTryRequestSendNotification(userInformation.bitmarkAccount, title, message, { event: 'BITMARK_DATA' });
  }
};

module.exports = {
  getFullUserInformation,
  getStudyInformation,
  getAllStudyInformation,
  getAllActiveStudyInformation,
  allDataTypes,
  titleDataTypes,
  doSendBitmarkHealthDataNotifications,
  commonTasks,
  commonTaskIds,

  studyCommon: studyCommonService,
  studies: mapStudies,
};