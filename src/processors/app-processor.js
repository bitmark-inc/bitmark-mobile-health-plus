import { Platform, AppRegistry } from 'react-native';
import moment from 'moment';
import { registerTasks } from './app-tasks-register';

import { AccountModel, FaceTouchId } from './models';
import { EventEmitterService, } from './services'
import { DataProcessor } from './data-processor';
import DeviceInfo from 'react-native-device-info';
import { config } from 'src/configs';
import { compareVersion, runPromiseWithoutError, asyncAlert } from 'src/utils';
import { CacheData } from './caches';

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

const showOfflineMessage = async () => {
  return await asyncAlert('', i18n.t('AppProcessor_offlineMessage'));
};
// ================================================================================================
// ================================================================================================
const doCreateNewAccount = async (enableTouchFaceId) => {
  if (!CacheData.networkStatus) {
    await showOfflineMessage();
    return;
  }
  if (Platform.OS === 'ios' && config.isIPhoneX && enableTouchFaceId) {
    await FaceTouchId.authenticate();
  }
  await AccountModel.doCreateAccount(enableTouchFaceId);
  return await processing(DataProcessor.doCreateAccount());
};

const doGetCurrentAccount = async () => {
  let userInfo = await processing(AccountModel.doGetCurrentAccount());
  return userInfo;
};

const doGeneratePhrase = async () => {
  let phraseInfo = await processing(AccountModel.doGeneratePhrase());
  return phraseInfo;
};

const doCheckPhraseWords = async (phraseWords) => {
  return await AccountModel.doCheckPhraseWords(phraseWords);
};


const doCheckFileToIssue = async (filePath) => {
  if (!CacheData.networkStatus) {
    await showOfflineMessage();
    return;
  }
  return await processing(DataProcessor.doCheckFileToIssue(filePath));
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
  if (!CacheData.networkStatus) {
    await showOfflineMessage();
    return;
  }
  return executeTask('doLogin', { phraseWords, enableTouchFaceId });
};

const doLogout = async () => {
  if (!CacheData.networkStatus) {
    await showOfflineMessage();
    return;
  }
  return executeTask('doLogout');
};

const doDeleteAccount = async (processingInfo) => {
  if (!CacheData.networkStatus) {
    await showOfflineMessage();
    return;
  }
  return executeTask('doDeleteAccount', { processingInfo });
};

const doIssueFile = async (filePath, assetName, metadataList, quantity, isPublicAsset, processingInfo) => {
  if (!CacheData.networkStatus) {
    await showOfflineMessage();
    return;
  }
  return executeTask('doIssueFile', { filePath, assetName, metadataList, quantity, isPublicAsset, processingInfo });
};

const doIssueMultipleFiles = async (listInfo, processingInfo) => {
  if (!CacheData.networkStatus) {
    await showOfflineMessage();
    return;
  }
  return executeTask('doIssueMultipleFiles', { listInfo, processingInfo });
};

const doBitmarkHealthData = async (list, processingData) => {
  if (!CacheData.networkStatus) {
    await showOfflineMessage();
    return;
  }
  return executeTask('doBitmarkHealthData', { list, processingData });
};

const doResetHealthDataTasks = async (list) => {
  if (!CacheData.networkStatus) {
    await showOfflineMessage();
    return;
  }
  return executeTask('doResetHealthDataTasks', { list });
};

const doGetBitmarkInformation = async (bitmarkId) => {
  if (!CacheData.networkStatus) {
    await showOfflineMessage();
    return;
  }
  return executeTask('doGetBitmarkInformation', { bitmarkId });
};

const doDownloadAndShareLegal = async (title, urlDownload) => {
  if (!CacheData.networkStatus) {
    await showOfflineMessage();
    return;
  }
  return executeTask('doDownloadAndShareLegal', { title, urlDownload });
};


const doCheckNoLongerSupportVersion = async () => {
  if (__DEV__) {
    return;
  }
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
      let lastPublicVersion = returnedData.app_versions.find(item => item.restricted_to_tags === false);
      let url = returnedData.app_versions[0].download_url;
      if (lastPublicVersion && DeviceInfo.getBuildNumber() < lastPublicVersion.version) {
        return url;
      }
    }
  }
};

const doAcceptEmailRecords = async (emailRecord, processingData) => {
  if (!CacheData.networkStatus) {
    await showOfflineMessage();
    return;
  }
  return executeTask('doAcceptEmailRecords', { emailRecord, processingData });
};

const doRejectEmailRecords = async (emailRecord) => {
  if (!CacheData.networkStatus) {
    await showOfflineMessage();
    return;
  }
  return executeTask('doRejectEmailRecords', { emailRecord });
};
const doProcessEmailRecords = async (bitmarkAccountNumber, emailIssueRequestsFromAnEmail) => {
  if (!CacheData.networkStatus) {
    await showOfflineMessage();
    return;
  }
  return executeTask('doProcessEmailRecords', { bitmarkAccountNumber, emailIssueRequestsFromAnEmail });
};

const doMigrateFilesToLocalStorage = async () => {
  if (!CacheData.networkStatus) {
    await showOfflineMessage();
    return;
  }
  return executeTask('doMigrateFilesToLocalStorage');
};

const doCombineImages = async (images) => {
  if (!CacheData.networkStatus) {
    await showOfflineMessage();
    return;
  }
  return executeTask('doCombineImages', { images });
};

const doTransferBitmark = async (bitmark, receiver) => {
  if (!CacheData.networkStatus) {
    await showOfflineMessage();
    return;
  }
  return executeTask('doTransferBitmark', { bitmark, receiver });
};

const doIssueMMR = async (data) => {
  if (!CacheData.networkStatus) {
    await showOfflineMessage();
    return;
  }
  return executeTask('doIssueMMR', { data });
};

// ================================================================================================
// ================================================================================================
// ================================================================================================

let AppProcessor = {
  doCreateNewAccount,
  doGeneratePhrase,
  doGetCurrentAccount,
  doCheckPhraseWords,
  doLogin,
  doLogout,
  doDeleteAccount,
  doCheckFileToIssue,
  doIssueFile,
  doIssueMultipleFiles,
  doRequireHealthKitPermission,
  doBitmarkHealthData,
  doResetHealthDataTasks,

  doGetBitmarkInformation,
  doStartBackgroundProcess,
  doDownloadAndShareLegal,

  doCheckNoLongerSupportVersion,
  doAcceptEmailRecords,
  doRejectEmailRecords,

  doMigrateFilesToLocalStorage,
  doProcessEmailRecords,
  doCombineImages,
  doTransferBitmark,
  showOfflineMessage,
  doIssueMMR,
}

export {
  AppProcessor,
}