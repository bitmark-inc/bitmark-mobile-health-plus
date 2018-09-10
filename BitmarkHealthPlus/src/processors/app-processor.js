import { Platform, AppRegistry } from 'react-native';
import moment from 'moment';
import { registerTasks } from './app-tasks-register';

import { CommonModel, AccountModel, FaceTouchId } from './../models';
import { AccountService, EventEmitterService, TransactionService } from './../services'
import { DataProcessor } from './data-processor';
import { config } from '../configs';
import { compareVersion } from '../utils';
import { HealthKitService } from '../services/health-kit-service';

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
  if (Platform.OS === 'ios' && config.isIPhoneX) {
    await FaceTouchId.authenticate();
  }
  let touchFaceIdSession = await AccountModel.doCreateAccount();
  if (!touchFaceIdSession) {
    return null;
  }
  CommonModel.setFaceTouchSessionId(touchFaceIdSession);
  return await processing(DataProcessor.doCreateAccount(touchFaceIdSession));
};

const doGetCurrentAccount = async () => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Authorize access to your recovery phrase.');
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
  return await HealthKitService.initHealthKit();
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

const doDeleteAccount = async (processingInfo) => {
  return executeTask('doDeleteAccount', { processingInfo });
};

const doIssueFile = async (filePath, assetName, metadataList, quantity, isPublicAsset, processingInfo) => {
  return executeTask('doIssueFile', { filePath, assetName, metadataList, quantity, isPublicAsset, processingInfo });
};

const doBitmarkHealthData = async (list, processingData) => {
  return executeTask('doBitmarkHealthData', { list, processingData });
};
const doDownloadBitmark = async (bitmarkIdOrGrantedId, processingData) => {
  return executeTask('doDownloadBitmark', { bitmarkIdOrGrantedId, processingData });
};
const doDownloadHealthDataBitmark = async (bitmarkIdOrGrantedId, processingData) => {
  return executeTask('doDownloadHealthDataBitmark', { bitmarkIdOrGrantedId, processingData });
};

const doGetBitmarkInformation = async (bitmarkId) => {
  return executeTask('doGetBitmarkInformation', { bitmarkId });
};

const doDownloadAndShareLegal = async (title, urlDownload) => {
  return executeTask('doDownloadAndShareLegal', { title, urlDownload });
};

const doGrantingAccess = async () => {
  return executeTask('doGrantingAccess');
};

const doSelectAccountAccess = async (accountNumber) => {
  return executeTask('doSelectAccountAccess', { accountNumber });
};


const doCheckNoLongerSupportVersion = async () => {
  let data = await AccountModel.doTryGetAppVersion();
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

const doReceivedAccessQRCode = async (token) => {
  return executeTask('doReceivedAccessQRCode', { token });
};

const doRemoveGrantingAccess = async (token) => {
  return executeTask('doRemoveGrantingAccess', { token });
};

const doConfirmGrantingAccess = async (token, grantee) => {
  return executeTask('doConfirmGrantingAccess', { token, grantee });
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
  doDeleteAccount,
  doCreateSignatureData,
  doCheckFileToIssue,
  doIssueFile,
  doGetTransferOfferDetail,
  doRequireHealthKitPermission,
  doBitmarkHealthData,

  doGetBitmarkInformation,
  doDownloadBitmark,
  doDownloadHealthDataBitmark,
  doReloadUserData,
  doStartBackgroundProcess,
  doDownloadAndShareLegal,

  doCheckNoLongerSupportVersion,
  doGrantingAccess,
  doSelectAccountAccess,
  doReceivedAccessQRCode,
  doRemoveGrantingAccess,
  doConfirmGrantingAccess,
}

export {
  AppProcessor,
}