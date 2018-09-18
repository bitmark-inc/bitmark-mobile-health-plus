import { Platform, AppRegistry } from 'react-native';
import moment from 'moment';
import { registerTasks } from './app-tasks-register';

import { CommonModel, AccountModel, FaceTouchId, AppleHealthKitModel, DonationModel, NotificationModel } from './../models';
import { AccountService, EventEmitterService, TransactionService } from './../services'
import { DataProcessor } from './data-processor';
import { ios } from '../configs';
import { compareVersion } from '../utils';

registerTasks();
// ================================================================================================
// ================================================================================================

const executeTask = (taskKey, data) => {
  let taskId = `${taskKey}_${moment().toDate().getTime()}`;
  data = data || {};
  data.taskId = taskId;
  return new Promise((resolve, reject) => {
    EventEmitterService.on(`${EventEmitterService.events.APP_TASK}${taskId}`, ({ ok, result, error }) => {
      EventEmitterService.remove(`${EventEmitterService.events.APP_TASK}${taskId}`);
      if (ok) {
        resolve(result);
      } else {
        reject(error);
      }
    });
    AppRegistry.startHeadlessTask(taskId, taskKey, data);
  });
}
// ================================================================================================
// ================================================================================================


const doCheck24Words = async (phrase24Words) => {
  return await AccountModel.doCheck24Words(phrase24Words);
};



const doReloadUserData = async () => {
  return await DataProcessor.doReloadUserData();
};

const doRequireHealthKitPermission = async () => {
  let allDataTypes = await DonationModel.doGetAllDataTypes();
  if (allDataTypes) {
    await AppleHealthKitModel.initHealthKit(allDataTypes);
  }
};

const doStartBackgroundProcess = async (justCreatedBitmarkAccount) => {
  return DataProcessor.doStartBackgroundProcess(justCreatedBitmarkAccount);
  // return await processing(DataProcessor.doStartBackgroundProcess(justCreatedBitmarkAccount));
};

// ================================================================================================
// ================================================================================================

const doCreateNewAccount = async () => {
  return executeTask('doCreateNewAccount');
};

const doGetCurrentAccount = async (touchFaceIdMessage) => {
  return executeTask('doGetCurrentAccount', { touchFaceIdMessage });
};

const doCheckFileToIssue = async (filePath) => {
  return executeTask('doCheckFileToIssue', { filePath });
};

const doCreateSignatureData = async (touchFaceIdMessage, newSession) => {
  return executeTask('doCreateSignatureData', { touchFaceIdMessage, newSession });
};

const doLogin = async (phrase24Words) => {
  return executeTask('doLogin', { phrase24Words });
};

const doLogout = async () => {
  return executeTask('doLogout');
};

const doIssueFile = async (filePath, assetName, metadataList, quantity, isPublicAsset, processingInfo) => {
  return executeTask('doIssueFile', { filePath, assetName, metadataList, quantity, isPublicAsset, processingInfo });
};

const doActiveBitmarkHealthData = async (activeBitmarkHealthDataAt) => {
  return executeTask('doActiveBitmarkHealthData', { activeBitmarkHealthDataAt });
};

const doInactiveBitmarkHealthData = async () => {
  return executeTask('doInactiveBitmarkHealthData');
};

const doJoinStudy = async (studyId) => {
  return executeTask('doJoinStudy', { studyId });
};
const doLeaveStudy = async (studyId) => {
  return executeTask('doLeaveStudy', { studyId });
};
const doStudyTask = async (study, taskType) => {
  return executeTask('doStudyTask', { study, taskType });
};
const doCompletedStudyTask = async (study, taskType, result) => {
  return executeTask('doCompletedStudyTask', { study, taskType, result });
};
const doDonateHealthData = async (study, list, processingData) => {
  return executeTask('doDonateHealthData', { study, list, processingData });
};
const doBitmarkHealthData = async (list, processingData) => {
  return executeTask('doBitmarkHealthData', { list, processingData });
};
const doDownloadStudyConsent = async (study) => {
  return executeTask('doDownloadStudyConsent', { study });
};

const doDownloadBitmark = async (bitmarkId, processingData) => {
  return executeTask('doDownloadBitmark', { bitmarkId, processingData });
};

const doGetBitmarkInformation = async (bitmarkId) => {
  return executeTask('doGetBitmarkInformation', { bitmarkId });
};

const doDownloadAndShareLegal = async (title, urlDownload) => {
  return executeTask('doDownloadAndShareLegal', { title, urlDownload });
};

const doCheckNoLongerSupportVersion = async () => {
  let data = await NotificationModel.doTryGetAppVersion();
  if (data && data.version && data.version.minimum_supported_version) {
    let minimumSupportedVersion = data.version.minimum_supported_version;
    let currentVersion = DataProcessor.getApplicationVersion();
    if (compareVersion(minimumSupportedVersion, currentVersion) > 0) {
      return false;
    }
    return true;
  }
  return false;
};

// ================================================================================================
// ================================================================================================
// ================================================================================================

let AppProcessor = {
  doCreateNewAccount,
  doGetCurrentAccount,
  doCheck24Words,
  doLogin,
  doLogout,
  doCreateSignatureData,
  doCheckFileToIssue,
  doIssueFile,
  doRequireHealthKitPermission,
  doActiveBitmarkHealthData,
  doInactiveBitmarkHealthData,
  doJoinStudy,
  doLeaveStudy,
  doStudyTask,
  doCompletedStudyTask,
  doDonateHealthData,
  doBitmarkHealthData,
  doDownloadStudyConsent,

  doGetBitmarkInformation,
  doDownloadBitmark,
  doReloadUserData,
  doStartBackgroundProcess,
  doDownloadAndShareLegal,

  doCheckNoLongerSupportVersion,
}

export {
  AppProcessor,
}