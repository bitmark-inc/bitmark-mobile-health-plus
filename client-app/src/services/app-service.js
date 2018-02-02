
import { CommonService } from './common-service';
import { AccountService } from './account-service';

// ================================================================================================
// ================================================================================================
// ================================================================================================

const getCurrentUser = async () => {
  return await CommonService.getLocalData(CommonService.app_local_data_key);
};

const createNewUser = async () => {
  let userInfo = await AccountService.createNewAccount();
  await CommonService.setLocalData(CommonService.app_local_data_key, userInfo);
  return userInfo;
};

const doLogin = async (phase24Words) => {
  let userInfo = AccountService.accessBy24Words(phase24Words);
  await CommonService.setLocalData(CommonService.app_local_data_key, userInfo);
  return userInfo;
};

const doLogout = async () => {
  await AccountService.logout();
  await CommonService.setLocalData(CommonService.app_local_data_key, {});
};

const doPairMarketAccount = async (token) => {
  //TODO 
  let pairUrl = 'http://192.168.0.100:8088/s/api/qrcode';
  let userInfo = await CommonService.getLocalData(CommonService.app_local_data_key);

  let marketAccountInfo = await AccountService.pairtMarketAccounut(userInfo.bitmarkAccountNumber, token, pairUrl);
  userInfo.markets = {
    'totemic': {
      name: marketAccountInfo.name,
      email: marketAccountInfo.email,
      account_number: marketAccountInfo.account_number,
    }
  }
  await CommonService.setLocalData(CommonService.app_local_data_key, userInfo);
  return userInfo;
};

// ================================================================================================
// ================================================================================================
// ================================================================================================
let AppService = {
  getCurrentUser,
  createNewUser,
  doLogin,
  doLogout,
  doPairMarketAccount,
}

export {
  AppService
}