import { Platform, AppRegistry } from 'react-native';
import moment from 'moment';
import { registerTasks } from './app-tasks-register';

import { CommonModel, AccountModel, FaceTouchId } from './../models';
import { AccountService, EventEmitterService, } from './../services'
import { DataProcessor } from './data-processor';
import { config } from '../configs';
import { compareVersion, runPromiseWithoutError } from '../utils';
import DeviceInfo from 'react-native-device-info';

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
const doCreateNewAccount = async (enableTouchFaceId) => {
  if (Platform.OS === 'ios' && config.isIPhoneX && enableTouchFaceId) {
    await FaceTouchId.authenticate();
  }
  let touchFaceIdSession = await AccountModel.doCreateAccount(enableTouchFaceId);
  if (!touchFaceIdSession) {
    return null;
  }
  CommonModel.setFaceTouchSessionId(touchFaceIdSession);
  return await processing(DataProcessor.doCreateAccount(touchFaceIdSession));
};

const doGetCurrentAccount = async (canUseCurrentTouchFaceId) => {
  let touchFaceIdSession;
  if (canUseCurrentTouchFaceId) {
    touchFaceIdSession = CommonModel.getFaceTouchSessionId();
  }
  if (!touchFaceIdSession) {
    touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId(i18n.t('FaceTouchId_doGetCurrentAccount'));
  }
  if (!touchFaceIdSession) {
    return null;
  }
  let userInfo = await processing(AccountModel.doGetCurrentAccount(touchFaceIdSession));
  return userInfo;
};

const doCheckPhraseWords = async (phraseWords) => {
  return await AccountModel.doCheckPhraseWords(phraseWords);
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
  return DataProcessor.doRequireHealthKitPermission();
};

const doStartBackgroundProcess = async (justCreatedBitmarkAccount) => {
  return DataProcessor.doStartBackgroundProcess(justCreatedBitmarkAccount);
  // return await processing(DataProcessor.doStartBackgroundProcess(justCreatedBitmarkAccount));
};

// ================================================================================================
// ================================================================================================
const doLogin = async (phraseWords, enableTouchFaceId) => {
  return executeTask('doLogin', { phraseWords, enableTouchFaceId });
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

const doIssueMultipleFiles = async (listInfo, processingInfo) => {
  return executeTask('doIssueMultipleFiles', { listInfo, processingInfo });
};

const doBitmarkHealthData = async (list, processingData) => {
  return executeTask('doBitmarkHealthData', { list, processingData });
};
const doDownloadBitmark = async (bitmarkIdOrGrantedId, assetId, processingData) => {
  return executeTask('doDownloadBitmark', { bitmarkIdOrGrantedId, assetId, processingData });
};
const doDownloadHealthDataBitmark = async (bitmarkIdOrGrantedId, assetId, processingData) => {
  return executeTask('doDownloadHealthDataBitmark', { bitmarkIdOrGrantedId, assetId, processingData });
};

const doGetBitmarkInformation = async (bitmarkId) => {
  return executeTask('doGetBitmarkInformation', { bitmarkId });
};

const doDownloadAndShareLegal = async (title, urlDownload) => {
  return executeTask('doDownloadAndShareLegal', { title, urlDownload });
};

// const doGrantingAccess = async () => {
//   return executeTask('doGrantingAccess');
// };

// const doSelectAccountAccess = async (accountNumber) => {
//   return executeTask('doSelectAccountAccess', { accountNumber });
// };


const doCheckNoLongerSupportVersion = async () => {
  if (DeviceInfo.getBundleId() === 'com.bitmark.healthplus') {
    let data = await AccountModel.doTryGetAppVersion();
    if (data && data.version && data.version.minimum_supported_version) {
      let minimumSupportedVersion = data.version.minimum_supported_version;
      let currentVersion = DataProcessor.getApplicationVersion();
      if (compareVersion(minimumSupportedVersion, currentVersion) > 0) {
        return config.appLink;
      }
    }
  } else if (DeviceInfo.getBundleId() === 'com.bitmark.healthplus.inhouse' ||
    DeviceInfo.getBundleId() === 'com.bitmark.healthplus.beta') {
    let appId = DeviceInfo.getBundleId() === 'com.bitmark.healthplus.inhouse'
      ? '2651f17048b54ca1a27aa6c959efbf33' // dev app
      : '953845cde6b940cea3adac0ff1103f8c';// alpha app

    let token = '828e099f430442aa924a8a3a87b3f14b';
    let returnedData = await runPromiseWithoutError(AccountModel.doGetHockeyAppVersion(appId, token));
    if (returnedData && !returnedData.error && returnedData.app_versions && returnedData.app_versions.length > 0) {
      let url = returnedData.app_versions[0].download_url;
      if (DeviceInfo.getBuildNumber() < returnedData.app_versions[0].version && returnedData.app_versions[0].restricted_to_tags === false) {
        return url;
      }
    }
  }
};

// const doReceivedAccessQRCode = async (token) => {
//   return executeTask('doReceivedAccessQRCode', { token });
// };

// const doCancelGrantingAccess = async (token) => {
//   return executeTask('doCancelGrantingAccess', { token });
// };

// const doRemoveGrantingAccess = async (grantee) => {
//   return executeTask('doRemoveGrantingAccess', { grantee });
// };

// const doConfirmGrantingAccess = async (token, grantee, processingData) => {
//   return executeTask('doConfirmGrantingAccess', { token, grantee, processingData });
// };

const doAcceptEmailRecords = async (emailRecord, processingData) => {
  return executeTask('doAcceptEmailRecords', { emailRecord, processingData });
};

const doRejectEmailRecords = async (emailRecord) => {
  return executeTask('doRejectEmailRecords', { emailRecord });
};
const doProcessEmailRecords = (bitmarkAccountNumber, emailIssueRequestsFromAnEmail) => {
  return executeTask('doProcessEmailRecords', { bitmarkAccountNumber, emailIssueRequestsFromAnEmail });
};

const doMigrateFilesToLocalStorage = async () => {
  return executeTask('doMigrateFilesToLocalStorage');
};

const doCombineImages = async (images) => {
  return executeTask('doCombineImages', { images });
};

const doTransferBitmark = async (bitmark, receiver) => {
  return executeTask('doTransferBitmark', { bitmark, receiver });
};

// ================================================================================================
// ================================================================================================
// ================================================================================================

let AppProcessor = {
  doCreateNewAccount,
  doGetCurrentAccount,
  doCheckPhraseWords,
  doLogin,
  doLogout,
  doDeleteAccount,
  doCreateSignatureData,
  doCheckFileToIssue,
  doIssueFile,
  doIssueMultipleFiles,
  doRequireHealthKitPermission,
  doBitmarkHealthData,

  doGetBitmarkInformation,
  doDownloadBitmark,
  doDownloadHealthDataBitmark,
  doReloadUserData,
  doStartBackgroundProcess,
  doDownloadAndShareLegal,

  doCheckNoLongerSupportVersion,
  // doGrantingAccess,
  // doSelectAccountAccess,
  // doReceivedAccessQRCode,
  // doRemoveGrantingAccess,
  // doCancelGrantingAccess,
  // doConfirmGrantingAccess,
  doAcceptEmailRecords,
  doRejectEmailRecords,

  doMigrateFilesToLocalStorage,
  doProcessEmailRecords,
  doCombineImages,
  doTransferBitmark,
}

export {
  AppProcessor,
}