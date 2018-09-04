import moment from 'moment';
import {
  DonationModel,
  CommonModel,
  AppleHealthKitModel,
  BitmarkModel,
} from '../models';
import { FileUtil } from '../utils';
import randomString from 'random-string';

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

const doCheckDataSource = async (donationInformation) => {
  let listDataTypes = [];
  if (donationInformation.activeBitmarkHealthDataAt) {
    listDataTypes = donationInformation.allDataTypes;
  }
  if (listDataTypes && listDataTypes.length > 0) {
    await AppleHealthKitModel.initHealthKit(listDataTypes);
  }
  let startDate = moment().toDate();
  startDate.setDate(startDate.getDate() - 7);
  let endDate = moment().toDate();
  let mapData = await doGetHealthKitData(listDataTypes, startDate, endDate);
  // let dataSourceInactiveCompletedTasks = [];
  let dataSourceStatuses = [];
  for (let type in mapData) {
    if (isEmptyHealthData(mapData[type])) {
      dataSourceStatuses.push({
        key: type,
        title: donationInformation.titleDataTypes[type],
        status: 'Inactive',
      });
    } else {
      dataSourceStatuses.push({
        key: type,
        title: donationInformation.titleDataTypes[type],
        status: 'Active'
      });
    }
  }
  donationInformation.dataSourceStatuses = dataSourceStatuses;
  return donationInformation;
};

const doLoadDonationTask = async (donationInformation) => {
  if (!donationInformation.createdAt) {
    return donationInformation;
  }
  donationInformation = await doCheckDataSource(donationInformation);
  donationInformation.completedTasks = donationInformation.completedTasks || [];
  return donationInformation;
}

const doActiveBitmarkHealthData = async (touchFaceIdSession, bitmarkAccountNumber, activeBitmarkHealthDataAt) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  if (!signatureData) {
    return null;
  }
  let donationInformation = await DonationModel.doActiveBitmarkHealthData(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, activeBitmarkHealthDataAt);
  return await doLoadDonationTask(donationInformation);
};

const doInactiveBitmarkHealthData = async (touchFaceIdSession, bitmarkAccountNumber, ) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  if (!signatureData) {
    return null;
  }
  let donationInformation = await DonationModel.doInactiveBitmarkHealthData(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
  return await doLoadDonationTask(donationInformation);
};

const doCompleteTask = async (touchFaceIdSession, bitmarkAccountNumber, taskType, completedAt, bitmarkId) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  if (!signatureData) {
    return null;
  }
  let donationInformation = await DonationModel.doCompleteTask(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, taskType, completedAt, bitmarkId);
  return await doLoadDonationTask(donationInformation);
};

const doGetUserInformation = async (bitmarkAccountNumber) => {
  let donationInformation = await DonationModel.doGetUserInformation(bitmarkAccountNumber);
  return await doLoadDonationTask(donationInformation);
};

let doCreateFile = async (prefix, userId, date, data, randomId, extFiles) => {
  let folderPath = FileUtil.CacheDirectory + '/' + prefix;
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
    await FileUtil.moveFile(extFilePath, destinationExtFilePath);
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
const doBitmarkHealthData = async (touchFaceIdSession, bitmarkAccountNumber, allDataTypes, list, taskType) => {
  let donationInformation;
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
      taskType,
      randomId,
    };
    let filePath = await doCreateFile('HealthKitData', bitmarkAccountNumber, healthData.date, healthData.data, healthData.randomId);
    let issueResult = await BitmarkModel.doIssueFile(touchFaceIdSession, filePath, healthData.assetName, healthData.assetMetadata, 1);
    await FileUtil.remove(filePath);
    await doCompleteTask(touchFaceIdSession, bitmarkAccountNumber, taskType, moment(dateRange.endDate).toDate(), null, issueResult[0]);
    return doGetUserInformation(bitmarkAccountNumber);
  }
  return donationInformation;
};

const DonationService = {
  doGetUserInformation,
  doActiveBitmarkHealthData,
  doInactiveBitmarkHealthData,
  doBitmarkHealthData,
  doCompleteTask,
};

export { DonationService };