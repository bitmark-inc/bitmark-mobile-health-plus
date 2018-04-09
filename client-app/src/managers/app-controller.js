import { Platform } from 'react-native';
import moment from 'moment';

import { CommonModel, AccountModel, BitmarkModel, FaceTouchId, AppleHealthKitModel } from './../models';
import { AccountService, BitmarkService, EventEmiterService, TransactionService } from './../services'
import { DataController } from './data-controller';
import { ios } from '../configs';
import { DonationService } from '../services/donation-service';

// ================================================================================================
// ================================================================================================

let commonProcess = (promise, successCallabck, errorCallback) => {
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
    check2Seconds(() => successCallabck(data));
  }).catch(error => {
    check2Seconds(() => errorCallback(error));
  });
};

let processing = (promise) => {
  EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, true);
  return new Promise((resolve, reject) => {
    commonProcess(promise, (data) => {
      EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, false);
      resolve(data);
    }, (error) => {
      EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, false);
      reject(error);
    })
  });
};

let submitting = (promise, procesingData, successData, errorData) => {
  EventEmiterService.emit(EventEmiterService.events.APP_SUBMITTING, procesingData || { indicator: true });
  return new Promise((resolve, reject) => {
    commonProcess(promise, (data) => {
      if (successData) {
        EventEmiterService.emit(EventEmiterService.events.APP_SUBMITTING, successData);
        setTimeout(() => {
          EventEmiterService.emit(EventEmiterService.events.APP_SUBMITTING, null);
          resolve(data);
        }, 2000);
      } else {
        EventEmiterService.emit(EventEmiterService.events.APP_SUBMITTING, null);
        resolve(data);
      }
    }, (error) => {
      if (errorData) {
        EventEmiterService.emit(EventEmiterService.events.APP_SUBMITTING, errorData);
        setTimeout(() => {
          EventEmiterService.emit(EventEmiterService.events.APP_SUBMITTING, null);
          reject(error);
        }, 2000);
      } else {
        EventEmiterService.emit(EventEmiterService.events.APP_SUBMITTING, null);
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
  CommonModel.setFaceTouceSessionId(touchFaceIdSession);
  return await processing(AccountService.doGetCurrentAccount(touchFaceIdSession));
};

const doGetCurrentAccount = async (touchFaceIdMessage) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouceSessionId(touchFaceIdMessage);
  if (!touchFaceIdSession) {
    return null;
  }
  let userInfo = await processing(AccountModel.doGetCurrentAccount(touchFaceIdSession));
  return userInfo;
};

const doCheck24Words = async (pharse24Words) => {
  return await AccountModel.doCheck24Words(pharse24Words);
};

const doLogin = async (pharse24Words) => {
  if (Platform.OS === 'ios' && ios.config.isIPhoneX) {
    await FaceTouchId.authenticate();
  }
  let touchFaceIdSession = await AccountModel.doLogin(pharse24Words);
  if (!touchFaceIdSession) {
    return null;
  }
  CommonModel.setFaceTouceSessionId(touchFaceIdSession);
  return await processing(DataController.doLogin(touchFaceIdSession));
};

const doLogout = async () => {
  return await processing(DataController.doLogout());
};

const doCreateSignatureData = async (touchFaceIdMessage, newSession) => {
  if (newSession) {
    let sessionId = await CommonModel.doStartFaceTouceSessionId(touchFaceIdMessage);
    if (!sessionId) {
      return null;
    }
  }
  return await processing(AccountService.doCreateSignatureData(touchFaceIdMessage));
};

const doReloadUserData = async () => {
  return await processing(DataController.doReloadUserData());
};
const doReloadBitmarks = async () => {
  await processing(DataController.doReloadBitmarks());
};

const doReloadTransactionData = async () => {
  await processing(DataController.doReloadTransactionData());
};

const doReloadDonationInformation = async () => {
  await processing(DataController.doReloadDonationInformation());
};

const doGetTransferOfferDetail = async (bitmarkId) => {
  return await processing(TransactionService.doGetTransferOfferDetail(bitmarkId));
};


const doCheckFileToIssue = async (filepath) => {
  return await processing(BitmarkService.doCheckFileToIssue(filepath));
};

const doIssueFile = async (filepath, assetName, metadatList, quantity, processingInfo, successInfo) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouceSessionId('Please sign to issue bitmarks.');
  if (!touchFaceIdSession) {
    return null;
  }
  CommonModel.setFaceTouceSessionId(touchFaceIdSession);
  return await submitting(BitmarkService.doIssueFile(touchFaceIdSession, filepath, assetName, metadatList, quantity), processingInfo, successInfo);
};

const doGetProvenance = async (bitmark) => {
  return await processing(BitmarkModel.doGetProvenance(bitmark));
};

const doTransferBitmark = async (bitmark, receiver) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouceSessionId('Touch/Face ID or a passcode is required to authorize your transactions.');
  if (!touchFaceIdSession) {
    return null;
  }
  CommonModel.setFaceTouceSessionId(touchFaceIdSession);
  return await processing(TransactionService.doTransferBitmark(touchFaceIdSession, bitmark.id, receiver));
};

const doAcceptTransferBitmark = async (bitmarkId, processingInfo, successInfo, errorInfo) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouceSessionId('Touch/Face ID or a passcode is required to authorize your transactions.');
  if (!touchFaceIdSession) {
    return null;
  }
  CommonModel.setFaceTouceSessionId(touchFaceIdSession);
  return await submitting(TransactionService.doAcceptTransferBitmark(touchFaceIdSession, bitmarkId), processingInfo, successInfo, errorInfo);
};

const doCancelTransferBitmark = async (bitmarkId) => {
  return await processing(TransactionService.doCancelTransferBitmark(bitmarkId));
};

const doRejectTransferBitmark = async (bitmarkId, processingInfo, successInfo, errorInfo) => {
  // TODO need signature
  // let touchFaceIdSession = await CommonModel.doStartFaceTouceSessionId('Touch/Face ID or a passcode is required to authorize your transactions');
  // if (!touchFaceIdSession) {
  //   return null;
  // }
  // CommonModel.setFaceTouceSessionId(touchFaceIdSession);
  // return await submitting(TransactionService.doRejectTransferBitmark(touchFaceIdSession, bitmarkId), processingInfo, successInfo, errorInfo);

  return await submitting(TransactionService.doRejectTransferBitmark(bitmarkId), processingInfo, successInfo, errorInfo);
};


const doRequirePermission = async () => {
  let donationInformation = DataController.getDonationInformation();
  await AppleHealthKitModel.initHealthKit(donationInformation.allDataTypes);
};

const doActiveBitmarkHealthData = async (activeBitmarkHealthDataAt) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouceSessionId('Touch/Face ID or a passcode is required to start bitmarking health data.');
  if (!touchFaceIdSession) {
    return null;
  }
  CommonModel.setFaceTouceSessionId(touchFaceIdSession);
  return await processing(DataController.doActiveBitmarkHealthData(touchFaceIdSession, activeBitmarkHealthDataAt));
};

const doInactiveBitmarkHealthData = async () => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouceSessionId('Touch/Face ID or a passcode is required to remove bitmark health data.');
  if (!touchFaceIdSession) {
    return null;
  }
  CommonModel.setFaceTouceSessionId(touchFaceIdSession);
  return await processing(DataController.doInactiveBitmarkHealthData(touchFaceIdSession));
};

const doJoinStudy = async (studyId) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouceSessionId('Touch/Face ID or a passcode is required to join study.');
  if (!touchFaceIdSession) {
    return null;
  }
  CommonModel.setFaceTouceSessionId(touchFaceIdSession);
  return await processing(DataController.doJoinStudy(touchFaceIdSession, studyId));
};
const doLeaveStudy = async (studyId) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouceSessionId('Touch/Face ID or a passcode is required to opt out study.');
  if (!touchFaceIdSession) {
    return null;
  }
  CommonModel.setFaceTouceSessionId(touchFaceIdSession);
  return await processing(DataController.doLeaveStudy(touchFaceIdSession, studyId));
};
const doStudyTask = async (study, taskType) => {
  let result = await DonationService.doStudyTask(study, taskType);
  if (!result) {
    return null;
  }
  let touchFaceIdSession = await CommonModel.doStartFaceTouceSessionId('Touch/Face ID or a passcode is required to complete task.');
  if (!touchFaceIdSession) {
    return null;
  }
  CommonModel.setFaceTouceSessionId(touchFaceIdSession);
  return await processing(DataController.doCompletedStudyTask(touchFaceIdSession, study, taskType, result));
};
const doDonateHealthData = async (study, list, procesingData, successData) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouceSessionId('Touch/Face ID or a passcode is required to donate your health data.');
  if (!touchFaceIdSession) {
    return null;
  }
  CommonModel.setFaceTouceSessionId(touchFaceIdSession, );
  return await submitting(DataController.doDonateHealthData(touchFaceIdSession, study, list), procesingData, successData);
};
const doBitmarkHealthData = async (list, procesingData, successData) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouceSessionId('Touch/Face ID or a passcode is required to bitmark your weekly health data.');
  if (!touchFaceIdSession) {
    return null;
  }
  CommonModel.setFaceTouceSessionId(touchFaceIdSession);
  return await submitting(DataController.doBitmarkHealthData(touchFaceIdSession, list), procesingData, successData);
};
const doDownloadStudyConsent = async (study) => {
  return await processing(DonationService.doDownloadStudyConsent(study));
};

const doDownloadBitmark = async (bitmark, processingData) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouceSessionId('Touch/Face ID or a passcode is required to download property.');
  if (!touchFaceIdSession) {
    return null;
  }
  CommonModel.setFaceTouceSessionId(touchFaceIdSession);
  return await submitting(DataController.doDownloadBitmark(touchFaceIdSession, bitmark), processingData);
};

const doStartBackgroundProcess = async (justCreatedBitmarkAccount) => {
  return DataController.doStartBackgroundProcess(justCreatedBitmarkAccount);
  // return await processing(DataController.doStartBackgroundProcess(justCreatedBitmarkAccount));
};
// ================================================================================================
// ================================================================================================
// ================================================================================================

let AppController = {
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
  doCancelTransferBitmark,
  doRequirePermission,
  doActiveBitmarkHealthData,
  doInactiveBitmarkHealthData,
  doJoinStudy,
  doLeaveStudy,
  doStudyTask,
  doDonateHealthData,
  doBitmarkHealthData,
  doDownloadStudyConsent,
  doReloadDonationInformation,
  doDownloadBitmark,

  doReloadUserData,
  doReloadBitmarks,
  doReloadTransactionData,



  doStartBackgroundProcess,
}

export {
  AppController,
}