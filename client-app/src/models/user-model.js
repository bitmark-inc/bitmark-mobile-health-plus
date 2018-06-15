import { CommonModel } from './common-model';
import { merge } from 'lodash';
import { config } from '../configs';

const doGetCurrentUser = async () => {
  let userInfo = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_INFORMATION)) || {};
  if (userInfo.network !== config.network) {
    await doRemoveUserInfo();
    return {};
  }
  return userInfo;
};

const doTryGetCurrentUser = () => {
  return new Promise((resolve) => {
    doGetCurrentUser().then(resolve).catch(error => {
      console.log('UserModel doTryGetCurrentUser error:', error);
      resolve({});
    });
  });
};

const doUpdateUserInfo = async (userInfo) => {
  let currentUser = await doGetCurrentUser();
  currentUser = merge({}, currentUser, userInfo);
  currentUser.network = config.network;
  return await CommonModel.doSetLocalData(CommonModel.KEYS.USER_INFORMATION, currentUser);
};

const resetUserLocalData = async () => {
  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS, []);
  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS, []);
  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSFER_OFFERS, []);
  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS, []);
  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_DONATION_INFORMATION, {});

  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_ACTION_REQUIRED, []);
  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS_HISTORY, []);
}

const doRemoveUserInfo = async () => {
  await resetUserLocalData();

  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_INFORMATION, {});
};

let UserModel = {
  doTryGetCurrentUser,
  doGetCurrentUser,
  doUpdateUserInfo,
  doRemoveUserInfo,
  resetUserLocalData,
};

export { UserModel };