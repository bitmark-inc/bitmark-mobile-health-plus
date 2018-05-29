import { AppRegistry } from 'react-native';
import moment from 'moment';
import { EventEmitterService, } from './../services'
import { registerTasks } from './app-functional';

registerTasks();
// ================================================================================================
// ================================================================================================
const executeTask = (takKey, data) => {
  let taskId = `${takKey}_${moment().toDate().getTime()}`;
  data = data || {};
  data.taskId = taskId;
  return new Promise((resolve, reject) => {
    EventEmitterService.on(`${EventEmitterService.events.APP_TASK}${taskId}`, (ok, result, error) => {
      EventEmitterService.remove(`${EventEmitterService.events.APP_TASK}${taskId}`);
      if (ok) {
        resolve(result);
      } else {
        reject(error);
      }
    });
    AppRegistry.startHeadlessTask(taskId, takKey, data);
  });
}
// ================================================================================================
// ================================================================================================
const doCreateNewAccount = () => {
  return executeTask('doCreateNewAccount');
};

const doGetCurrentAccount = async (touchFaceIdMessage) => {
  return executeTask('doGetCurrentAccount', { touchFaceIdMessage });
};

const doCheck24Words = async (phrase24Words) => {
  return executeTask('doCheck24Words', { phrase24Words });
};

const doLogin = async (phrase24Words) => {
  return executeTask('doLogin', { phrase24Words });
};

const doLogout = async () => {
  return executeTask('doLogout');
};

const doCreateSignatureData = async (touchFaceIdMessage, newSession) => {
  return executeTask('doCreateSignatureData', { touchFaceIdMessage, newSession });
};

const doReloadUserData = async () => {
  return executeTask('doReloadUserData');
};

const doReloadDonationInformation = async () => {
  return executeTask('doReloadDonationInformation');
};

const doGetTransferOfferDetail = async (transferOfferId) => {
  return executeTask('doGetTransferOfferDetail', { transferOfferId });
};

const doCheckFileToIssue = async (filePath) => {
  return executeTask('doGetTransferOfferDetail', { filePath });
};

const doIssueFile = async (filePath, assetName, metadataList, quantity, isPublicAsset, processingInfo) => {
  return executeTask('doGetProvenance', { filePath, assetName, metadataList, quantity, isPublicAsset, processingInfo });
};

const doGetProvenance = async (bitmark) => {
  return executeTask('doGetProvenance', { bitmark });
};

const doTransferBitmark = async (bitmark, receiver) => {
  return executeTask('doTransferBitmark', { bitmark, receiver });
};

const doAcceptTransferBitmark = async (transferOffer, processingInfo) => {
  return executeTask('doAcceptTransferBitmark', { transferOffer, processingInfo });
};

const doAcceptAllTransfers = async (transferOffers, processingInfo) => {
  return executeTask('doAcceptAllTransfers', { transferOffers, processingInfo });
};

const doCancelTransferBitmark = async (transferOfferId) => {
  return executeTask('doCancelTransferBitmark', { transferOfferId });
};

const doRejectTransferBitmark = async (transferOffer, processingInfo) => {
  return executeTask('doCancdoRejectTransferBitmarkelTransferBitmark', { transferOffer, processingInfo });
};

const doRequirePermission = async () => {
  return executeTask('doRequirePermission');
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

const doDownloadBitmark = async (bitmark, processingData) => {
  return executeTask('doDownloadBitmark', { bitmark, processingData });
};

const doTrackingBitmark = async (asset, bitmark) => {
  return executeTask('doTrackingBitmark', { asset, bitmark });
};

const doStopTrackingBitmark = async (bitmark) => {
  return executeTask('doStopTrackingBitmark', { bitmark });
}
const doRevokeIftttToken = async () => {
  return executeTask('doRevokeIftttToken');
};
const doIssueIftttData = async (iftttBitmarkFile, processingInfo) => {
  return executeTask('doIssueIftttData', { iftttBitmarkFile, processingInfo });
};

const doMigrateWebAccount = async (token) => {
  return executeTask('doMigrateWebAccount', { token });
};

const doSignInOnWebApp = async (token) => {
  return executeTask('doSignInOnWebApp', { token });
};

const doGetAllTransfersOffers = async () => {
  return executeTask('doGetAllTransfersOffers');
};

const doStartBackgroundProcess = async (justCreatedBitmarkAccount) => {
  return executeTask('doStartBackgroundProcess', { justCreatedBitmarkAccount });
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
  doGetProvenance,
  doGetTransferOfferDetail,
  doTransferBitmark,
  doAcceptTransferBitmark,
  doRejectTransferBitmark,
  doAcceptAllTransfers,
  doCancelTransferBitmark,
  doRequirePermission,
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
  doReloadUserData,
  doReloadDonationInformation,
  doMigrateWebAccount,
  doSignInOnWebApp,
  doGetAllTransfersOffers,

  doStartBackgroundProcess,
}

export {
  AppProcessor,
}