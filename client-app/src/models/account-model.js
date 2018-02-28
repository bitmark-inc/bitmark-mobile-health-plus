import { BitmarkSDK } from './adapters';
import { config } from '../configs';

const doCreateAccount = async () => {
  return await BitmarkSDK.newAccount(config.bitmark_network);
};

const doLogin = async (pharse24Words) => {
  return await BitmarkSDK.newAccountFrom24Words(pharse24Words);
}

const doGetCurrentAccount = async (touchFaceIdSession) => {
  return await BitmarkSDK.accountInfo(touchFaceIdSession);
};

const doCheck24Words = async (pharse24Words) => {
  return await BitmarkSDK.try24Words(pharse24Words);
};

const doLogout = async () => {
  return await BitmarkSDK.removeAccount();
};

let AccountModel = {
  doGetCurrentAccount,
  doCheck24Words,
  doCreateAccount,
  doLogin,
  doLogout,
}

export {
  AccountModel,
}