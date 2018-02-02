
import { CommonService } from './common-service';
import { AccountService } from './account-service';

// ================================================================================================
// ================================================================================================
// ================================================================================================
// TODO
let totemicMarketPairUrl = 'http://192.168.0.100:8088';

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

  //TODO
  let marketAccountInfo = await AccountService.checkPairingStatus(userInfo.bitmarkAccountNumber, totemicMarketPairUrl + '/s/api/mobile/pairing-account');
  userInfo.markets = {
    'totemic': {
      name: marketAccountInfo.name,
      email: marketAccountInfo.email,
      account_number: marketAccountInfo.account_number,
    }
  };
  await CommonService.setLocalData(CommonService.app_local_data_key, userInfo);
  return userInfo;
};

const doLogout = async () => {
  await AccountService.logout();
  await CommonService.setLocalData(CommonService.app_local_data_key, {});
};

const doPairMarketAccount = async (token) => {
  //TODO 
  let userInfo = await CommonService.getLocalData(CommonService.app_local_data_key);
  let marketAccountInfo = await AccountService.pairtMarketAccounut(userInfo.bitmarkAccountNumber, token, totemicMarketPairUrl + '/s/api/mobile/qrcode');
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

const generatePairedMarketURL = async () => {
  return totemicMarketPairUrl;
  // let userInfo = await CommonService.getLocalData(CommonService.app_local_data_key);
  // // TODO
  // let result = await AccountService.generatePairedMarketURL(userInfo.bitmarkAccountNumber, totemicMarketPairUrl + '/s/api/access');
  // console.log('result : ', result);
  // return result.url;
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
  generatePairedMarketURL,
}

export {
  AppService
}