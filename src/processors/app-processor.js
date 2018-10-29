import { Platform, AppRegistry } from 'react-native';
import moment from 'moment';
import { registerTasks } from './app-tasks-register';

import { CommonModel, AccountModel, FaceTouchId } from './../models';
import { AccountService, EventEmitterService, TransactionService } from './../services'
import { DataProcessor } from './data-processor';
import { config } from '../configs';
import { compareVersion } from '../utils';

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
  return DataProcessor.doRequireHealthKitPermission();
};

const doStartBackgroundProcess = async (justCreatedBitmarkAccount) => {
  return DataProcessor.doStartBackgroundProcess(justCreatedBitmarkAccount);
  // return await processing(DataProcessor.doStartBackgroundProcess(justCreatedBitmarkAccount));
};

// ================================================================================================
// ================================================================================================
const doLogin = async (phraseWords) => {
  return executeTask('doLogin', { phraseWords });
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
  return true;
};

const doReceivedAccessQRCode = async (token) => {
  return executeTask('doReceivedAccessQRCode', { token });
};

const doCancelGrantingAccess = async (token) => {
  return executeTask('doCancelGrantingAccess', { token });
};

const doRemoveGrantingAccess = async (grantee) => {
  return executeTask('doRemoveGrantingAccess', { grantee });
};

const doConfirmGrantingAccess = async (token, grantee, processingData) => {
  return executeTask('doConfirmGrantingAccess', { token, grantee, processingData });
};

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
  doCancelGrantingAccess,
  doConfirmGrantingAccess,
  doAcceptEmailRecords,
  doRejectEmailRecords,

  doMigrateFilesToLocalStorage,
  doProcessEmailRecords,
}

export {
  AppProcessor,
}