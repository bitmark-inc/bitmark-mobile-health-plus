import moment from 'moment';
import {
  DonationModel,
  CommonModel,
  AppleHealthKitModel,
  StudiesModel,
  Study2Model,
  BitmarkModel,
  Study1Model
} from '../models';
import { FileUtil } from '../utils';
import randomString from 'random-string';

const DATA_SOURCE_INTACTIVE_TASK_TYPE = 'data-source-inactive';

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

const doCheckDataSource = async (donationInformation, oldDonationInformation) => {
  if (!donationInformation.activeBitmarkHealthDataAt) {
    return donationInformation;
  }
  await AppleHealthKitModel.initHealthKit(donationInformation.allDataTypes);
  let startDate = moment().toDate();
  startDate.setDate(startDate.getDate() - 7);
  let endDate = moment().toDate();
  let mapData = await doGetHealthKitData(donationInformation.allDataTypes, startDate, endDate);
  let dataSourceInactiveCompletedTasks = [];
  let dataSourceStatuses = [];
  for (let type in mapData) {
    if (isEmptyHealthData(mapData[type])) {
      let numberStudyRequireThisType = 0;
      if (donationInformation.joinedStudies && donationInformation.joinedStudies.length > 0) {
        for (let study of donationInformation.joinedStudies) {
          let found = (study.dataTypes || []).findIndex(studyDataType => studyDataType === type);
          numberStudyRequireThisType += found >= 0 ? 1 : 0;
        }
      }
      dataSourceStatuses.push({
        key: type,
        title: donationInformation.titleDataTypes[type],
        status: 'Inactive',
        numberStudyRequired: numberStudyRequireThisType,
      });
    } else {
      if (oldDonationInformation.dataSourceStatuses) {
        let oldStatus = (oldDonationInformation.dataSourceStatuses || []).find(item => item.key === type);
        if (oldStatus.status === 'Inactive' && oldStatus.numberStudyRequired) {
          dataSourceInactiveCompletedTasks.push({
            title: oldStatus.title + ' data source inactive',
            description: 'Required by ' + oldStatus.numberStudyRequired + (oldStatus.numberStudyRequired > 1 ? ' studies' : ' study'),
            completedDate: moment().toDate(),
          });
        }
      }
      dataSourceStatuses.push({
        key: type,
        title: donationInformation.titleDataTypes[type],
        status: 'Active'
      });
    }
  }
  dataSourceInactiveCompletedTasks = (oldDonationInformation.dataSourceInactiveCompletedTasks || []).concat(dataSourceInactiveCompletedTasks);
  donationInformation.dataSourceStatuses = dataSourceStatuses;
  donationInformation.dataSourceInactiveCompletedTasks = dataSourceInactiveCompletedTasks;
  return donationInformation;
};


const getStudy = (donationInformation, studyId) => {
  for (let index in donationInformation.joinedStudies) {
    if (donationInformation.joinedStudies[index].studyId === studyId) {
      return donationInformation.joinedStudies[index];
    }
  }
  for (let index in donationInformation.otherStudies) {
    if (donationInformation.otherStudies[index].studyId === studyId) {
      return donationInformation.otherStudies[index];
    }
  }
  return null;
};
const doLoadDonationTask = async (donationInformation) => {
  if (!donationInformation.createdAt) {
    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION, donationInformation);
    return donationInformation;
  }
  let oldDonationInformation = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION);
  donationInformation = await doCheckDataSource(donationInformation, oldDonationInformation);

  let todoTasks = [];
  let totalTodoTask = 0;
  let bitmarkHealthDataTask = donationInformation.bitmarkHealthDataTask;
  if (bitmarkHealthDataTask && bitmarkHealthDataTask.list && bitmarkHealthDataTask.list.length > 0) {
    for (let rangeTime of bitmarkHealthDataTask.list) {
      todoTasks.push({
        title: donationInformation.commonTasks[donationInformation.commonTaskIds.bitmark_health_data].title,
        description: donationInformation.commonTasks[donationInformation.commonTaskIds.bitmark_health_data].description,
        taskType: donationInformation.commonTaskIds.bitmark_health_data,
        number: 1,
        list: [rangeTime],
      });
    }
    totalTodoTask += bitmarkHealthDataTask.list.length;
  }
  if (donationInformation.joinedStudies && donationInformation.joinedStudies.length > 0) {
    donationInformation.joinedStudies.forEach(study => {
      if (study.tasks) {
        for (let taskType in study.tasks) {
          if (study.tasks[taskType].number) {
            if (study.tasks[taskType].list && study.tasks[taskType].list.length > 1) {
              for (let item in study.tasks[taskType].list) {
                todoTasks.push({
                  study,
                  title: study.studyTasks[taskType].title,
                  description: study.studyTasks[taskType].description,
                  taskType,
                  number: 1,
                  list: [item],
                  important: study.tasks[taskType].important,
                });
              }
            } else {
              todoTasks.push({
                study,
                title: study.studyTasks[taskType].title,
                description: study.studyTasks[taskType].description,
                important: study.tasks[taskType].important,
                taskType,
                number: study.tasks[taskType].number,
                list: study.tasks[taskType].list,
              });
            }
            totalTodoTask += study.tasks[taskType].number;
          }
        }
      }
    });
  }
  // if (donationInformation.dataSourceStatuses && donationInformation.dataSourceStatuses.length > 0) {
  //   for (let dataSourceStatus of donationInformation.dataSourceStatuses) {
  //     if (dataSourceStatus.status === 'Inactive' && dataSourceStatus.numberStudyRequired) {
  //       todoTasks.push({
  //         title: dataSourceStatus.title + ' data source inactive',
  //         description: 'Required by ' + dataSourceStatus.numberStudyRequired + (dataSourceStatus.numberStudyRequired > 1 ? ' studies' : ' study'),
  //         taskType: DATA_SOURCE_INTACTIVE_TASK_TYPE,
  //         number: 1,
  //       });
  //       totalTodoTask++;
  //     }
  //   }
  // }
  donationInformation.todoTasks = todoTasks;
  donationInformation.totalTodoTask = totalTodoTask;


  let completedTasks = [];
  donationInformation.completedTasks = donationInformation.completedTasks || [];

  donationInformation.completedTasks.forEach(item => {
    if (item.studyId) {
      let study = getStudy(donationInformation, item.studyId);
      if (study) {
        completedTasks.push({
          title: study.studyTasks[item.taskType].title,
          description: study.studyTasks[item.taskType].description,
          completedDate: moment(item.completedAt),
          taskType: item.taskType,
          study: study,
          bitmarkId: item.bitmarkId,
        });
      }
    }
    if (item.taskType === donationInformation.commonTaskIds.bitmark_health_data) {
      completedTasks.push({
        title: donationInformation.commonTasks[item.taskType].title,
        description: donationInformation.commonTasks[item.taskType].description,
        completedDate: moment(item.completedAt),
        taskType: item.taskType,
        bitmarkId: item.bitmarkId,
      });
    }
  });
  // if (donationInformation.dataSourceInactiveCompletedTasks && donationInformation.dataSourceInactiveCompletedTasks.length > 0) {
  //   for (let completedEnableDataSource of donationInformation.dataSourceInactiveCompletedTasks) {
  //     completedTasks.push({
  //       title: completedEnableDataSource.title,
  //       description: completedEnableDataSource.description,
  //       completedDate: moment(completedEnableDataSource.completedDate),
  //       taskType: DATA_SOURCE_INTACTIVE_TASK_TYPE,
  //     });
  //   }
  // }
  donationInformation.completedTasks = completedTasks;

  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION, donationInformation);
  return donationInformation;
}

const doActiveBitmarkHealthData = async (touchFaceIdSession, bitmarkAccountNumber, activeBitmarkHealthDataAt) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession, );
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
  console.log('doInactiveBitmarkHealthData :', donationInformation);
  return await doLoadDonationTask(donationInformation);
};

const doJoinStudy = async (touchFaceIdSession, bitmarkAccountNumber, studyId) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  if (!signatureData) {
    return null;
  }
  let donationInformation = await DonationModel.doJoinStudy(bitmarkAccountNumber, studyId, signatureData.timestamp, signatureData.signature);
  return await doLoadDonationTask(donationInformation);
};

const doLeaveStudy = async (touchFaceIdSession, bitmarkAccountNumber, studyId) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  if (!signatureData) {
    return null;
  }
  let donationInformation = await DonationModel.doLeaveStudy(bitmarkAccountNumber, studyId, signatureData.timestamp, signatureData.signature);
  return await doLoadDonationTask(donationInformation);
};

const doCompleteTask = async (touchFaceIdSession, bitmarkAccountNumber, taskType, completedAt, studyId, bitmarkId) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  if (!signatureData) {
    return null;
  }
  let donationInformation = await DonationModel.doCompleteTask(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, taskType, completedAt, studyId, bitmarkId);
  return await doLoadDonationTask(donationInformation);
};

const doGetUserInformation = async (bitmarkAccountNumber) => {
  let donationInformation = await DonationModel.doGetUserInformation(bitmarkAccountNumber);
  return await doLoadDonationTask(donationInformation);
};

const doStudyTask = async (study, taskType) => {
  console.log('doStudyTask :', study, taskType);
  if ((study.studyId === 'study1' || study.studyId === 'study2') && taskType === study.taskIds.intake_survey) {
    return await StudiesModel[study.studyId].doIntakeSurvey();
  } else if (study.studyId === 'study2' && taskType === study.taskIds.task1) {
    return await Study2Model.showActiveTask1();
  } else if (study.studyId === 'study2' && taskType === study.taskIds.task2) {
    return await Study2Model.showActiveTask2();
  } else if (study.studyId === 'study2' && taskType === study.taskIds.task3) {
    return await Study2Model.showActiveTask3();
  } else if (study.studyId === 'study2' && taskType === study.taskIds.task4) {
    return await Study2Model.showActiveTask4();
  } else if (study.studyId === 'study1' && taskType === study.taskIds.exit_survey_1) {
    console.log('run exit survey');
    return await Study1Model.doExitSurvey1();
  }
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
    let extFilename = filePath.substring(extFilePath.lastIndexOf("/") + 1, extFilePath.length);
    let destinationExtFilePath = assetFolder + '/' + extFilename;
    await FileUtil.moveFile(extFilePath, destinationExtFilePath);
  }
  await FileUtil.zip(assetFolder, assetFilePath);
  return assetFilePath;
};

let doPrepareSurveyFile = async (touchFaceIdSession, bitmarkAccountNumber, study, taskType, result) => {
  let donateData;
  let tempResult = result;
  let extFiles;
  let filePath;
  if (study.studyId === 'study2' && taskType === study.taskIds.task4) {
    tempResult = result.textAnswer;
    extFiles = result.mediaAnswer;
  }
  if ((study.studyId === 'study1' &&
    (taskType === study.taskIds.intake_survey || taskType === study.taskIds.exit_survey_1 || taskType === study.taskIds.exit_survey_2)) ||
    (study.studyId === 'study2' &&
      (taskType === study.taskIds.intake_survey || taskType === study.taskIds.task1 || taskType === study.taskIds.task2 || taskType === study.taskIds.task4))) {
    donateData = StudiesModel[study.studyId].generateSurveyAsset(study, bitmarkAccountNumber, tempResult,
      taskType, moment().toDate(), 'ResearchKit', randomString({ length: 8, numeric: true, letters: false, }));
  }
  if (donateData) {
    filePath = await doCreateFile(study.studyId, bitmarkAccountNumber, donateData.date, donateData.data, donateData.randomId, extFiles);
  }
  return { filePath, donateData };
};


const doCompletedStudyTask = async (touchFaceIdSession, bitmarkAccountNumber, study, taskType, result) => {
  if ((study.studyId === 'study1' &&
    (taskType === study.taskIds.intake_survey || taskType === study.taskIds.exit_survey_1 || (taskType === study.taskIds.exit_survey_2 && result))) ||
    (study.studyId === 'study2' &&
      (taskType === study.taskIds.intake_survey || taskType === study.taskIds.task1 || taskType === study.taskIds.task2 || taskType === study.taskIds.task4))) {
    let prepareResult = await doPrepareSurveyFile(touchFaceIdSession, bitmarkAccountNumber, study, taskType, result);

    let extra = taskType !== study.taskIds.intake_survey ? null : {
      app: 'bitmark-data-donation',
      message: `Your first data donation has been securely delivered to the ${study.title}. Thanks for donating!`,
      data: { event: 'DONATION_SUCCESS' }
    };
    let bitmarkId = await BitmarkModel.doIssueThenTransferFile(touchFaceIdSession, prepareResult.filePath, prepareResult.donateData.assetName, prepareResult.donateData.assetMetadata, study.researcherAccount, extra);
    return await doCompleteTask(touchFaceIdSession, bitmarkAccountNumber, taskType, moment().toDate(), study.studyId, bitmarkId);
  } else if (study.studyId === 'study2' && taskType === study.taskIds.task3) {
    return await doCompleteTask(touchFaceIdSession, bitmarkAccountNumber, taskType, moment().toDate(), study.studyId);
  }
  throw new Error('Can not detect task and study');
};

const doDonateHealthData = async (touchFaceIdSession, bitmarkAccountNumber, study, list) => {
  let donationInformation;
  for (let dateRange of list) {
    let healthRawData = await doGetHealthKitData(study.dataTypes, dateRange.startDate, dateRange.endDate);
    let tempData = StudiesModel[study.studyId].generateHealthKitAsset(study, bitmarkAccountNumber,
      removeEmptyValueData(healthRawData),
      study.taskIds.donations,
      dateRange.endDate,
      randomString({ length: 8, numeric: true, letters: false, })
    );
    let filePath = await doCreateFile('HealthKitData', bitmarkAccountNumber, tempData.date, tempData.data, tempData.randomId);
    let format = 'YYYY MMM DD HH:mm:ss';
    let extra = {
      app: 'bitmark-data-donation',
      message: `Your daily data donation for ${moment(dateRange.startDate).format(format)} - ${moment(dateRange.endDate).format(format)} has been securely delivered to the ${study.title}. Thanks for donating!`,
      data: { event: 'DONATION_SUCCESS' }
    };
    let bitmarkId = await BitmarkModel.doIssueThenTransferFile(touchFaceIdSession, filePath, tempData.assetName, tempData.assetMetadata, study.researcherAccount, extra);
    donationInformation = await doCompleteTask(touchFaceIdSession, bitmarkAccountNumber, study.taskIds.donations, moment().toDate(), study.studyId, bitmarkId);
  }
  return donationInformation;
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
        Creator: bitmarkAccountNumber,
        Created: moment(dateRange.endDate).format('YYYY MMM DD HH:mm:ss'),
        Types: 'Health Kit data'
      },
      taskType,
      randomId,
    };
    let filePath = await doCreateFile('HealthKitData', bitmarkAccountNumber, healthData.date, healthData.data, healthData.randomId);
    let issueResult = await BitmarkModel.doIssueFile(touchFaceIdSession, filePath, healthData.assetName, healthData.assetMetadata, 1);
    donationInformation = await doCompleteTask(touchFaceIdSession, bitmarkAccountNumber, taskType, moment().toDate(), null, issueResult[0]);
  }
  return donationInformation;
};

const doDownloadStudyConsent = async (study) => {
  let folderPath = FileUtil.DocumentDirectory + '/' + study.studyId;
  let filePath = folderPath + '/consent.pdf';
  await FileUtil.mkdir(folderPath);
  return await FileUtil.downloadFile(study.consentLinkDownload, filePath);
};

const DonationService = {
  DATA_SOURCE_INTACTIVE_TASK_TYPE,
  doGetUserInformation,
  doActiveBitmarkHealthData,
  doInactiveBitmarkHealthData,
  doJoinStudy,
  doLeaveStudy,
  doStudyTask,
  doDonateHealthData,
  doCompletedStudyTask,
  doBitmarkHealthData,
  doDownloadStudyConsent,
  getStudy,
};

export { DonationService };