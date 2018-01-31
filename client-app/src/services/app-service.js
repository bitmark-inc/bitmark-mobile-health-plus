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

const getAccountFrom24Words = async (pharse24Words) => {
  return await bitmarkSDK.newAccountFrom24Words(pharse24Words);
};

const checkFaceTouchId = async () => {
  return await FaceTouchId.isSupported();
}

// ================================================================================================
// ================================================================================================
// ================================================================================================

let AppService = {
  createNewAccount,
  getCurrentAccount,
  getAccountFrom24Words,
  checkFaceTouchId,
}

export {
  AppService
}