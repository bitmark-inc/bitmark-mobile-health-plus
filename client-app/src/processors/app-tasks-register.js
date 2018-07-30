import { Platform, AppRegistry } from 'react-native';
import moment from 'moment';

import { CommonModel, AccountModel, FaceTouchId, } from './../models';
import { EventEmitterService, } from './../services'
import { DataProcessor } from './data-processor';
import { ios } from '../configs';
import { DonationService } from '../services/donation-service';

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
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Authorize bitmark issuance.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doIssueFile(touchFaceIdSession, filePath, assetName, metadataList, quantity, isPublicAsset), processingInfo);
};

const doTransferBitmark = async ({ bitmark, receiver }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Please sign to send the bitmark.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doTransferBitmark(touchFaceIdSession, bitmark.id, receiver));
};

const doAcceptTransferBitmark = async ({ transferOffer, processingInfo }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Please sign to receive the bitmark.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doAcceptTransferBitmark(touchFaceIdSession, transferOffer), processingInfo);
};

const doAcceptAllTransfers = async ({ transferOffers, processingInfo }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Please sign to receive the bitmarks.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doAcceptAllTransfers(touchFaceIdSession, transferOffers), processingInfo);
};


const doCancelTransferBitmark = async ({ transferOfferId, faceTouchMessage }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId(faceTouchMessage || 'Please sign to cancel the bitmark send request.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doCancelTransferBitmark(touchFaceIdSession, transferOfferId));
};

const doRejectTransferBitmark = async ({ transferOffer, processingInfo }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Please sign to reject the bitmark transfer request.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doRejectTransferBitmark(touchFaceIdSession, transferOffer), processingInfo);
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
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId(`Please sign your bitmark issuance for your health data.`);
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doBitmarkHealthData(touchFaceIdSession, list), processingData);
};
const doDownloadStudyConsent = async ({ study }) => {
  return await processing(DonationService.doDownloadStudyConsent(study));
};

const doDownloadBitmark = async ({ bitmark, processingData }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Please sign to download asset.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doDownloadBitmark(touchFaceIdSession, bitmark), processingData);
};

const doTrackingBitmark = async ({ asset, bitmark }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Please sign to track this bitmark');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doTrackingBitmark(touchFaceIdSession, asset, bitmark));
};

const doStopTrackingBitmark = async ({ bitmark }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Please sign to stop tracking this bitmark.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doStopTrackingBitmark(touchFaceIdSession, bitmark));
}
const doRevokeIftttToken = async () => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Please sign to revoke access to your IFTTT.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doRevokeIftttToken(touchFaceIdSession));
};
const doIssueIftttData = async ({ iftttBitmarkFile, processingInfo }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Please sign your bitmark issuance for your IFTTT data.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doIssueIftttData(touchFaceIdSession, iftttBitmarkFile), processingInfo);
};

const doMigrateWebAccount = async ({ token }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Authorize your account migration.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doMigrateWebAccount(touchFaceIdSession, token));
};

const doSignInOnWebApp = async ({ token }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Sign in using your mobile device.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doSignInOnWebApp(touchFaceIdSession, token));
};

const doDecentralizedIssuance = async ({ token, encryptionKey, expiredTime }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Authorize bitmark issuance.');
  if (!touchFaceIdSession) {
    return null;
  }
  if (expiredTime < moment().toDate().getTime()) {
    return new Error('QR code is expired!');
  }
  return await processing(DataProcessor.doDecentralizedIssuance(touchFaceIdSession, token, encryptionKey));
};

const doDecentralizedTransfer = async ({ token, expiredTime }) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Please sign to send the bitmark.');
  if (!touchFaceIdSession) {
    return null;
  }
  if (expiredTime < moment().toDate().getTime()) {
    return new Error('QR code is expired!');
  }
  return await processing(DataProcessor.doDecentralizedTransfer(touchFaceIdSession, token));
};

// ================================================================================================
// ================================================================================================
// ================================================================================================

let AppTasks = {
  doLogin,
  doLogout,
  doIssueFile,
  doTransferBitmark,
  doAcceptTransferBitmark,
  doRejectTransferBitmark,
  doAcceptAllTransfers,
  doCancelTransferBitmark,
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
  doTrackingBitmark,
  doStopTrackingBitmark,
  doRevokeIftttToken,
  doIssueIftttData,
  doMigrateWebAccount,
  doSignInOnWebApp,
  doDecentralizedIssuance,
  doDecentralizedTransfer,
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