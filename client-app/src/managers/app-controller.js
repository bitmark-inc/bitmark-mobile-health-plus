import { CommonModel, AccountModel, BitmarkModel } from './../models';
import { AccountService, BitmarkService, EventEmiterService, MarketService } from './../services'
import { DataController } from './data-controller';

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
let submitting = (promise, procesingData, successData) => {
  EventEmiterService.emit(EventEmiterService.events.APP_SUBMITTING, procesingData);
  return new Promise((resolve, reject) => {
    promise.then((data) => {
      if (successData) {
        EventEmiterService.emit(EventEmiterService.events.APP_SUBMITTING, successData);
        setTimeout(() => {
          EventEmiterService.emit(EventEmiterService.events.APP_SUBMITTING, null);
        }, 1000);
      } else {
        EventEmiterService.emit(EventEmiterService.events.APP_SUBMITTING, null);
      }
      resolve(data);
    }).catch(error => {
      EventEmiterService.emit(EventEmiterService.events.APP_SUBMITTING, null);
      reject(error);
    });
  })
};

// ================================================================================================
// ================================================================================================
const doCreateNewAccount = async () => {
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
  await CommonModel.endNewFaceTouceSessionId();
  return userInfo;
};

const doCheck24Words = async (pharse24Words) => {
  return await AccountModel.doCheck24Words(pharse24Words);
};

const doLogin = async (pharse24Words) => {
  let touchFaceIdSession = await AccountModel.doLogin(pharse24Words);
  console.log('AppController doLogin touchFaceIdSession :', touchFaceIdSession);
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

const doGetBalance = async () => {
  return await processing(AccountService.doGetBalance());
};

const doTryAccessToMarket = async (market) => {
  return await processing(AccountService.doTryAccessToMarket(market));
};

const doTryAccessToAllMarkets = async () => {
  return await processing(AccountService.doTryAccessToAllMarkets());
};

const doGetBitmarks = async () => {
  await processing(DataController.doGetBitmarks());
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



const doOpenApp = async (justCreatedBitmarkAccount) => {
  return await processing(DataController.doActiveApplication(justCreatedBitmarkAccount));
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
  doGetBalance,
  doTryAccessToMarket,
  doTryAccessToAllMarkets,
  doGetBitmarks,
  doCheckFileToIssue,
  doIssueFile,
  doGetProvenance,

  doOpenApp,
}

export {
  AppController,
}