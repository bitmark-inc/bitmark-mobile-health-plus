import moment from 'moment';
import { DonationModel, CommonModel, AppleHealthKitModel } from '../models';

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
  let key = 0;
  if (bitmarkHealthDataTask && bitmarkHealthDataTask.list && bitmarkHealthDataTask.list.length > 0) {
    todoTasks.push({
      key,
      title: donationInformation.commonTasks[donationInformation.commonTaskIds.bitmark_health_data].title,
      description: donationInformation.commonTasks[donationInformation.commonTaskIds.bitmark_health_data].description,
      taskType: donationInformation.commonTaskIds.bitmark_health_data,
      number: bitmarkHealthDataTask.list.length,
      list: bitmarkHealthDataTask.list,
    });
    key++;
    totalTodoTask += bitmarkHealthDataTask.list.length;
  }
  if (donationInformation.joinedStudies && donationInformation.joinedStudies.length > 0) {
    donationInformation.joinedStudies.forEach(study => {
      if (study.tasks) {
        for (let taskType in study.tasks) {
          todoTasks.push({
            key,
            title: study.studyTasks[taskType].title,
            description: study.studyTasks[taskType].description,
            taskType,
            number: study.tasks[taskType].number,
            list: study.tasks[taskType].list
          });
          key++;
          totalTodoTask += study.tasks[taskType].number;
        }
      }
    });
  }
  if (donationInformation.dataSourceStatuses && donationInformation.dataSourceStatuses.length > 0) {
    for (let dataSourceStatus of donationInformation.dataSourceStatuses) {
      if (dataSourceStatus.status === 'Inactive' && dataSourceStatus.numberStudyRequired) {
        todoTasks.push({
          key,
          title: dataSourceStatus.title + ' data source inactive',
          description: 'Required by ' + dataSourceStatus.numberStudyRequired + (dataSourceStatus.numberStudyRequired > 1 ? ' studies' : ' study'),
          taskType: 'data-source-inactive',
          number: 1,
        });
        key++;
        totalTodoTask++;
      }
    }
  }
  donationInformation.todoTasks = todoTasks;
  donationInformation.totalTodoTask = totalTodoTask;

  let completedTasks = donationInformation.completedTasks || [];
  if (donationInformation.dataSourceInactiveCompletedTasks && donationInformation.dataSourceInactiveCompletedTasks.length > 0) {
    for (let completedEnableDataSource of donationInformation.dataSourceInactiveCompletedTasks) {
      todoTasks.push({
        key: completedTasks.length + 1,
        title: completedEnableDataSource.title,
        description: completedEnableDataSource.description,
        completedDate: moment(completedEnableDataSource.completedDate),
        taskType: 'data-source-inactive',
      });
      key++;
    }
  }
  donationInformation.completedTasks = completedTasks;

  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION, donationInformation);
  return donationInformation;
}

const doRegisterUserInformation = async (touchFaceIdSession, bitmarkAccountNumber, ) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  if (!signatureData) {
    return null;
  }
  let donationInformation = await DonationModel.doRegisterUserInformation(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
  return await doLoadDonationTask(donationInformation);
};

const doDeregisterUserInformation = async (touchFaceIdSession, bitmarkAccountNumber, ) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  if (!signatureData) {
    return null;
  }
  let donationInformation = await DonationModel.doDeregisterUserInformation(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
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

const doCompleteTask = async (touchFaceIdSession, bitmarkAccountNumber, taskType, completedAt, studyId, txid) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  if (!signatureData) {
    return null;
  }
  let donationInformation = await DonationModel.doCompleteTask(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, taskType, completedAt, studyId, txid);
  return await doLoadDonationTask(donationInformation);
};

const doGetUserInformation = async (bitmarkAccountNumber) => {
  let donationInformation = await DonationModel.doGetUserInformation(bitmarkAccountNumber);
  return await doLoadDonationTask(donationInformation);
};

const DonationService = {
  doGetUserInformation,
  doRegisterUserInformation,
  doDeregisterUserInformation,
  doCompleteTask,
  doJoinStudy,
  doLeaveStudy,
};

export { DonationService };