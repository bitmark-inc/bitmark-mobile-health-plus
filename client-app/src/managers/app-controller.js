import { Platform } from 'react-native';
import { CommonModel, AccountModel, BitmarkModel, FaceTouchId } from './../models';
import { AccountService, BitmarkService, EventEmiterService, MarketService, TransactionService } from './../services'
import { DataController } from './data-controller';
import { ios } from '../configs';

// ================================================================================================
// ================================================================================================
let processing = (promise) => {
  EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, true);
  return new Promise((resolve, reject) => {
    promise.then((data) => {
      EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, false);
      resolve(data);
    }).catch(error => {
      EventEmiterService.emit(EventEmiterService.events.APP_PROCESSING, false);
      reject(error);
    });
  })
};
let submitting = (promise, procesingData, successData, errorData) => {
  EventEmiterService.emit(EventEmiterService.events.APP_SUBMITTING, procesingData);
  return new Promise((resolve, reject) => {
    promise.then((data) => {
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
    }).catch(error => {
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
  })
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
  return await processing(AccountService.doCreateAccount(touchFaceIdSession));
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
  return await processing(AccountService.doLogin(touchFaceIdSession));
};

const doLogout = async () => {
  return await processing(AccountService.doLogout());
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

const doPairAccount = async (token, market) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouceSessionId('Please sign to pair the bitmark account with market.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(MarketService.doPairAccount(touchFaceIdSession, token, market));
};

const doWithdrawBitmark = async (bitmark) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouceSessionId('Please sign to remove the bitmark from market.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(MarketService.doWithdrawBitmarks(touchFaceIdSession, [bitmark.bitmark_id]));
};

const doDepositBitmark = async (bitmark, market) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouceSessionId('Please sign to remove the bitmark from market.');
  if (!touchFaceIdSession) {
    return null;
  }
  return await processing(MarketService.doDepositBitmarks(touchFaceIdSession, [bitmark.bitmark_id], market));
};

const check24Words = async (pharse24Words) => {
  return await processing(AccountModel.doCheck24Words(pharse24Words));
};

const doTryAccessToMarket = async (market) => {
  return await processing(AccountService.doTryAccessToMarket(market));
};

const doTryAccessToAllMarkets = async () => {
  return await processing(DataController.doTryAccessToAllMarkets());
};

const reloadBitmarks = async () => {
  await processing(DataController.reloadBitmarks());
};

const doGetBalance = async () => {
  await processing(DataController.doGetBalance());
};

const doGetTransactionData = async () => {
  await processing(DataController.doGetTransactionData());
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
  let touchFaceIdSession = await CommonModel.doStartFaceTouceSessionId('Touch/Face ID or a passcode is required to authorize your transactions');
  if (!touchFaceIdSession) {
    return null;
  }
  CommonModel.setFaceTouceSessionId(touchFaceIdSession);
  return await processing(TransactionService.doTransferBitmark(touchFaceIdSession, bitmark.id, receiver));
};

const doAcceptTransferBitmark = async (bitmarkId, processingInfo, successInfo, errorInfo) => {
  let touchFaceIdSession = await CommonModel.doStartFaceTouceSessionId('Touch/Face ID or a passcode is required to authorize your transactions');
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

const reloadData = async () => {
  return await processing(DataController.reloadData());
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
  // return await DataController.doStartBackgroundProcess(justCreatedBitmarkAccount);
  return await processing(DataController.doStartBackgroundProcess(justCreatedBitmarkAccount));
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
  doPairAccount,
  doWithdrawBitmark,
  doDepositBitmark,
  check24Words,
  doTryAccessToMarket,
  doTryAccessToAllMarkets,
  reloadBitmarks,
  doCheckFileToIssue,
  doIssueFile,
  doGetBalance,
  doGetProvenance,
  doGetTransactionData,
  doGetTransferOfferDetail,
  doTransferBitmark,
  doAcceptTransferBitmark,
  doRejectTransferBitmark,
  doCancelTransferBitmark,
  reloadData,
  doDownloadBitmark,

  doStartBackgroundProcess,
}

export {
  AppController,
}