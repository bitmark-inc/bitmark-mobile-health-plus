import DeviceInfo from 'react-native-device-info';
import moment from 'moment';

import {
  EventEmitterService,
  NotificationService,
  TransactionService,
  BitmarkService,
  AccountService,
} from "../services";
import { CommonModel, AccountModel, UserModel, BitmarkSDK, IftttModel, BitmarkModel } from '../models';
import { DonationService } from '../services/donation-service';
import { FileUtil } from '../utils';
import { DataCacheProcessor } from './data-cache-processor';
import { config } from '../configs';
const helper = require('../utils/helper');

let userInformation = {};
let isLoadingData = false;
// ================================================================================================================================================
const doCheckNewDonationInformation = async (donationInformation, isLoadingAllUserData) => {
  if (donationInformation) {
    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION, donationInformation);
    EventEmitterService.emit(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, donationInformation);
    if (!isLoadingAllUserData) {
      await doGenerateTransactionActionRequiredData();
      await doGenerateTransactionHistoryData();
    }
  }
};

const doCheckTransferOffers = async (transferOffers, isLoadingAllUserData) => {
  if (transferOffers) {
    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSFER_OFFERS, transferOffers);
    if (!isLoadingAllUserData) {
      await doGenerateTransactionActionRequiredData();
    }
  }
};

const doCheckNewIftttInformation = async (iftttInformation, isLoadingAllUserData) => {
  if (iftttInformation) {

    let oldIftttInformation = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_IFTTT_INFORMATION);
    if ((!oldIftttInformation || !oldIftttInformation.connectIFTTT) && (iftttInformation && iftttInformation.connectIFTTT)) {
      await CommonModel.doTrackEvent({
        event_name: 'app_user_connected_ifttt',
        account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
      });
    }

    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_IFTTT_INFORMATION, iftttInformation);
    EventEmitterService.emit(EventEmitterService.events.CHANGE_USER_DATA_IFTTT_INFORMATION, iftttInformation);
    if (!isLoadingAllUserData) {
      await doGenerateTransactionActionRequiredData();
    }
  }
};

const doCheckNewTrackingBitmarks = async (trackingBitmarks) => {
  if (trackingBitmarks) {
    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS, trackingBitmarks);
    DataCacheProcessor.setPropertiesScreen({
      totalTrackingBitmarks: trackingBitmarks.length,
      existNewTrackingBitmark: (trackingBitmarks || []).findIndex(bm => !bm.isViewed) >= 0,
      trackingBitmarks: trackingBitmarks.slice(0, DataCacheProcessor.cacheLength)
    });
    EventEmitterService.emit(EventEmitterService.events.CHANGE_USER_DATA_TRACKING_BITMARKS, trackingBitmarks);
  }
};

const doCheckNewTransactions = async (transactions) => {
  if (transactions) {
    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS, transactions);
    await doGenerateTransactionHistoryData();
  }
};
const doCheckNewBitmarks = async (localAssets) => {
  if (localAssets) {
    await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS, localAssets);

    let totalBitmarks = 0;
    localAssets.forEach(asset => totalBitmarks += asset.bitmarks.length);
    DataCacheProcessor.setPropertiesScreen({
      localAssets: localAssets.slice(0, DataCacheProcessor.cacheLength),
      totalAssets: localAssets.length,
      existNewAsset: localAssets.findIndex(asset => !asset.isViewed) >= 0,
      totalBitmarks
    });

    EventEmitterService.emit(EventEmitterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS, localAssets);
  }
};
// ================================================================================================================================================

const recheckLocalAssets = (localAssets, donationInformation, outgoingTransferOffers) => {
  for (let asset of localAssets) {
    asset.bitmarks = asset.bitmarks.sort((a, b) => b.offset - a.offset);
    for (let bitmark of asset.bitmarks) {
      let transferOffer = (outgoingTransferOffers || []).find(item => (item.status === 'open' && item.bitmark_id === bitmark.id));
      bitmark.transferOfferId = transferOffer ? transferOffer.id : null;

      if (donationInformation && donationInformation.completedTasks) {
        let isDonatedBitmark = donationInformation.completedTasks.findIndex(item => (item.taskType !== donationInformation.commonTaskIds.bitmark_health_data && item.bitmarkId === bitmark.id)) >= 0;
        bitmark.isDonatedBitmark = isDonatedBitmark;
      }
    }
  }
  return localAssets;
};

let queueGetTransferOffer = [];
const runGetTransferOfferInBackground = () => {
  return new Promise((resolve) => {
    queueGetTransferOffer.push(resolve);
    if (queueGetTransferOffer.length > 1) {
      return;
    }
    TransactionService.doGetAllTransferOffers(userInformation.bitmarkAccountNumber).then(transferOffers => {
      console.log('runOnBackground  runGetTransferOfferInBackground success');
      queueGetTransferOffer.forEach(queueResolve => queueResolve(transferOffers));
      queueGetTransferOffer = [];
    }).catch(error => {
      queueGetTransferOffer.forEach(queueResolve => queueResolve());
      queueGetTransferOffer = [];
      console.log('runOnBackground  runGetTransferOfferInBackground error :', error);
    });
  });
};


let queueGetDonationInformation = [];
const runGetDonationInformationInBackground = () => {
  return new Promise((resolve) => {
    queueGetDonationInformation.push(resolve);
    if (queueGetDonationInformation.length > 1) {
      return;
    }
    DonationService.doGetUserInformation(userInformation.bitmarkAccountNumber).then(donationInformation => {
      console.log('runOnBackground  runGetDonationInformationInBackground success');
      queueGetDonationInformation.forEach(queueResolve => queueResolve(donationInformation));
      queueGetDonationInformation = [];
    }).catch(error => {
      queueGetDonationInformation.forEach(queueResolve => queueResolve());
      queueGetDonationInformation = [];
      console.log('runOnBackground  runGetDonationInformationInBackground error :', error);
    });
  });
};

let queueGetTrackingBitmarks = [];
const runGetTrackingBitmarksInBackground = () => {
  return new Promise((resolve) => {
    queueGetTrackingBitmarks.push(resolve);
    if (queueGetTrackingBitmarks.length > 1) {
      return;
    }
    BitmarkService.doGetTrackingBitmarks(userInformation.bitmarkAccountNumber).then(trackingBitmarks => {
      console.log('runOnBackground  runGetTrackingBitmarksInBackground success');
      queueGetTrackingBitmarks.forEach(queueResolve => queueResolve(trackingBitmarks));
      queueGetTrackingBitmarks = [];
    }).catch(error => {
      queueGetTrackingBitmarks.forEach(queueResolve => queueResolve());
      queueGetTrackingBitmarks = [];
      console.log('runOnBackground  runGetTrackingBitmarksInBackground error :', error);
    });
  });
};

let queueGetIFTTTInformation = [];
const runGetIFTTTInformationInBackground = () => {
  return new Promise((resolve) => {
    queueGetIFTTTInformation.push(resolve);
    if (queueGetIFTTTInformation.length > 1) {
      return;
    }
    IftttModel.doGetIFtttInformation(userInformation.bitmarkAccountNumber).then(iftttInformation => {
      console.log('runOnBackground  runGetIFTTTInformationInBackground success');
      queueGetIFTTTInformation.forEach(queueResolve => queueResolve(iftttInformation));
      queueGetIFTTTInformation = [];
    }).catch(error => {
      queueGetIFTTTInformation.forEach(queueResolve => queueResolve());
      queueGetIFTTTInformation = [];
      console.log('runOnBackground  runGetIFTTTInformationInBackground error :', error);
    });
  });
};
// ================================================================================================================================================
// special process
let queueGetTransactions = [];
const runGetTransactionsInBackground = () => {
  return new Promise((resolve) => {
    queueGetTransactions.push(resolve);
    if (queueGetTransactions.length > 1) {
      return;
    }

    let doGetAllTransactions = async () => {
      let oldTransactions, lastOffset;
      let canContinue = true;
      while (canContinue) {
        let data = await TransactionService.doGet100Transactions(userInformation.bitmarkAccountNumber, oldTransactions, lastOffset);
        canContinue = !!data;
        if (data) {
          oldTransactions = data.transactions;
          lastOffset = data.lastOffset;
          await doCheckNewTransactions(oldTransactions);
        }
      }
      oldTransactions = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS);
      await doCheckNewTransactions(oldTransactions);
    };

    doGetAllTransactions().then(() => {
      console.log('runOnBackground  runGetTransactionsInBackground success');
      queueGetTransactions.forEach(queueResolve => queueResolve());
      queueGetTransactions = [];
    }).catch(error => {
      queueGetTransactions.forEach(queueResolve => queueResolve());
      queueGetTransactions = [];
      console.log('runOnBackground  runGetTransactionsInBackground error :', error);
    });
  });
};

let queueGetLocalBitmarks = [];
const runGetLocalBitmarksInBackground = (donationInformation, outgoingTransferOffers) => {
  return new Promise((resolve) => {
    queueGetLocalBitmarks.push(resolve);
    if (queueGetLocalBitmarks.length > 1) {
      return;
    }

    let doGetAllBitmarks = async () => {
      if (!donationInformation) {
        donationInformation = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION)) || {};
      }
      if (!outgoingTransferOffers) {
        let transferOffers = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSFER_OFFERS)) || {};
        outgoingTransferOffers = transferOffers.outgoingTransferOffers || [];
      }
      let oldLocalAssets, lastOffset;
      let canContinue = true;
      while (canContinue) {
        let data = await BitmarkService.doGet100Bitmarks(userInformation.bitmarkAccountNumber, oldLocalAssets, lastOffset);
        canContinue = data.hasChanging;
        oldLocalAssets = data.localAssets;
        oldLocalAssets = recheckLocalAssets(oldLocalAssets, donationInformation, outgoingTransferOffers);
        await doCheckNewBitmarks(oldLocalAssets);
        if (data.hasChanging) {
          lastOffset = data.lastOffset;
        }
      }
      let localAsset = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS);
      localAsset = recheckLocalAssets(localAsset, donationInformation, outgoingTransferOffers);
      await doCheckNewBitmarks(localAsset);
    }

    doGetAllBitmarks().then(() => {
      queueGetLocalBitmarks.forEach(queueResolve => queueResolve());
      queueGetLocalBitmarks = [];
      console.log('runOnBackground  runGetLocalBitmarksInBackground success');
    }).catch(error => {
      console.log('runOnBackground  runGetLocalBitmarksInBackground error :', error);
      queueGetLocalBitmarks.forEach(queueResolve => queueResolve());
      queueGetLocalBitmarks = [];
    });
  });
};

const runOnBackground = async () => {
  let userInfo = await UserModel.doTryGetCurrentUser();
  if (userInformation === null || JSON.stringify(userInfo) !== JSON.stringify(userInformation)) {
    userInformation = userInfo;
    EventEmitterService.emit(EventEmitterService.events.CHANGE_USER_INFO, userInfo);
  }
  if (userInformation && userInformation.bitmarkAccountNumber) {
    let runParallel = () => {
      return new Promise((resolve) => {
        Promise.all([
          runGetTrackingBitmarksInBackground(),
          runGetTransferOfferInBackground(),
          runGetDonationInformationInBackground(),
          runGetIFTTTInformationInBackground(),
        ]).then(resolve);
      });
    };
    let parallelResults = await runParallel();
    await doCheckNewTrackingBitmarks(parallelResults[0]);
    await doCheckTransferOffers(parallelResults[1], true);
    await doCheckNewDonationInformation(parallelResults[2], true);
    await doCheckNewIftttInformation(parallelResults[3], true);
    await doGenerateTransactionActionRequiredData();

    let doParallel = () => {
      return new Promise((resolve) => {
        Promise.all([
          runGetLocalBitmarksInBackground(parallelResults[2], parallelResults[1].outgoingTransferOffers),
          runGetTransactionsInBackground()
        ]).then(resolve);
      });
    }
    await doParallel();
  }
  console.log('runOnBackground done ====================================');
};

const doReloadUserData = async () => {
  isLoadingData = true;
  EventEmitterService.emit(EventEmitterService.events.APP_LOADING_DATA, isLoadingData);
  await runOnBackground();
  isLoadingData = false;
  EventEmitterService.emit(EventEmitterService.events.APP_LOADING_DATA, isLoadingData);
};

const doReloadDonationInformation = async () => {
  let donationInformation = await runGetDonationInformationInBackground();
  await doCheckNewDonationInformation(donationInformation);
  return donationInformation;
};
const doReloadTrackingBitmark = async () => {
  let trackingBitmarks = await runGetTrackingBitmarksInBackground();
  await doCheckNewTrackingBitmarks(trackingBitmarks);
  return trackingBitmarks;
};

const doReloadTransferOffers = async () => {
  let transferOffers = await runGetTransferOfferInBackground();
  await doCheckTransferOffers(transferOffers);
  return transferOffers;
};

const doReloadLocalBitmarks = async () => {
  let donationInformation = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION)) || {};
  return await runGetLocalBitmarksInBackground(donationInformation);
};

const configNotification = () => {
  const onRegistered = async (registeredNotificationInfo) => {
    let notificationUUID = registeredNotificationInfo ? registeredNotificationInfo.token : null;
    if (!userInformation || !userInformation.bitmarkAccountNumber) {
      userInformation = await UserModel.doGetCurrentUser();
    }
    if (notificationUUID && userInformation.notificationUUID !== notificationUUID) {
      NotificationService.doRegisterNotificationInfo(userInformation.bitmarkAccountNumber, notificationUUID).then(() => {
        userInformation.notificationUUID = notificationUUID;
        return UserModel.doUpdateUserInfo(userInformation);
      }).catch(error => {
        console.log('DataProcessor doRegisterNotificationInfo error:', error);
      });
    }
  };
  const onReceivedNotification = async (notificationData) => {
    if (!notificationData.foreground) {
      if (!userInformation || !userInformation.bitmarkAccountNumber) {
        userInformation = await UserModel.doGetCurrentUser();
      }
      await CommonModel.doTrackEvent({
        event_name: 'app_user_click_notification',
        account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
      });
      setTimeout(async () => {
        EventEmitterService.emit(EventEmitterService.events.APP_RECEIVED_NOTIFICATION, notificationData.data);
      }, 1000);
    }
  };
  NotificationService.configure(onRegistered, onReceivedNotification);
  NotificationService.removeAllDeliveredNotifications();
};
// ================================================================================================================================================
// ================================================================================================================================================
let dataInterval = null;
const startInterval = () => {
  stopInterval();
  dataInterval = setInterval(runOnBackground, 30 * 1000);
};

const stopInterval = () => {
  if (dataInterval) {
    clearInterval(dataInterval);
  }
  dataInterval = null;
};

// ================================================================================================================================================
// ================================================================================================================================================
const doStartBackgroundProcess = async (justCreatedBitmarkAccount) => {
  await doReloadUserData();
  startInterval();
  if (!justCreatedBitmarkAccount && userInformation && userInformation.bitmarkAccountNumber) {
    let result = await NotificationService.doCheckNotificationPermission();
    await doMarkRequestedNotification(result);
  }
  return userInformation;
};

const doLogin = async (touchFaceIdSession) => {
  userInformation = await AccountService.doGetCurrentAccount(touchFaceIdSession);
  return userInformation;
};

const doLogout = async () => {
  if (userInformation.notificationUUID) {
    let signatureData = await CommonModel.doTryCreateSignatureData('Please sign to authorize your transactions')
    await NotificationService.doTryDeregisterNotificationInfo(userInformation.bitmarkAccountNumber, userInformation.notificationUUID, signatureData);
  }
  await AccountModel.doLogout();
  await UserModel.doRemoveUserInfo();
  userInformation = {};
  DataCacheProcessor.resetCacheData();
};


const doDeactiveApplication = async () => {
  stopInterval();
};

const doGetAppInformation = async () => {
  return await CommonModel.doGetLocalData(CommonModel.KEYS.APP_INFORMATION);
};

const checkAppNeedResetLocalData = async (appInfo) => {
  if (config.needResetLocalData) {
    appInfo = appInfo || (await doGetAppInformation());
    if (!appInfo || appInfo.resetLocalDataAt !== config.needResetLocalData) {
      appInfo = appInfo || {};
      appInfo.resetLocalDataAt = config.needResetLocalData;
      await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
      await UserModel.resetUserLocalData();
    }
  }
};

const doOpenApp = async () => {
  userInformation = await UserModel.doTryGetCurrentUser();
  await CommonModel.doTrackEvent({
    event_name: 'app_open',
    account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
  });

  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};

  if (appInfo.trackEvents && appInfo.trackEvents.app_user_allow_notification) {
    let result = await NotificationService.doCheckNotificationPermission();

    if (result && !result.alert && !result.badge && !result.sound &&
      (!appInfo.trackEvents || !appInfo.trackEvents.app_user_turn_off_notification)) {
      appInfo.trackEvents = appInfo.trackEvents || {};
      appInfo.trackEvents.app_user_turn_off_notification = true;
      await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
      await CommonModel.doTrackEvent({
        event_name: 'app_user_turn_off_notification',
        account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
      });
    }
  }

  if (!appInfo.trackEvents || !appInfo.trackEvents.app_download) {
    let appInfo = await doGetAppInformation();
    appInfo = appInfo || {};
    appInfo.trackEvents = appInfo.trackEvents || {};
    appInfo.trackEvents.app_download = true;
    await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);
    await CommonModel.doTrackEvent({
      event_name: 'app_download',
      account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
    });
  }

  if (userInformation && userInformation.bitmarkAccountNumber) {
    configNotification();
    await checkAppNeedResetLocalData(appInfo);

    let localAssets = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS)) || [];
    let trackingBitmarks = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS)) || [];

    let totalBitmarks = 0;
    localAssets.forEach(asset => totalBitmarks += asset.bitmarks.length);

    if (!Array.isArray(trackingBitmarks)) {
      await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS, []);
      trackingBitmarks = [];
    }

    DataCacheProcessor.setPropertiesScreen({
      localAssets: localAssets.slice(0, DataCacheProcessor.cacheLength),
      totalAssets: localAssets.length,
      existNewAsset: localAssets.findIndex(asset => !asset.isViewed) >= 0,
      totalBitmarks,

      totalTrackingBitmarks: trackingBitmarks.length,
      existNewTrackingBitmark: (trackingBitmarks || []).findIndex(bm => !bm.isViewed) >= 0,
      trackingBitmarks: trackingBitmarks.slice(0, DataCacheProcessor.cacheLength),
    });

    let actionRequired = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_ACTION_REQUIRED)) || [];
    let completed = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_HISTORY)) || [];

    let totalTasks = 0;
    actionRequired.forEach(item => totalTasks += (item.number ? item.number : 1));
    DataCacheProcessor.setTransactionScreenData({
      totalTasks,
      totalActionRequired: actionRequired.length,
      actionRequired: actionRequired.slice(0, DataCacheProcessor.cacheLength),
      totalCompleted: completed.length,
      completed: completed.slice(0, DataCacheProcessor.cacheLength),
    });
  }

  EventEmitterService.emit(EventEmitterService.events.APP_LOADING_DATA, isLoadingData);
  console.log('userInformation :', userInformation);
  return userInformation;
};

const doActiveBitmarkHealthData = async (touchFaceIdSession, activeBitmarkHealthDataAt) => {
  let donationInformation = await DonationService.doActiveBitmarkHealthData(touchFaceIdSession, userInformation.bitmarkAccountNumber, activeBitmarkHealthDataAt);
  await doCheckNewDonationInformation(donationInformation);
  return donationInformation;
};
const doInactiveBitmarkHealthData = async (touchFaceIdSession) => {
  let donationInformation = await DonationService.doInactiveBitmarkHealthData(touchFaceIdSession, userInformation.bitmarkAccountNumber);
  await doCheckNewDonationInformation(donationInformation);
  return donationInformation;
};
const doJoinStudy = async (touchFaceIdSession, studyId) => {
  let donationInformation = await DonationService.doJoinStudy(touchFaceIdSession, userInformation.bitmarkAccountNumber, studyId);
  await doCheckNewDonationInformation(donationInformation);
  return donationInformation;
};
const doLeaveStudy = async (touchFaceIdSession, studyId) => {
  let donationInformation = await DonationService.doLeaveStudy(touchFaceIdSession, userInformation.bitmarkAccountNumber, studyId);
  await doCheckNewDonationInformation(donationInformation);
  return donationInformation;
};
const doCompletedStudyTask = async (touchFaceIdSession, study, taskType, result) => {
  let donationInformation = await DonationService.doCompletedStudyTask(touchFaceIdSession, userInformation.bitmarkAccountNumber, study, taskType, result);
  await doCheckNewDonationInformation(donationInformation);
  return donationInformation;
};

const doDonateHealthData = async (touchFaceIdSession, study, list) => {
  let donationInformation = await DonationService.doDonateHealthData(touchFaceIdSession, userInformation.bitmarkAccountNumber, study, list);
  await doCheckNewDonationInformation(donationInformation);
  return donationInformation;
};

const doBitmarkHealthData = async (touchFaceIdSession, list) => {
  let currentDonationInformation = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION)) || {};
  let donationInformation = await DonationService.doBitmarkHealthData(touchFaceIdSession,
    userInformation.bitmarkAccountNumber,
    currentDonationInformation.allDataTypes,
    list,
    currentDonationInformation.commonTaskIds.bitmark_health_data);
  await doCheckNewDonationInformation(donationInformation);
  return donationInformation;
};

const doDownloadBitmark = async (touchFaceIdSession, bitmark) => {
  let filePath = await BitmarkSDK.downloadBitmark(touchFaceIdSession, bitmark.id);
  filePath = filePath.replace('file://', '');
  return filePath;
};

const doUpdateViewStatus = async (assetId, bitmarkId) => {
  if (assetId && bitmarkId) {
    let localAssets = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS)) || [];
    let localAsset = (localAssets || []).find(la => la.id === assetId);
    if (localAsset && !localAsset.isViewed) {
      let assetViewed = true;
      localAsset.bitmarks.forEach(bitmark => {
        if (bitmarkId === bitmark.id) {
          bitmark.isViewed = true;
        }
        if (!bitmark.isViewed && assetViewed) {
          assetViewed = false;
        }
      });
      localAsset.isViewed = assetViewed;
      await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS, localAssets);

      DataCacheProcessor.setPropertiesScreen({
        localAssets: localAssets.slice(0, DataCacheProcessor.cacheLength),
        existNewAsset: localAssets.findIndex(asset => !asset.isViewed) >= 0,
      });
      EventEmitterService.emit(EventEmitterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS, localAssets);
    }
  }
  if (bitmarkId) {
    let trackingBitmarks = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS)) || [];
    let trackingBitmark = (trackingBitmarks || []).find(tb => tb.id === bitmarkId);
    if (trackingBitmark) {
      let hasChanging = !trackingBitmark.isViewed;
      trackingBitmark.isViewed = true;
      trackingBitmark.lastHistory = {
        status: trackingBitmark.status,
        head_id: trackingBitmark.head_id,
      };
      await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS, trackingBitmarks);
      if (hasChanging) {
        DataCacheProcessor.setPropertiesScreen({
          totalTrackingBitmarks: trackingBitmarks.length,
          existNewTrackingBitmark: (trackingBitmarks || []).findIndex(bm => !bm.isViewed) >= 0,
          trackingBitmarks: trackingBitmarks.slice(0, DataCacheProcessor.cacheLength),
        });
        EventEmitterService.emit(EventEmitterService.events.CHANGE_USER_DATA_TRACKING_BITMARKS, trackingBitmarks);
      }
    }
  }
};

const doTrackingBitmark = async (touchFaceIdSession, asset, bitmark) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  await BitmarkModel.doAddTrackingBitmark(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature,
    bitmark.id, bitmark.head_id, bitmark.status);
  let trackingBitmarks = await runGetTrackingBitmarksInBackground();
  await doCheckNewTrackingBitmarks(trackingBitmarks);
  return true;
};
const doStopTrackingBitmark = async (touchFaceIdSession, bitmark) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  await BitmarkModel.doStopTrackingBitmark(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, bitmark.id);
  let trackingBitmarks = await runGetTrackingBitmarksInBackground();
  await doCheckNewTrackingBitmarks(trackingBitmarks);
  return true;
};

const doReloadIFTTTInformation = async () => {
  let iftttInformation = await runGetIFTTTInformationInBackground();
  await doCheckNewIftttInformation(iftttInformation);
  return iftttInformation;
};

const doRevokeIftttToken = async (touchFaceIdSession) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  let iftttInformation = await IftttModel.doRevokeIftttToken(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
  await doCheckNewIftttInformation(iftttInformation);
  return iftttInformation;
};
const doIssueIftttData = async (touchFaceIdSession, iftttBitmarkFile) => {
  let folderPath = FileUtil.CacheDirectory + '/Bitmark-IFTTT';
  await FileUtil.mkdir(folderPath);
  let filename = iftttBitmarkFile.assetInfo.filePath.substring(iftttBitmarkFile.assetInfo.filePath.lastIndexOf("/") + 1, iftttBitmarkFile.assetInfo.filePath.length);
  let filePath = folderPath + '/' + filename;
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  let downloadResult = await IftttModel.downloadBitmarkFile(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, iftttBitmarkFile.id, filePath);
  if (downloadResult.statusCode >= 400) {
    throw new Error('Download file error!');
  }
  await BitmarkModel.doIssueFile(touchFaceIdSession, filePath, iftttBitmarkFile.assetInfo.propertyName, iftttBitmarkFile.assetInfo.metadata, 1);
  let iftttInformation = await IftttModel.doRemoveBitmarkFile(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, iftttBitmarkFile.id);
  await doCheckNewIftttInformation(iftttInformation);
  return iftttInformation;
};

const doAcceptTransferBitmark = async (touchFaceIdSession, transferOffer) => {
  await TransactionService.doAcceptTransferBitmark(touchFaceIdSession, transferOffer);
  return await doReloadTransferOffers();
};

const doAcceptAllTransfers = async (touchFaceIdSession, transferOffers) => {
  for (let transferOffer of transferOffers) {
    await TransactionService.doAcceptTransferBitmark(touchFaceIdSession, transferOffer);
  }
  return await doReloadTransferOffers();
};

const doCancelTransferBitmark = async (touchFaceIdSession, transferOfferId) => {
  await TransactionService.doCancelTransferBitmark(touchFaceIdSession, transferOfferId);
  let result = await doReloadTransferOffers();
  let oldTransactions = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS);
  await doCheckNewTransactions(oldTransactions);
  await runGetLocalBitmarksInBackground();
  return result;
};

const doRejectTransferBitmark = async (touchFaceIdSession, transferOffer, ) => {
  await TransactionService.doRejectTransferBitmark(touchFaceIdSession, transferOffer);
  return await doReloadTransferOffers();
};

const doIssueFile = async (touchFaceIdSession, filePath, assetName, metadataList, quantity, isPublicAsset) => {
  let result = await BitmarkService.doIssueFile(touchFaceIdSession, filePath, assetName, metadataList, quantity, isPublicAsset);
  let donationInformation = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION)) || {};
  await runGetLocalBitmarksInBackground(donationInformation);
  return result;
};

const doTransferBitmark = async (touchFaceIdSession, bitmarkId, receiver) => {
  let result = await TransactionService.doTransferBitmark(touchFaceIdSession, bitmarkId, receiver);
  await doReloadTransferOffers();
  let donationInformation = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION)) || {};
  await runGetLocalBitmarksInBackground(donationInformation);
  return result;
};

const doMigrateWebAccount = async (touchFaceIdSession, token) => {
  let result = await BitmarkService.doConfirmWebAccount(touchFaceIdSession, userInformation.bitmarkAccountNumber, token);
  let donationInformation = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION)) || {};
  await runGetLocalBitmarksInBackground(donationInformation);
  return result;
};

const doSignInOnWebApp = async (touchFaceIdSession, token) => {
  return await BitmarkService.doConfirmWebAccount(touchFaceIdSession, userInformation.bitmarkAccountNumber, token);
};


const doGetProvenance = (bitmarkId) => {
  return new Promise((resolve) => {
    CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS).then(trackingBitmarks => {
      let trackingBitmark = (trackingBitmarks || []).find(tb => tb.id === bitmarkId);
      if (trackingBitmark) {
        return BitmarkService.doGetProvenance(bitmarkId, trackingBitmark.lastHistory.head_id, trackingBitmark.lastHistory.status)
      } else {
        return BitmarkService.doGetProvenance(bitmarkId);
      }
    }).then(resolve).catch(error => {
      console.log('doGetProvenance error:', error);
      resolve([]);
    });
  });
};

const doGetLocalBitmarks = async (length) => {
  let localAssets;
  let propertiesScreenDataInCache = DataCacheProcessor.getPropertiesScreenData();

  if (length !== undefined && length <= propertiesScreenDataInCache.localAssets.length) {
    localAssets = propertiesScreenDataInCache.localAssets;
  } else {
    let allLocalAssets = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS)) || [];
    localAssets = length ? allLocalAssets.slice(0, length) : allLocalAssets;
  }
  return {
    localAssets,
    totalAssets: propertiesScreenDataInCache.totalAssets,
    totalBitmarks: propertiesScreenDataInCache.totalBitmarks,
    existNewAsset: propertiesScreenDataInCache.existNewAsset,
  };
};

const doGetTrackingBitmarks = async (length) => {
  let trackingBitmarks;
  let propertiesScreenDataInCache = DataCacheProcessor.getPropertiesScreenData();
  if (length !== undefined && length <= propertiesScreenDataInCache.trackingBitmarks.length) {
    trackingBitmarks = propertiesScreenDataInCache.trackingBitmarks;
  } else {
    let allTrackingBitmarks = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS)) || [];
    trackingBitmarks = length ? allTrackingBitmarks.slice(0, length) : allTrackingBitmarks;
  }

  return {
    trackingBitmarks,
    totalTrackingBitmarks: propertiesScreenDataInCache.totalTrackingBitmarks,
    existNewTrackingBitmark: propertiesScreenDataInCache.existNewTrackingBitmark
  };
};

const getUserInformation = () => {
  return userInformation;
};

const getApplicationVersion = () => {
  return DeviceInfo.getVersion();
};

const getApplicationBuildNumber = () => {
  return DeviceInfo.getBuildNumber();
};

const doGetLocalBitmarkInformation = async (bitmarkId, assetId) => {
  let localAssets = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS)) || [];
  let bitmark;
  let asset;
  if (assetId) {
    asset = localAssets.find(localAsset => localAsset.id === assetId);
    if (bitmarkId) {
      bitmark = (asset ? asset.bitmarks : []).find(localBitmark => localBitmark.id === bitmarkId);
    }
  } else if (bitmarkId) {
    asset = localAssets.find(localAsset => {
      bitmark = localAsset.bitmarks.find(localBitmark => localBitmark.id === bitmarkId);
      return !!bitmark;
    });
  }
  return { bitmark, asset };
};

const doGetDonationInformation = () => {
  return new Promise((resolve) => {
    CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION).then(resolve).catch((error => {
      console.log('doGetDonationInformation error:', error);
      resolve();
    }));
  });
};

const doGetTrackingBitmarkInformation = async (bitmarkId) => {
  let trackingBitmarks = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS)) || [];
  return (trackingBitmarks || []).find(bitmark => bitmark.id === bitmarkId);
}

const doGetIftttInformation = async () => {
  return (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_IFTTT_INFORMATION)) || {};
};

// ======================================================================================================================================================================================
// ======================================================================================================================================================================================
// ======================================================================================================================================================================================
// ======================================================================================================================================================================================
const ActionTypes = {
  transfer: 'transfer',
  donation: 'donation',
  ifttt: 'ifttt',
  test_write_down_recovery_phase: 'test_write_down_recovery_phase',
};
const doGenerateTransactionActionRequiredData = async () => {
  let actionRequired;
  let totalTasks = 0;
  let transferOffers = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSFER_OFFERS)) || {};
  if (transferOffers.incomingTransferOffers) {
    actionRequired = actionRequired || [];
    (transferOffers.incomingTransferOffers || []).forEach((item) => {
      if (item.status === 'open') {
        actionRequired.push({
          key: actionRequired.length,
          transferOffer: item,
          type: ActionTypes.transfer,
          typeTitle: 'SIGN TO RECEIVE BITMARK',
          timestamp: moment(item.created_at),
        });
        totalTasks++;
      }
    });
  }

  let donationInformation = await doGetDonationInformation();
  if (donationInformation && donationInformation.todoTasks) {
    actionRequired = actionRequired || [];
    (donationInformation.todoTasks || []).forEach(item => {
      item.key = actionRequired.length;
      item.type = ActionTypes.donation;
      item.typeTitle = item.study ? 'DONATION Request' : 'ISSUANCE Request';
      item.timestamp = (item.list && item.list.length > 0) ? item.list[0].startDate : (item.study ? item.study.joinedDate : null);
      actionRequired.push(item);
      totalTasks += item.number;
    });
  }
  let iftttInformation = await doGetIftttInformation();
  if (iftttInformation && iftttInformation.bitmarkFiles) {
    iftttInformation.bitmarkFiles.forEach(item => {
      item.key = actionRequired.length;
      item.type = ActionTypes.ifttt;
      item.typeTitle = 'ISSUANCE Request';
      item.timestamp = item.assetInfo.timestamp;
      actionRequired.push(item);
      totalTasks++;
    });
  }

  actionRequired = actionRequired ? actionRequired.sort((a, b) => {
    if (a.important) { return -1; }
    if (b.important) { return 1; }
    if (!a.timestamp) return -1;
    if (!b.timestamp) return 1;
    return moment(b.timestamp).toDate().getTime() - moment(a.timestamp).toDate().getTime();
  }) : actionRequired;

  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_ACTION_REQUIRED, actionRequired);

  // Add "Write Down Your Recovery Phrase" action required which was created when creating account if any
  let testRecoveryPhaseActionRequired = await helper.getTestWriteRecoveryPhaseActionRequired();
  if (testRecoveryPhaseActionRequired) {
    actionRequired.unshift({
      key: actionRequired.length,
      type: ActionTypes.test_write_down_recovery_phase,
      typeTitle: 'SECURITY ALERT',
      timestamp: moment(new Date(testRecoveryPhaseActionRequired.timestamp)),
    });

    totalTasks += 1;
  }

  DataCacheProcessor.setTransactionScreenData({
    totalTasks,
    totalActionRequired: actionRequired.length,
    actionRequired: actionRequired.slice(0, DataCacheProcessor.cacheLength),
  });

  EventEmitterService.emit(EventEmitterService.events.CHANGE_TRANSACTION_SCREEN_ACTION_REQUIRED_DATA, { actionRequired, donationInformation });
  console.log('actionRequired :', actionRequired);
};

const doGenerateTransactionHistoryData = async () => {
  let transactions = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS)) || [];
  let donationInformation = await doGetDonationInformation();
  let transferOffers = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSFER_OFFERS)) || {};

  let completed;
  if (transactions) {
    completed = [];
    let mapIssuance = [];

    transactions.forEach((item) => {
      let title = 'ISSUANCE';
      let type = '';
      let to = item.to;
      let status = item.status;
      let researcherName;
      if (!item.to) {
        let exitCompleted = completed.find(cItem => (cItem.previousId === item.txid && cItem.type === 'DONATION'));
        if (exitCompleted) {
          return;
        }
        let donationCompletedTask = (donationInformation.completedTasks || []).find(task => task.bitmarkId === item.txid);
        if (donationCompletedTask && donationCompletedTask.study) {
          title = 'waiting for researcher to accept...'.toUpperCase();
          status = 'waiting';
          let outgoingTransferOffer;
          if (transferOffers.outgoingTransferOffers) {
            outgoingTransferOffer = transferOffers.outgoingTransferOffers.find(ot => ot.bitmark_id === item.txid);
          }
          if (outgoingTransferOffer && outgoingTransferOffer.status === 'cancelled') {
            title = 'CANCELLED BY YOU';
            status = 'canceled';
          } else if (outgoingTransferOffer && outgoingTransferOffer.status === 'rejected') {
            title = 'REJECTED BY RESEARCHER';
            status = 'rejected';
          }
          type = 'DONATION';
          to = donationCompletedTask.study.researcherAccount;
          researcherName = donationCompletedTask.study.researcherName.substring(0, donationCompletedTask.study.researcherName.indexOf(','));
        }
      } else {
        title = 'SEND';
        type = 'P2P TRANSFER';
        let exitCompleted = completed.find(cItem => (cItem.txid === item.previousId && cItem.type === 'DONATION'));
        if (exitCompleted) {
          exitCompleted.previousId = exitCompleted.txid;
          exitCompleted.txid = item.txid;
          return;
        }
        let donationCompletedTask = (donationInformation.completedTasks || []).find(task => task.bitmarkId === item.previousId);
        if (donationCompletedTask && donationCompletedTask.study) {
          type = 'DONATION';
          to = donationCompletedTask.study.researcherAccount;
          researcherName = donationCompletedTask.study.researcherName.substring(0, donationCompletedTask.study.researcherName.indexOf(','));
        }
      }
      if (title === 'ISSUANCE') {
        if (mapIssuance[item.assetId] && mapIssuance[item.assetId][item.blockNumber]) {
          return;
        }
        if (!mapIssuance[item.assetId]) {
          mapIssuance[item.assetId] = {};
        }
        mapIssuance[item.assetId][item.blockNumber] = true;
      }
      completed.push({
        title,
        type,
        to,
        status,
        researcherName,
        assetId: item.assetId,
        blockNumber: item.blockNumber,
        key: completed.length,
        timestamp: item.timestamp,
        txid: item.txid,
        previousId: item.previousId,
        assetName: item.assetName,
        from: item.from,
      });
    });
  }
  completed = completed ? completed.sort((a, b) => {
    if (!a || !a.timestamp) return -1;
    if (!b || !b.timestamp) return 1;
    return moment(b.timestamp).toDate().getTime() - moment(a.timestamp).toDate().getTime();
  }) : completed;
  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_HISTORY, completed);
  DataCacheProcessor.setTransactionScreenData({
    totalCompleted: completed.length,
    completed: completed.slice(0, DataCacheProcessor.cacheLength),
  });

  EventEmitterService.emit(EventEmitterService.events.CHANGE_TRANSACTION_SCREEN_HISTORIES_DATA, { completed, donationInformation });
  console.log('completed :', completed);
  return { completed, donationInformation };
};

const doGetTransactionScreenActionRequired = async (length) => {
  let actionRequired;
  let transactionsScreenDataInCache = DataCacheProcessor.getTransactionScreenData();
  if (length !== undefined && length <= transactionsScreenDataInCache.actionRequired.length) {
    actionRequired = transactionsScreenDataInCache.actionRequired;
  } else {
    let allActionRequired = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_ACTION_REQUIRED)) || [];
    actionRequired = (length && length < allActionRequired.length) ? allActionRequired.slice(0, length) : allActionRequired;
  }
  return {
    actionRequired,
    totalTasks: transactionsScreenDataInCache.totalTasks,
    totalActionRequired: transactionsScreenDataInCache.totalActionRequired,
  }
};

const doGetAllTransfersOffers = async () => {
  let { actionRequired } = await doGetTransactionScreenActionRequired();
  let transferOffers = [];
  for (let item of actionRequired) {
    if (item.type === ActionTypes.transfer) {
      transferOffers.push(item.transferOffer);
    }
  }
  return transferOffers;
}

const doGetTransactionScreenHistories = async (length) => {
  let completed;
  let transactionsScreenDataInCache = DataCacheProcessor.getTransactionScreenData();
  if (length !== undefined && length <= transactionsScreenDataInCache.completed.length) {
    completed = transactionsScreenDataInCache.completed;
  } else {
    let allCompleted = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_HISTORY)) || [];
    completed = length ? allCompleted.slice(0, length) : allCompleted;
  }
  return {
    completed,
    totalCompleted: transactionsScreenDataInCache.totalCompleted,
  }
};

const doDecentralizedIssuance = async (touchFaceIdSession, token, encryptionKey) => {
  let result = await BitmarkService.doDecentralizedIssuance(touchFaceIdSession, userInformation.bitmarkAccountNumber, token, encryptionKey);
  // let donationInformation = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION)) || {};
  // await runGetLocalBitmarksInBackground(donationInformation);
  return result;
};

const doDecentralizedTransfer = async (touchFaceIdSession, token, ) => {
  let result = await BitmarkService.doDecentralizedTransfer(touchFaceIdSession, userInformation.bitmarkAccountNumber, token);
  // let donationInformation = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION)) || {};
  // await runGetLocalBitmarksInBackground(donationInformation);
  return result;
};

const doMarkRequestedNotification = async (result) => {
  let appInfo = await doGetAppInformation();
  appInfo = appInfo || {};

  if (result && result.alert && result.badge && result.sound &&
    (!appInfo.trackEvents || !appInfo.trackEvents.app_user_allow_notification)) {
    appInfo.trackEvents = appInfo.trackEvents || {};
    appInfo.trackEvents.app_user_allow_notification = true;
    await CommonModel.doSetLocalData(CommonModel.KEYS.APP_INFORMATION, appInfo);

    userInformation = userInformation || (await UserModel.doTryGetCurrentUser());
    await CommonModel.doTrackEvent({
      event_name: 'app_user_allow_notification',
      account_number: userInformation ? userInformation.bitmarkAccountNumber : null,
    });
  }
}
const doRemoveTestRecoveryPhaseActionRequiredIfAny = async () => {
  let testWriteRecoveryPhaseActionRequired = helper.getTestWriteRecoveryPhaseActionRequired();
  if (testWriteRecoveryPhaseActionRequired) {
    await helper.removeTestWriteRecoveryPhaseActionRequired();
    EventEmitterService.emit(EventEmitterService.events.NEED_RELOAD_USER_DATA);
  }
};

const DataProcessor = {
  doOpenApp,
  doLogin,
  doLogout,
  doStartBackgroundProcess,
  doReloadUserData,
  doReloadLocalBitmarks,
  doReloadDonationInformation,
  doReloadTrackingBitmark,

  doDeactiveApplication,
  doActiveBitmarkHealthData,
  doInactiveBitmarkHealthData,
  doJoinStudy,
  doLeaveStudy,
  doCompletedStudyTask,
  doDonateHealthData,
  doBitmarkHealthData,
  doDownloadBitmark,
  doUpdateViewStatus,
  doTrackingBitmark,
  doStopTrackingBitmark,
  doGetProvenance,
  doReloadIFTTTInformation,
  doRevokeIftttToken,
  doIssueIftttData,
  doAcceptTransferBitmark,
  doAcceptAllTransfers,
  doCancelTransferBitmark,
  doRejectTransferBitmark,
  doIssueFile,
  doTransferBitmark,
  doMigrateWebAccount,
  doSignInOnWebApp,
  doDecentralizedIssuance,
  doDecentralizedTransfer,

  doGetLocalBitmarks,
  doGetTrackingBitmarks,
  doGetLocalBitmarkInformation,
  doGetDonationInformation,
  doGetTrackingBitmarkInformation,
  doGetIftttInformation,

  doGetTransactionScreenActionRequired,
  doGetAllTransfersOffers,
  doGetTransactionScreenHistories,

  doMarkRequestedNotification,
  doRemoveTestRecoveryPhaseActionRequiredIfAny,

  getApplicationVersion,
  getApplicationBuildNumber,
  getUserInformation,
  isAppLoadingData: () => isLoadingData,
};

export { DataProcessor };
