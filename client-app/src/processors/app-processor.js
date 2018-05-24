import { Platform } from 'react-native';
import moment from 'moment';

import { CommonModel, AccountModel, FaceTouchId, AppleHealthKitModel } from './../models';
import { AccountService, BitmarkService, EventEmitterService, TransactionService } from './../services'
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

let submitting = (promise, processingData, successData, errorData) => {
  EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, processingData || { indicator: true });
  return new Promise((resolve, reject) => {
    commonProcess(promise, (data) => {
      if (successData) {
        EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, successData);
        setTimeout(() => {
          EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, null);
          resolve(data);
        }, 2000);
      } else {
        EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, null);
        resolve(data);
      }
    }, (error) => {
      if (errorData) {
        EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, errorData);
        setTimeout(() => {
          EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, null);
          reject(error);
        }, 2000);
      } else {
        EventEmitterService.emit(EventEmitterService.events.APP_SUBMITTING, null);
        reject(error);
      }
    });
  });
};

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
  return await processing(AccountService.doGetCurrentAccount(touchFaceIdSession));
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

const doLogin = async (phrase24Words) => {
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

const doReloadDonationInformation = async () => {
  return await DataProcessor.doReloadDonationInformation();
};

const doGetTransferOfferDetail = async (transferOfferId) => {
  return await processing(TransactionService.doGetTransferOfferDetail(transferOfferId));
};


const doCheckFileToIssue = async (filePath) => {
  return await processing(BitmarkService.doCheckFileToIssue(filePath));
};

const doIssueFile = async (filePath, assetName, metadataList, quantity, processingInfo, successInfo) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Please sign to issue bitmarks.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doIssueFile(touchFaceIdSession, filePath, assetName, metadataList, quantity), processingInfo, successInfo);
};

const doGetProvenance = async (bitmark) => {
  return await processing(DataProcessor.doGetProvenance(bitmark.id));
};

const doTransferBitmark = async (bitmark, receiver) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Please sign to send the bitmark transfer request.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doTransferBitmark(touchFaceIdSession, bitmark.id, receiver));
};

const doAcceptTransferBitmark = async (transferOffer, processingInfo, successInfo, errorInfo) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Touch/Face ID or a passcode is required to authorize your transactions.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doAcceptTransferBitmark(touchFaceIdSession, transferOffer), processingInfo, successInfo, errorInfo);
};

const doAcceptAllTransfers = async (transferOffers, processingInfo, successInfo, errorInfo) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Touch/Face ID or a passcode is required to authorize your transactions.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doAcceptAllTransfers(touchFaceIdSession, transferOffers), processingInfo, successInfo, errorInfo);
};


const doCancelTransferBitmark = async (transferOfferId) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Touch/Face ID or a passcode is required to authorize your transactions');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doCancelTransferBitmark(touchFaceIdSession, transferOfferId));
};

const doRejectTransferBitmark = async (transferOffer, processingInfo, successInfo, errorInfo) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Touch/Face ID or a passcode is required to authorize your transactions');
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doRejectTransferBitmark(touchFaceIdSession, transferOffer), processingInfo, successInfo, errorInfo);
};


const doRequirePermission = async () => {
  let donationInformation = await DataProcessor.doGetDonationInformation();
  if (donationInformation) {
    await AppleHealthKitModel.initHealthKit(donationInformation.allDataTypes);
  }
};

const doActiveBitmarkHealthData = async (activeBitmarkHealthDataAt) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Touch/Face ID or a passcode is required to start bitmarking health data.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doActiveBitmarkHealthData(touchFaceIdSession, activeBitmarkHealthDataAt));
};

const doInactiveBitmarkHealthData = async () => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Touch/Face ID or a passcode is required to remove bitmark health data.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doInactiveBitmarkHealthData(touchFaceIdSession));
};

const doJoinStudy = async (studyId) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Touch/Face ID or a passcode is required to join study.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doJoinStudy(touchFaceIdSession, studyId));
};
const doLeaveStudy = async (studyId) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Touch/Face ID or a passcode is required to opt out study.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doLeaveStudy(touchFaceIdSession, studyId));
};
const doStudyTask = async (study, taskType) => {
  let result = await DonationService.doStudyTask(study, taskType);
  if (!result) {
    return null;
  }
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Touch/Face ID or a passcode is required to complete task.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doCompletedStudyTask(touchFaceIdSession, study, taskType, result));
};
const doCompletedStudyTask = async (study, taskType, result) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Touch/Face ID or a passcode is required to complete task.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doCompletedStudyTask(touchFaceIdSession, study, taskType, result));
};
const doDonateHealthData = async (study, list, processingData, successData) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Touch/Face ID or a passcode is required to donate your health data.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doDonateHealthData(touchFaceIdSession, study, list), processingData, successData);
};
const doBitmarkHealthData = async (list, processingData, successData) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Touch/Face ID or a passcode is required to bitmark your weekly health data.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doBitmarkHealthData(touchFaceIdSession, list), processingData, successData);
};
const doDownloadStudyConsent = async (study) => {
  return await processing(DonationService.doDownloadStudyConsent(study));
};

const doDownloadBitmark = async (bitmark, processingData) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Touch/Face ID or a passcode is required to download property.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doDownloadBitmark(touchFaceIdSession, bitmark), processingData);
};

const doTrackingBitmark = async (asset, bitmark) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Touch/Face ID or a passcode is required to tracking property.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doTrackingBitmark(touchFaceIdSession, asset, bitmark));
};

const doStopTrackingBitmark = async (bitmark) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Touch/Face ID or a passcode is required to stop tracking property.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doStopTrackingBitmark(touchFaceIdSession, bitmark));
}
const doRevokeIftttToken = async () => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Touch/Face ID or a passcode is revoke access to your IFTTT.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doRevokeIftttToken(touchFaceIdSession));
};
const doIssueIftttData = async (iftttBitmarkFile, processingInfo, successInfo) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Touch/Face ID or a passcode is required to issuance.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await submitting(DataProcessor.doIssueIftttData(touchFaceIdSession, iftttBitmarkFile), processingInfo, successInfo);
};

const doMigrateWebAccount = async (token) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Touch/Face ID or a passcode is required to migration.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doMigrateWebAccount(touchFaceIdSession, token));
};

const doSignInOnWebApp = async (token) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouchSessionId('Touch/Face ID or a passcode is required to sign in.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(DataProcessor.doSignInOnWebApp(touchFaceIdSession, token));
};

const doGetAllTransfersOffers = async () => {
  return await processing(DataProcessor.doGetAllTransfersOffers());
};

const doStartBackgroundProcess = async (justCreatedBitmarkAccount) => {
  return DataProcessor.doStartBackgroundProcess(justCreatedBitmarkAccount);
  // return await processing(DataProcessor.doStartBackgroundProcess(justCreatedBitmarkAccount));
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