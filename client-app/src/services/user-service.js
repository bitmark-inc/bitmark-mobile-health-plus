import { CommonModel } from './../models';
import { merge } from 'lodash';
import { config } from '../configs';

const doGetCurrentUser = async () => {
  let userInfo = await CommonModel.doGetLocalData(CommonModel.app_local_data_key);
  if (userInfo.network !== config.network) {
    await doRemoveUserInfo();
    return {};
  }
  return userInfo;
};

const doTryGetCurrentUser = () => {
  return new Promise((resolve) => {
    doGetCurrentUser().then(resolve).catch(error => {
      console.log('UserService doTryGetCurrentUser error:', error);
      resolve({});
    });
  });
};

const doUpdateUserInfo = async (userInfo) => {
  let currentUser = await doGetCurrentUser();
  currentUser = merge({}, currentUser, userInfo);
  currentUser.network = config.network;
  return await CommonModel.doSetLocalData(CommonModel.app_local_data_key, currentUser);
};

const doRemoveUserInfo = async () => {
  return await CommonModel.doSetLocalData(CommonModel.app_local_data_key, {});
};

let UserService = {
  doTryGetCurrentUser,
  doGetCurrentUser,
  doUpdateUserInfo,
  doRemoveUserInfo,
};

export { UserService };