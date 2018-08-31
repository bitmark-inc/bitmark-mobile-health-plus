import { Platform, AppRegistry } from 'react-native';
import moment from 'moment';

import { CommonModel, AccountModel, FaceTouchId, } from './../models';
import { EventEmitterService, BitmarkService, } from './../services'
import { DataProcessor } from './data-processor';
import { ios } from '../configs';
import { DonationService } from '../services/donation-service';
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

const doLogin = async ({ phrase24Words }) => {
  if (Platform.OS === 'ios' && ios.config.isIPhoneX) {
    await FaceTouchId.authenticate();
  }
  let touchFaceIdSession = await AccountModel.doLogin(phrase24Words);
  if (!touchFaceIdSession) {
    return null;
  }
  CommonModel.setFaceTouchSessionId(touchFaceIdSession);
  return await processing(DataProcessor.doLogin(touchFaceIdSession));
};

const doLogout = async () => {
  return await processing(DataProcessor.doLogout());
};

const doIssueFile = async ({ filePath, assetName, metadataList, quantity, isPublicAsset, processingInfo }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Your fingerprint signature is required.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doIssueFile(touchFaceIdSession, filePath, assetName, metadataList, quantity, isPublicAsset), processingInfo);
};

const doActiveBitmarkHealthData = async ({ activeBitmarkHealthDataAt }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Authorize bitmark health data.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doActiveBitmarkHealthData(touchFaceIdSession, activeBitmarkHealthDataAt));
};

const doInactiveBitmarkHealthData = async () => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Please sign to remove bitmark health data.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doInactiveBitmarkHealthData(touchFaceIdSession));
};

const doJoinStudy = async ({ studyId }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Please sign to join study.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doJoinStudy(touchFaceIdSession, studyId));
};
const doLeaveStudy = async ({ studyId }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Please sign to opt out study.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doLeaveStudy(touchFaceIdSession, studyId));
};
const doStudyTask = async ({ study, taskType }) => {
  let result = await DonationService.doStudyTask(study, taskType);
  if (!result) {
    return null;
  }
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Please sign your data donation for this task.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doCompletedStudyTask(touchFaceIdSession, study, taskType, result));
};
const doCompletedStudyTask = async ({ study, taskType, result }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Please sign your data donation for this task.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doCompletedStudyTask(touchFaceIdSession, study, taskType, result));
};
const doDonateHealthData = async ({ study, list, processingData }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId(`Please sign your data donation for ${study.title}.`);
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doDonateHealthData(touchFaceIdSession, study, list), processingData);
};
const doBitmarkHealthData = async ({ list, processingData }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId(`Your fingerprint signature is required.`);
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doBitmarkHealthData(touchFaceIdSession, list), processingData);
};
const doDownloadStudyConsent = async ({ study }) => {
  return await processing(DonationService.doDownloadStudyConsent(study));
};

const doDownloadBitmark = async ({ bitmarkId, processingData }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Please sign to access private health data.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doDownloadBitmark(touchFaceIdSession, bitmarkId), processingData);
};

const doGetBitmarkInformation = async ({ bitmarkId }) => {
  let donationInformation = await DataProcessor.doGetDonationInformation();
  let { asset, bitmark } = await processing(BitmarkService.doGetBitmarkInformation(bitmarkId));
  return { asset, bitmark, donationInformation };
};

const doDownloadAndShareLegal = async ({ title, urlDownload }) => {
  let folderPath = FileUtil.DocumentDirectory + '/legal';
  let filePath = folderPath + '/' + title + '.pdf';
  console.log('filePath :', filePath);
  await FileUtil.mkdir(folderPath);
  await processing(FileUtil.downloadFile(urlDownload, filePath));
  return filePath;
};


// ================================================================================================
// ================================================================================================
// ================================================================================================

let AppTasks = {
  doLogin,
  doLogout,
  doIssueFile,
  doActiveBitmarkHealthData,
  doInactiveBitmarkHealthData,
  doJoinStudy,
  doLeaveStudy,
  doStudyTask,
  doCompletedStudyTask,
  doDonateHealthData,
  doBitmarkHealthData,
  doDownloadStudyConsent,
  doDownloadBitmark,
  doGetBitmarkInformation,
  doDownloadAndShareLegal,
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