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
import { FileUtil, sortList } from '../utils';

let userInformation = {};
let userCacheScreenData = {
  transactionsScreen: {
    totalActionRequired: 0,
    actionRequiredLength: 20,
    actionRequired: [],

    totalCompleted: 0,
    completedLength: 20,
    completed: [],
  },
  propertiesScreen: {
    localAssets: [],
    localAssetsLength: 20,
    totalAssets: 0,
    existNewAsset: false,
    totalBitmarks: 0,

    trackingBitmarks: [],
    trackingBitmarksLength: 20,
    totalTrackingBitmarks: 0,
    existNewTrackingBitmark: false,
  },
};

let isLoadingData = false;
// ================================================================================================================================================
const doCheckNewDonationInformation = async (donationInformation) => {
  if (donationInformation) {
    let oldData = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION)) || {};
    if (JSON.stringify(donationInformation) !== JSON.stringify(oldData)) {
      await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION, donationInformation);
      EventEmitterService.emit(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, donationInformation);
      await doGenerateTransactionActionRequiredData();
      await doGenerateTransactionHistoryData();
    }
  }
};

const doCheckNewActiveIncomingTransferOffers = async (activeIncomingTransferOffers) => {
  if (activeIncomingTransferOffers) {
    let oldData = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSFER_OFFERS)) || [];
    if (JSON.stringify(activeIncomingTransferOffers) !== JSON.stringify(oldData)) {
      await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSFER_OFFERS, activeIncomingTransferOffers);
    }
    await doGenerateTransactionActionRequiredData();
  }
};

const doCheckNewIftttInformation = async (iftttInformation) => {
  if (iftttInformation) {
    let oldData = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_IFTTT_INFORMATION)) || {};
    if (JSON.stringify(iftttInformation) !== JSON.stringify(oldData)) {
      await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_IFTTT_INFORMATION, iftttInformation);
      EventEmitterService.emit(EventEmitterService.events.CHANGE_USER_DATA_IFTTT_INFORMATION, iftttInformation);
      await doGenerateTransactionActionRequiredData();
    }
  }
};

const doCheckNewTransactions = async (transactions) => {
  if (transactions) {
    let oldData = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS)) || [];
    if (JSON.stringify(transactions) !== JSON.stringify(oldData)) {
      await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS, transactions);
    }
    await doGenerateTransactionHistoryData();
  }
};

const doCheckNewTrackingBitmarks = async (trackingBitmarks) => {
  if (trackingBitmarks) {
    let oldData = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS)) || [];
    if (JSON.stringify(trackingBitmarks) !== JSON.stringify(oldData)) {
      await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS, trackingBitmarks);
      userCacheScreenData.propertiesScreen.totalTrackingBitmarks = trackingBitmarks.length;
      userCacheScreenData.propertiesScreen.existNewTrackingBitmark = (trackingBitmarks || []).findIndex(bm => !bm.isViewed) >= 0;
      userCacheScreenData.propertiesScreen.trackingBitmarks = trackingBitmarks.splice(0, userCacheScreenData.propertiesScreen.trackingBitmarksLength);
      EventEmitterService.emit(EventEmitterService.events.CHANGE_USER_DATA_TRACKING_BITMARKS, trackingBitmarks);
    }
  }
};

const doCheckNewBitmarks = async (localAssets) => {
  if (localAssets) {
    let oldData = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS)) || [];
    if (JSON.stringify(localAssets) !== JSON.stringify(oldData)) {
      await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS, localAssets);
      userCacheScreenData.propertiesScreen.totalBitmarks = 0;
      localAssets.forEach(asset => userCacheScreenData.propertiesScreen.totalBitmarks += asset.bitmarks.length);
      userCacheScreenData.propertiesScreen.totalAssets = localAssets.length;
      userCacheScreenData.propertiesScreen.existNewAsset = localAssets.findIndex(asset => !asset.isViewed) >= 0;
      userCacheScreenData.propertiesScreen.localAssets = localAssets.splice(0, userCacheScreenData.propertiesScreen.localAssetsLength);

      EventEmitterService.emit(EventEmitterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS, localAssets);
    }
  }
};
// ================================================================================================================================================

const doCheckRunning = (checkRunning) => {
  return new Promise((resolve) => {
    let checkAndReturn = () => {
      let isRunning = checkRunning();
      if (!isRunning) {
        resolve();
      } else {
        setTimeout(checkAndReturn, 200);
      }
    }
    checkAndReturn();
  })
};

const recheckLocalAssets = (localAssets, donationInformation, ) => {
  if (donationInformation && donationInformation.completedTasks) {
    for (let asset of localAssets) {
      for (let bitmark of asset.bitmarks) {
        let isDonating = donationInformation.completedTasks.findIndex(item => (item.taskType !== donationInformation.commonTaskIds.bitmark_health_data && item.bitmarkId === bitmark.id));
        bitmark.displayStatus = isDonating >= 0 ? 'donating' : bitmark.displayStatus;
      }
    }
  }
  localAssets = localAssets.filter(asset => {
    if (asset.bitmarks && asset.bitmarks.length === 1 && asset.bitmarks[0].displayStatus === 'donating') {
      return false;
    }
    return true;
  });
  return localAssets;
};

let isRunningGetActiveIncomingTransferOfferInBackground = 0;
let resultActiveIncomingTransferOffers;
const runGetActiveIncomingTransferOfferInBackground = () => {
  return new Promise((resolve) => {
    if (isRunningGetActiveIncomingTransferOfferInBackground) {
      isRunningGetActiveIncomingTransferOfferInBackground++;
      return doCheckRunning(() => isRunningGetActiveIncomingTransferOfferInBackground).then(() => {
        resolve(resultActiveIncomingTransferOffers);
        isRunningGetActiveIncomingTransferOfferInBackground--;
        if (!isRunningGetActiveIncomingTransferOfferInBackground) {
          resultActiveIncomingTransferOffers = null;
        }
      });
    }
    isRunningGetActiveIncomingTransferOfferInBackground++;
    TransactionService.doGetActiveIncomingTransferOffers(userInformation.bitmarkAccountNumber).then(activeIncomingTransferOffers => {
      resultActiveIncomingTransferOffers = activeIncomingTransferOffers || [];
      resolve(activeIncomingTransferOffers || []);
      isRunningGetActiveIncomingTransferOfferInBackground--;
      if (!isRunningGetActiveIncomingTransferOfferInBackground) {
        resultActiveIncomingTransferOffers = null;
      }
    }).catch(error => {
      resolve([]);
      isRunningGetActiveIncomingTransferOfferInBackground--;
      if (!isRunningGetActiveIncomingTransferOfferInBackground) {
        resultActiveIncomingTransferOffers = null;
      }
      console.log('runOnBackground  runGetActiveIncomingTransferOfferInBackground error :', error);
    });
  });
};

let isRunningGetTransactionsInBackground = 0;
let resultTransactions = null;
const runGetTransactionsInBackground = () => {
  return new Promise((resolve) => {
    if (isRunningGetTransactionsInBackground) {
      isRunningGetTransactionsInBackground++;
      return doCheckRunning(() => isRunningGetTransactionsInBackground).then(() => {
        resolve(resultTransactions);
        isRunningGetTransactionsInBackground--;
        if (!isRunningGetTransactionsInBackground) {
          resultTransactions = null;
        }
      });
    }
    isRunningGetTransactionsInBackground++;
    TransactionService.doGetAllTransactions(userInformation.bitmarkAccountNumber).then(transactions => {
      resultTransactions = transactions || [];
      resolve(resultTransactions);
      isRunningGetTransactionsInBackground--;
      if (!isRunningGetTransactionsInBackground) {
        resultTransactions = null;
      }
    }).catch(error => {
      resolve([]);
      isRunningGetTransactionsInBackground--;
      if (!isRunningGetTransactionsInBackground) {
        resultTransactions = null;
      }
      console.log('runOnBackground  runGetTransactionsInBackground error :', error);
    });
  });
};

let isRunningGetLocalBitmarksInBackground = 0;
let resultLocalBitmarks;
const runGetLocalBitmarksInBackground = () => {
  return new Promise((resolve) => {
    if (isRunningGetLocalBitmarksInBackground) {
      isRunningGetLocalBitmarksInBackground++;
      return doCheckRunning(() => isRunningGetLocalBitmarksInBackground).then(() => {
        resolve(resultLocalBitmarks);
        isRunningGetLocalBitmarksInBackground--;
        if (!isRunningGetLocalBitmarksInBackground) {
          resultLocalBitmarks = null;
        }
      });
    }
    isRunningGetLocalBitmarksInBackground++;
    BitmarkService.doGetBitmarks(userInformation.bitmarkAccountNumber).then(localAssets => {
      resultLocalBitmarks = localAssets || []
      resolve(resultLocalBitmarks);
      isRunningGetLocalBitmarksInBackground--;
      if (!isRunningGetLocalBitmarksInBackground) {
        resultLocalBitmarks = null;
      }
    }).catch(error => {
      resolve();
      isRunningGetLocalBitmarksInBackground--;
      if (!isRunningGetLocalBitmarksInBackground) {
        resultLocalBitmarks = null;
      }
      console.log('runOnBackground  runGetLocalBitmarksInBackground error :', error);
    });
  });
};

let isRunningGetDonationInformationInBackground = 0;
let resultDonationInformation;
const runGetDonationInformationInBackground = () => {
  return new Promise((resolve) => {
    if (isRunningGetDonationInformationInBackground) {
      isRunningGetDonationInformationInBackground++;
      return doCheckRunning(() => isRunningGetDonationInformationInBackground).then(() => {
        resolve(resultDonationInformation);
        isRunningGetDonationInformationInBackground--;
        if (!isRunningGetDonationInformationInBackground) {
          resultDonationInformation = null;
        }
      });
    }
    isRunningGetDonationInformationInBackground++;
    DonationService.doGetUserInformation(userInformation.bitmarkAccountNumber).then(donationInformation => {
      resultDonationInformation = donationInformation || {};
      resolve(resultDonationInformation);
      isRunningGetDonationInformationInBackground--;
      if (!isRunningGetDonationInformationInBackground) {
        resultDonationInformation = null;
      }
    }).catch(error => {
      resolve();
      isRunningGetDonationInformationInBackground--;
      if (!isRunningGetDonationInformationInBackground) {
        resultDonationInformation = null;
      }
      console.log('runOnBackground  runGetDonationInformationInBackground error :', error);
    });
  });
};

let isRunningGetTrackingBitmarksInBackground = 0;
let resultTrackingBitmarks;
const runGetTrackingBitmarksInBackground = () => {
  return new Promise((resolve) => {
    if (isRunningGetTrackingBitmarksInBackground) {
      isRunningGetTrackingBitmarksInBackground++;
      return doCheckRunning(() => isRunningGetTrackingBitmarksInBackground).then(() => {
        resolve(resultTrackingBitmarks);
        isRunningGetTrackingBitmarksInBackground--;
        if (!isRunningGetTrackingBitmarksInBackground) {
          resultTrackingBitmarks = null;
        }
      });
    }
    isRunningGetTrackingBitmarksInBackground++;
    BitmarkService.doGetTrackingBitmarks(userInformation.bitmarkAccountNumber).then(trackingBitmarks => {
      resultTrackingBitmarks = trackingBitmarks || [];
      resolve(resultTrackingBitmarks);
      isRunningGetTrackingBitmarksInBackground--;
      if (!isRunningGetTrackingBitmarksInBackground) {
        resultTrackingBitmarks = null;
      }
    }).catch(error => {
      resolve();
      isRunningGetTrackingBitmarksInBackground--;
      if (!isRunningGetTrackingBitmarksInBackground) {
        resultTrackingBitmarks = null;
      }
      console.log('runOnBackground  runGetTrackingBitmarksInBackground error :', error);
    });
  });
};

let isRunningGetIFTTTInformationInBackground = 0;
let resultIftttInformation;
const runGetIFTTTInformationInBackground = () => {
  return new Promise((resolve) => {
    if (isRunningGetIFTTTInformationInBackground) {
      isRunningGetIFTTTInformationInBackground++;
      return doCheckRunning(() => isRunningGetIFTTTInformationInBackground).then(() => {
        resolve(resultIftttInformation);
        isRunningGetIFTTTInformationInBackground--;
        if (!isRunningGetIFTTTInformationInBackground) {
          resultIftttInformation = null;
        }
      });
    }
    isRunningGetIFTTTInformationInBackground++;
    IftttModel.doGetIFtttInformation(userInformation.bitmarkAccountNumber).then(iftttInformation => {
      resultIftttInformation = iftttInformation || {};
      resolve(resultIftttInformation);
      isRunningGetIFTTTInformationInBackground--;
      if (!isRunningGetIFTTTInformationInBackground) {
        resultIftttInformation = null;
      }
    }).catch(error => {
      resolve();
      isRunningGetIFTTTInformationInBackground--;
      if (!isRunningGetIFTTTInformationInBackground) {
        resultIftttInformation = null;
      }
      console.log('runOnBackground  runGetIFTTTInformationInBackground error :', error);
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
          runGetTransactionsInBackground(),
          runGetActiveIncomingTransferOfferInBackground(),
          runGetDonationInformationInBackground(),
          runGetTrackingBitmarksInBackground(),
          runGetIFTTTInformationInBackground(),
        ]).then(resolve);
      });
    };
    let parallelResults = await runParallel();
    await doCheckNewTransactions(parallelResults[0]);
    await doCheckNewActiveIncomingTransferOffers(parallelResults[1]);
    await doCheckNewDonationInformation(parallelResults[2]);
    await doCheckNewTrackingBitmarks(parallelResults[3]);
    await doCheckNewIftttInformation(parallelResults[4]);

    let localAsset = await runGetLocalBitmarksInBackground();
    localAsset = recheckLocalAssets(localAsset, parallelResults[2]);
    await doCheckNewBitmarks(localAsset);
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

const doReloadIncomingTransferOffers = async () => {
  let activeIncomingTransferOffers = await runGetActiveIncomingTransferOfferInBackground();
  await doCheckNewActiveIncomingTransferOffers(activeIncomingTransferOffers);
  return activeIncomingTransferOffers;
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
      setTimeout(() => {
        EventEmitterService.emit(EventEmitterService.events.APP_RECEIVED_NOTIFICATION, notificationData.data);
      }, 1000);
    } else if (notificationData.event === 'transfer_request' || notificationData.event === 'transfer_completed' || notificationData.event === 'transfer_accepted') {
      runGetActiveIncomingTransferOfferInBackground();
      runGetTransactionsInBackground();
    } else if (notificationData.event === 'transfer_rejected' || notificationData.event === 'transfer_failed') {
      runGetLocalBitmarksInBackground();
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
    await NotificationService.doCheckNotificationPermission();
  }
  return userInformation;
};

const doLogin = async (touchFaceIdSession) => {
  userInformation = await AccountService.doGetCurrentAccount(touchFaceIdSession);
  return userInformation;
};

const doLogout = async () => {
  if (userInformation.notificationUUID) {
    let signatureData = await CommonModel.doTryCreateSignatureData('Touch/Face ID or a passcode is required to authorize your transactions')
    await NotificationService.doTryDeregisterNotificationInfo(userInformation.bitmarkAccountNumber, userInformation.notificationUUID, signatureData);
  }
  await AccountModel.doLogout();
  await UserModel.doRemoveUserInfo();
  userInformation = {};
};


const doDeactiveApplication = async () => {
  stopInterval();
};

const doOpenApp = async () => {
  userInformation = await UserModel.doTryGetCurrentUser();
  if (userInformation && userInformation.bitmarkAccountNumber) {
    configNotification();
    let localAssets = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS)) || [];
    userCacheScreenData.propertiesScreen.totalBitmarks = 0;
    localAssets.forEach(asset => userCacheScreenData.propertiesScreen.totalBitmarks += asset.bitmarks.length);
    userCacheScreenData.propertiesScreen.totalAssets = localAssets.length;
    userCacheScreenData.propertiesScreen.existNewAsset = localAssets.findIndex(asset => !asset.isViewed) >= 0;
    userCacheScreenData.propertiesScreen.localAssets = localAssets.splice(0, userCacheScreenData.propertiesScreen.localAssetsLength);

    let trackingBitmarks = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS)) || [];
    userCacheScreenData.propertiesScreen.totalTrackingBitmarks = trackingBitmarks.length;
    userCacheScreenData.propertiesScreen.existNewTrackingBitmark = (trackingBitmarks || []).findIndex(bm => !bm.isViewed) >= 0;
    userCacheScreenData.propertiesScreen.trackingBitmarks = trackingBitmarks.splice(0, userCacheScreenData.propertiesScreen.trackingBitmarksLength);

    let actionRequired = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_ACTION_REQUIRED)) || [];
    userCacheScreenData.transactionsScreen.totalActionRequired = actionRequired.length;
    userCacheScreenData.transactionsScreen.actionRequired = actionRequired.splice(0, userCacheScreenData.transactionsScreen.actionRequiredLength);

    let completed = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_HISTORY)) || [];
    userCacheScreenData.transactionsScreen.totalCompleted = completed.length;
    userCacheScreenData.transactionsScreen.completed = completed.splice(0, userCacheScreenData.transactionsScreen.completedLength);
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
        userCacheScreenData.propertiesScreen.totalTrackingBitmarks = trackingBitmarks.length;
        userCacheScreenData.propertiesScreen.existNewTrackingBitmark = (trackingBitmarks || []).findIndex(bm => !bm.isViewed) >= 0;
        userCacheScreenData.propertiesScreen.trackingBitmarks = trackingBitmarks.splice(0, userCacheScreenData.propertiesScreen.trackingBitmarksLength);
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
  let trackingBitmarks = await BitmarkModel.doStopTrackingBitmark(userInformation.bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, bitmark.id);
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
  let activeIncomingTransferOffers = await runGetActiveIncomingTransferOfferInBackground();
  await doCheckNewActiveIncomingTransferOffers(activeIncomingTransferOffers);
  return activeIncomingTransferOffers;
};

const doAcceptAllTransfers = async (touchFaceIdSession, transferOffers) => {
  for (let transferOffer of transferOffers) {
    await TransactionService.doAcceptTransferBitmark(touchFaceIdSession, transferOffer);
  }
  return await doReloadIncomingTransferOffers();
};

const doCancelTransferBitmark = async (touchFaceIdSession, transferOfferId) => {
  await TransactionService.doCancelTransferBitmark(touchFaceIdSession, transferOfferId);
  let activeIncomingTransferOffers = await runGetActiveIncomingTransferOfferInBackground();
  await doCheckNewActiveIncomingTransferOffers(activeIncomingTransferOffers);
  return activeIncomingTransferOffers;
};

const doRejectTransferBitmark = async (touchFaceIdSession, transferOffer, ) => {
  await TransactionService.doRejectTransferBitmark(touchFaceIdSession, transferOffer);
  let activeIncomingTransferOffers = await runGetActiveIncomingTransferOfferInBackground();
  await doCheckNewActiveIncomingTransferOffers(activeIncomingTransferOffers);
  return activeIncomingTransferOffers;
};

const doIssueFile = async (touchFaceIdSession, filePath, assetName, metadataList, quantity) => {
  let result = await BitmarkService.doIssueFile(touchFaceIdSession, filePath, assetName, metadataList, quantity);
  let localAssets = await runGetLocalBitmarksInBackground();
  let donationInformation = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION)) || {};
  localAssets = recheckLocalAssets(localAssets, donationInformation);
  await doCheckNewBitmarks(localAssets);
  return result;
};

const doTransferBitmark = async (touchFaceIdSession, bitmarkId, receiver) => {
  let result = await TransactionService.doTransferBitmark(touchFaceIdSession, bitmarkId, receiver);
  let activeIncomingTransferOffers = await runGetActiveIncomingTransferOfferInBackground();
  let localAssets = await runGetLocalBitmarksInBackground();
  let donationInformation = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION)) || {};
  doCheckNewActiveIncomingTransferOffers(activeIncomingTransferOffers);
  localAssets = recheckLocalAssets(localAssets, donationInformation);
  await doCheckNewBitmarks(localAssets);
  return result;
};

const doMigrateWebAccount = async (touchFaceIdSession, token) => {
  let result = await BitmarkService.doConfirmWebAccount(touchFaceIdSession, userInformation.bitmarkAccountNumber, token);
  let localAssets = await runGetLocalBitmarksInBackground();
  let donationInformation = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION)) || {};
  localAssets = recheckLocalAssets(localAssets, donationInformation);
  await doCheckNewBitmarks(localAssets);
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
  console.log('doGetLocalBitmarks :', length, userCacheScreenData.propertiesScreen.localAssets.length);
  let localAssets;
  if (length && length <= userCacheScreenData.propertiesScreen.localAssets.length) {
    localAssets = userCacheScreenData.propertiesScreen.localAssets;
  } else {
    let allLocalAssets = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS)) || [];
    localAssets = length ? allLocalAssets.splice(0, length) : allLocalAssets;
  }
  return {
    localAssets,
    totalAssets: userCacheScreenData.propertiesScreen.totalAssets,
    totalBitmarks: userCacheScreenData.propertiesScreen.totalBitmarks,
    existNewAsset: userCacheScreenData.propertiesScreen.existNewAsset,
  };
};

const doGetTrackingBitmarks = async (length) => {
  let trackingBitmarks;
  if (length && length <= userCacheScreenData.propertiesScreen.trackingBitmarks.length) {
    trackingBitmarks = userCacheScreenData.propertiesScreen.trackingBitmarks;
  } else {
    let allTrackingBitmarks = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS)) || [];
    trackingBitmarks = length ? allTrackingBitmarks.splice(0, length) : allTrackingBitmarks;
  }

  return {
    trackingBitmarks,
    totalTrackingBitmarks: userCacheScreenData.propertiesScreen.totalTrackingBitmarks,
    existNewTrackingBitmark: userCacheScreenData.propertiesScreen.existNewTrackingBitmark
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
};
const doGenerateTransactionActionRequiredData = async () => {
  let actionRequired;
  let activeIncomingTransferOffers = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSFER_OFFERS)) || [];
  if (activeIncomingTransferOffers) {
    actionRequired = actionRequired || [];
    activeIncomingTransferOffers.forEach((item) => {
      actionRequired.push({
        key: actionRequired.length,
        transferOffer: item,
        type: ActionTypes.transfer,
        typeTitle: 'OWNERSHIP TRANSFER REQUEST ',
        timestamp: moment(item.created_at),
      });
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
    });
  }
  actionRequired = actionRequired ? sortList(actionRequired, (a, b) => {
    if (a.important) { return -1; }
    if (b.important) { return 1; }
    if (!a.timestamp) return 1;
    if (!b.timestamp) return 1;
    return moment(b.timestamp).toDate().getTime() - moment(a.timestamp).toDate().getTime();
  }) : actionRequired;

  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_ACTION_REQUIRED, actionRequired);
  userCacheScreenData.transactionsScreen.totalActionRequired = actionRequired.length;
  userCacheScreenData.transactionsScreen.actionRequired = actionRequired.splice(0, userCacheScreenData.transactionsScreen.actionRequiredLength);

  EventEmitterService.emit(EventEmitterService.events.CHANGE_TRANSACTION_SCREEN_ACTION_REQUIRED_DATA, { actionRequired, donationInformation });
  console.log('actionRequired :', actionRequired);
  // if (!transactionScreenData) {
  //   transactionScreenData = {};
  // }
  // transactionScreenData.actionRequired = actionRequired;
  // transactionScreenData.donationInformation = donationInformation;
  return { actionRequired, donationInformation };
};

const doGenerateTransactionHistoryData = async () => {

  let transactions = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS)) || [];
  let donationInformation = await doGetDonationInformation();

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
          type = 'DONATION';
          status = 'waiting';
          to = donationCompletedTask.study.researcherAccount;
          researcherName = donationCompletedTask.study.researcherName.substring(0, donationCompletedTask.study.researcherName.indexOf(','));
        }
      } else {
        title = 'TRANSFER';
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
  completed = completed ? sortList(completed, (a, b) => {
    if (!a || !a.timestamp) return -1;
    if (!b || !b.timestamp) return -1;
    return moment(b.timestamp).toDate().getTime() - moment(a.timestamp).toDate().getTime();
  }) : completed;
  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_HISTORY, completed);
  userCacheScreenData.transactionsScreen.totalCompleted = completed.length;
  userCacheScreenData.transactionsScreen.completed = completed.splice(0, userCacheScreenData.transactionsScreen.completedLength);

  EventEmitterService.emit(EventEmitterService.events.CHANGE_TRANSACTION_SCREEN_HISTORIES_DATA, { completed, donationInformation });
  console.log('completed :', completed);
  // if (!transactionScreenData) {
  //   transactionScreenData = {};
  // }
  // transactionScreenData.completed = completed;
  // transactionScreenData.donationInformation = donationInformation;
  return { completed, donationInformation };
};

const doGetTransactionScreenActionRequired = async (length) => {
  let actionRequired;
  if (length && length <= userCacheScreenData.transactionsScreen.actionRequired.length) {
    actionRequired = userCacheScreenData.transactionsScreen.actionRequired;
  } else {
    let allActionRequired = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_ACTION_REQUIRED)) || [];
    actionRequired = (length && length < allActionRequired.length) ? allActionRequired.splice(0, length) : allActionRequired;
  }
  return {
    actionRequired,
    totalActionRequired: userCacheScreenData.transactionsScreen.totalActionRequired,
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
  if (length && length <= userCacheScreenData.transactionsScreen.completed.length) {
    completed = userCacheScreenData.transactionsScreen.completed;
  } else {
    let allCompleted = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_HISTORY)) || [];
    completed = length ? allCompleted.splice(0, length) : allCompleted;
  }
  return {
    completed,
    totalCompleted: userCacheScreenData.transactionsScreen.totalCompleted,
  }
};

const DataProcessor = {
  doOpenApp,
  doLogin,
  doLogout,
  doStartBackgroundProcess,
  doReloadUserData,
  doReloadDonationInformation,
  doReloadTrackingBitmark,
  doReloadIncomingTransferOffers,

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

  doGetLocalBitmarks,
  doGetTrackingBitmarks,
  doGetLocalBitmarkInformation,
  doGetDonationInformation,
  doGetTrackingBitmarkInformation,
  doGetIftttInformation,

  doGetTransactionScreenActionRequired,
  doGetAllTransfersOffers,
  doGetTransactionScreenHistories,

  getApplicationVersion,
  getApplicationBuildNumber,
  getUserInformation,
  isAppLoadingData: () => isLoadingData,
};

export { DataProcessor };