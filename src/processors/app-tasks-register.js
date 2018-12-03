import { Platform, AppRegistry } from 'react-native';
import moment from 'moment';

import { AccountModel, FaceTouchId, BitmarkSDK, } from './../models';
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

const doLogin = async ({ phraseWords, enableTouchFaceId }) => {
  if (Platform.OS === 'ios' && config.isIPhoneX && enableTouchFaceId) {
    await FaceTouchId.authenticate();
  }
  await BitmarkSDK.requestSession(i18n.t('FaceTouchId_doOpenApp'));
  await AccountModel.doLogin(phraseWords, enableTouchFaceId);
  return await processing(DataProcessor.doLogin());
};

const doLogout = async () => {
  return await processing(DataProcessor.doLogout());
};
const doDeleteAccount = async (processingInfo) => {
  // TODO touchFaceIdMessage
  return await submitting(DataProcessor.doDeleteAccount(), processingInfo);
};

const doIssueFile = async ({ filePath, assetName, metadataList, quantity, processingInfo }) => {
  return await submitting(DataProcessor.doIssueFile(filePath, assetName, metadataList, quantity), processingInfo);
};

const doIssueMultipleFiles = async ({ listInfo, processingInfo }) => {
  return await submitting(DataProcessor.doIssueMultipleFiles(listInfo), processingInfo);
};


const doBitmarkHealthData = async ({ list, processingData }) => {
  // TODO touchFaceIdMessage
  return await submitting(DataProcessor.doBitmarkHealthData(list), processingData);
};

const doResetHealthDataTasks = async ({ list }) => {
  return await processing(DataProcessor.doResetHealthDataTasks(list));
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

const doAcceptEmailRecords = async ({ emailRecord, processingData }) => {
  return submitting(DataProcessor.doAcceptEmailRecords(emailRecord), processingData);
};

const doRejectEmailRecords = async ({ emailRecord }) => {
  return processing(DataProcessor.doRejectEmailRecords(emailRecord));
};

const doMigrateFilesToLocalStorage = async () => {
  return DataProcessor.doMigrateFilesToLocalStorage();
}
const doProcessEmailRecords = async ({ bitmarkAccountNumber, emailIssueRequestsFromAnEmail }) => {
  return AccountService.doProcessEmailRecords(bitmarkAccountNumber, emailIssueRequestsFromAnEmail);
};

const doCombineImages = async ({ images }) => {
  return processing(DataProcessor.doCombineImages(images));
};

const doTransferBitmark = async ({ bitmark, receiver }) => {
  // TODO touchFaceIdMessage
  return await processing(DataProcessor.doTransferBitmark(bitmark, receiver));
};

// ================================================================================================
// ================================================================================================
// ================================================================================================

let AppTasks = {
  doLogin,
  doLogout,
  doDeleteAccount,
  doIssueFile,
  doIssueMultipleFiles,
  doBitmarkHealthData,
  doResetHealthDataTasks,
  doGetBitmarkInformation,
  doDownloadAndShareLegal,
  doAcceptEmailRecords,
  doRejectEmailRecords,
  doMigrateFilesToLocalStorage,
  doProcessEmailRecords,
  doCombineImages,
  doTransferBitmark,
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