import { Platform, AppRegistry } from 'react-native';
import moment from 'moment';

import { CommonModel, AccountModel, FaceTouchId, } from './../models';
import { EventEmitterService, BitmarkService, AccountService, } from './../services'
import { DataProcessor } from './data-processor';
import { config } from '../configs';
import { FileUtil } from '../utils';

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

let submitting = (promise, processingData) => {
  EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, processingData || { indicator: true });
  return new Promise((resolve, reject) => {
    commonProcess(promise, (data) => {
      EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, null);
      resolve(data);
    }, (error) => {
      EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, null);
      reject(error);
    });
  });
};

// ================================================================================================
// ================================================================================================

const doLogin = async ({ phraseWords }) => {
  if (Platform.OS === 'ios' && config.isIPhoneX) {
    await FaceTouchId.authenticate();
  }
  let touchFaceIdSession = await AccountModel.doLogin(phraseWords);
  if (!touchFaceIdSession) {
    return null;
  }
  CommonModel.setFaceTouchSessionId(touchFaceIdSession);
  return await processing(DataProcessor.doLogin(touchFaceIdSession));
};

const doLogout = async () => {
  return await processing(DataProcessor.doLogout());
};
const doDeleteAccount = async (processingInfo) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId(i18n.t('FaceTouchId_doDeleteAccount'));
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doDeleteAccount(touchFaceIdSession), processingInfo);
};

const doIssueFile = async ({ filePath, assetName, metadataList, quantity, isPublicAsset, processingInfo }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId(i18n.t('FaceTouchId_doIssueFile'));
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doIssueFile(touchFaceIdSession, filePath, assetName, metadataList, quantity, isPublicAsset), processingInfo);
};

const doBitmarkHealthData = async ({ list, processingData }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId(i18n.t('FaceTouchId_doBitmarkHealthData'));
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doBitmarkHealthData(touchFaceIdSession, list), processingData);
};

const doDownloadBitmark = async ({ bitmarkIdOrGrantedId, assetId, processingData }) => {
  // let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Please sign to access private health data.');
  // if (!touchFaceIdSession) {
  //   return null;
  // }
  let touchFaceIdSession = CommonModel.getFaceTouchSessionId();
  return await submitting(DataProcessor.doDownloadBitmark(touchFaceIdSession, bitmarkIdOrGrantedId, assetId), processingData);
};

const doDownloadHealthDataBitmark = async ({ bitmarkIdOrGrantedId, assetId, processingData }) => {
  // let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Please sign to access private health data.');
  // if (!touchFaceIdSession) {
  //   return null;
  // }
  let touchFaceIdSession = CommonModel.getFaceTouchSessionId();
  return await submitting(DataProcessor.doDownloadHealthDataBitmark(touchFaceIdSession, bitmarkIdOrGrantedId, assetId), processingData);
};


const doGetBitmarkInformation = async ({ bitmarkId }) => {
  let { asset, bitmark } = await processing(BitmarkService.doGetBitmarkInformation(bitmarkId));
  return { asset, bitmark };
};

const doDownloadAndShareLegal = async ({ title, urlDownload }) => {
  let folderPath = FileUtil.DocumentDirectory + '/legal';
  let filePath = folderPath + '/' + title + '.pdf';
  console.log('filePath :', filePath);
  await FileUtil.mkdir(folderPath);
  await processing(FileUtil.downloadFile(urlDownload, filePath));
  return filePath;
};

const doGrantingAccess = async () => {
  return processing(DataProcessor.doGrantingAccess());
};

const doSelectAccountAccess = async ({ accountNumber }) => {
  return processing(DataProcessor.doSelectAccountAccess(accountNumber));
};

const doReceivedAccessQRCode = async ({ token }) => {
  return processing(DataProcessor.doReceivedAccessQRCode(token));
};
const doRemoveGrantingAccess = async ({ grantee }) => {
  return processing(DataProcessor.doRemoveGrantingAccess(grantee));
};
const doCancelGrantingAccess = async ({ token }) => {
  return processing(DataProcessor.doCancelGrantingAccess(token));
};

const doConfirmGrantingAccess = async ({ token, grantee, processingData }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId(i18n.t('FaceTouchId_doConfirmGrantingAccess'));
  if (!touchFaceIdSession) {
    return null;
  }
  return submitting(DataProcessor.doConfirmGrantingAccess(touchFaceIdSession, token, grantee), processingData);
};

const doAcceptEmailRecords = async ({ emailRecord, processingData }) => {
  let touchFaceIdSession = CommonModel.getFaceTouchSessionId();
  return submitting(DataProcessor.doAcceptEmailRecords(touchFaceIdSession, emailRecord), processingData);
};

const doRejectEmailRecords = async ({ emailRecord }) => {
  return processing(DataProcessor.doRejectEmailRecords(emailRecord));
};

const doMigrateFilesToLocalStorage = async () => {
  return processing(DataProcessor.doMigrateFilesToLocalStorage());
}
const doProcessEmailRecords = async ({ bitmarkAccountNumber, emailIssueRequestsFromAnEmail }) => {
  return AccountService.doProcessEmailRecords(bitmarkAccountNumber, emailIssueRequestsFromAnEmail);
};


// ================================================================================================
// ================================================================================================
// ================================================================================================

let AppTasks = {
  doLogin,
  doLogout,
  doDeleteAccount,
  doIssueFile,
  doBitmarkHealthData,
  doDownloadBitmark,
  doDownloadHealthDataBitmark,
  doGetBitmarkInformation,
  doDownloadAndShareLegal,
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
};

let registeredTasks = {};

const registerTasks = () => {
  for (let taskKey in AppTasks) {
    if (taskKey && AppTasks[taskKey] && !registeredTasks[taskKey]) {
      AppRegistry.registerHeadlessTask(taskKey, () => {
        return (taskData) =>
          AppTasks[taskKey](taskData).then(result => {
            EventEmitterService.emit(`${EventEmitterService.events.APP_TASK}${taskData.taskId}`, { ok: true, result });
          }).catch(error => {
            EventEmitterService.emit(`${EventEmitterService.events.APP_TASK}${taskData.taskId}`, { ok: false, error });
          });
      });
    }
  }
}
export {
  registerTasks,
}