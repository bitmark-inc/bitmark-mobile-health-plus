import { AccountModel, CommonModel, BitmarkSDK } from './../models';
import { UserService } from './user-service';
import { BitmarkService } from './bitmark-service';
import { config } from '../configs';
import { NotificationService } from './notification-service';

// ================================================================================================\
const doCreateAccount = async (touchFaceIdSession) => {
  let userInfo = await AccountModel.doGetCurrentAccount(touchFaceIdSession);
  await UserService.doUpdateUserInfo(userInfo);
  return userInfo;
}

const doLogin = async (touchFaceIdSession) => {
  let userInfo = await AccountModel.doGetCurrentAccount(touchFaceIdSession);
  await UserService.doUpdateUserInfo(userInfo);
  return userInfo;
};

const doCreateSignatureData = async (touchFaceIdMessage) => {
  let signatureData = await CommonModel.doTryCreateSignatureData(touchFaceIdMessage);
  if (!signatureData) {
    return null;
  }
  let userInfo = await UserService.doGetCurrentUser();
  signatureData.account_number = userInfo.bitmarkAccountNumber;
  return signatureData;
};

const doLogout = async () => {
  let userInfo = await UserService.doGetCurrentUser();
  if (userInfo.notificationUUID) {
    let signatureData = await CommonModel.doTryCreateSignatureData('Touch/Face ID or a passcode is required to authorize your transactions')
    await NotificationService.doDeregisterNotificationInfo(userInfo.bitmarkAccountNumber, userInfo.notificationUUID, signatureData);
  }
  await AccountModel.doLogout();
  await UserService.doRemoveUserInfo();
};


const doGetBitmarks = async (userInfo) => {
  let localAssets = await BitmarkService.doGetBitmarks(userInfo.bitmarkAccountNumber);
  return { localAssets };
};

const doRegisterNotificationInfo = async (notificationUUID) => {
  let userInfo = await UserService.doGetCurrentUser();
  let signatureData = CommonModel.doTryCreateSignatureData('Touch/Face ID or a passcode is required to authorize your transactions');
  await NotificationService.doRegisterNotificationInfo(userInfo.bitmarkAccountNumber, notificationUUID, signatureData);
  console.log('doRegisterNotificationInfo success', notificationUUID);
  userInfo.notificationUUID = notificationUUID;
  await UserService.doUpdateUserInfo(userInfo);
};

const doValidateBitmarkAccountNumber = async (accountNumber) => {
  let userInfo = await UserService.doGetCurrentUser();
  if (userInfo.bitmarkAccountNumber === accountNumber) {
    throw new Error('Can not transfer for current user!');
  }
  return await BitmarkSDK.validateAccountNumber(accountNumber, config.bitmark_network);
}

// ================================================================================================
// ================================================================================================

let AccountService = {
  doCreateAccount,
  doLogin,
  doLogout,
  doCreateSignatureData,
  doGetBitmarks,
  doRegisterNotificationInfo,
  doValidateBitmarkAccountNumber,
};

export { AccountService };