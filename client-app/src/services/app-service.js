import { bitmarkSDK, FaceTouchId } from './adapters'
import { config } from './../configs';

// ================================================================================================
// ================================================================================================
// ================================================================================================

const createNewAccount = async () => {
  return await bitmarkSDK.newAccount(config.network);
};

const getCurrentAccount = async () => {
  return await bitmarkSDK.accountInfo(config.network);
};

const check24Words = async (pharse24Words) => {
  return await bitmarkSDK.try24Words(pharse24Words);
};

const getAccountFrom24Words = async (pharse24Words) => {
  return await bitmarkSDK.newAccountFrom24Words(pharse24Words);
};

const logOut = async () => {
  return await bitmarkSDK.removeAccount();
}


const checkFaceTouchId = async () => {
  return await FaceTouchId.isSupported();
}


// ================================================================================================
// ================================================================================================
// ================================================================================================

let AppService = {
  createNewAccount,
  getCurrentAccount,
  check24Words,
  getAccountFrom24Words,
  checkFaceTouchId,
  logOut,
}

export {
  AppService
}