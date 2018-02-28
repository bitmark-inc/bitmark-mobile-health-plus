import { CommonModel } from './../models';
import { merge } from 'lodash';

const doGetCurrentUser = async () => {
  return await CommonModel.doGetLocalData(CommonModel.app_local_data_key);
};

const doUpdateUserInfo = async (userInfo) => {
  let currentUser = await doGetCurrentUser();
  currentUser = merge({}, currentUser, userInfo);
  return await CommonModel.doSetLocalData(CommonModel.app_local_data_key, currentUser);
};

const doRemoveUserInfo = async () => {
  return await CommonModel.doSetLocalData(CommonModel.app_local_data_key, {});
};

let UserService = {
  doGetCurrentUser,
  doUpdateUserInfo,
  doRemoveUserInfo,
};

export { UserService };