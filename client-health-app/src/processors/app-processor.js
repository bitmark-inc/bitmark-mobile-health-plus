import { Platform, AppRegistry } from 'react-native';
import moment from 'moment';
import { registerTasks } from './app-tasks-register';

import { CommonModel, AccountModel, FaceTouchId, AppleHealthKitModel, DonationModel } from './../models';
import { AccountService, EventEmitterService, TransactionService } from './../services'
import { DataProcessor } from './data-processor';
import { ios } from '../configs';

registerTasks();
// ================================================================================================
// ================================================================================================

let commonProcess = (promise, successCallback, errorCallback) => {
  let startAt = moment().toDate().getTime();
  let check2Seconds = (done) => {
    let endAt = moment().toDate().getTime();
    let space = startAt + 2000 - endAt;
    if (space > 0) {
      setTimeout(done, space);
    } else {
      done();
    }
  };

  promise.then((data) => {
    check2Seconds(() => successCallback(data));
  }).catch(error => {
    check2Seconds(() => errorCallback(error));
  });
};

let processing = (promise) => {
  EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, true);
  return new Promise((resolve, reject) => {
    commonProcess(promise, (data) => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
      resolve(data);
    }, (error) => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
      reject(error);
    })
  });
};

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
const doCreateNewAccount = async () => {
  if (Platform.OS === 'ios' && ios.config.isIPhoneX) {
    await FaceTouchId.authenticate();
  }
  let touchFaceIdSession = await AccountModel.doCreateAccount();
  if (!touchFaceIdSession) {
    return null;
  }
  CommonModel.setFaceTouchSessionId(touchFaceIdSession);
  return await processing(DataProcessor.doCreateAccount(touchFaceIdSession));
};

const doGetCurrentAccount = async (touchFaceIdMessage) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId(touchFaceIdMessage);
  if (!touchFaceIdSession) {
    return null;
  }
  let userInfo = await processing(AccountModel.doGetCurrentAccount(touchFaceIdSession));
  return userInfo;
};

const doCheck24Words = async (phrase24Words) => {
  return await AccountModel.doCheck24Words(phrase24Words);
};

const doGetTransferOfferDetail = async (transferOfferId) => {
  return await processing(TransactionService.doGetTransferOfferDetail(transferOfferId));
};

const doCheckFileToIssue = async (filePath) => {
  return await processing(DataProcessor.doCheckFileToIssue(filePath));
};

const doCreateSignatureData = async (touchFaceIdMessage, newSession) => {
  if (newSession) {
    let sessionId = await CommonModel.doStartFaceTouchSessionId(touchFaceIdMessage);
    if (!sessionId) {
      return null;
    }
  }
  return await processing(AccountService.doCreateSignatureData(touchFaceIdMessage));
};

const doReloadUserData = async () => {
  return await DataProcessor.doReloadUserData();
};

const doRequireHealthKitPermission = async () => {
  let allDataTypes = await DonationModel.doGetAllDataTypes();
  console.log('allDataTypes :', allDataTypes);
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

const doDownloadAndShareLegal = async (title, message, urlDownload) => {
  return executeTask('doDownloadAndShareLegal', { title, message, urlDownload });
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
  doGetTransferOfferDetail,
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
}

export {
  AppProcessor,
}