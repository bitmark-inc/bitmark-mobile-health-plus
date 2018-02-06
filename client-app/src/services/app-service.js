
import { config } from './../configs';
import { CommonService } from './common-service';
import { AccountService } from './account-service';
import moment from 'moment';

// ================================================================================================
// ================================================================================================
// ================================================================================================
// TODO
let totemicMarketUrl = config.totemic_server_url;

const getCurrentUser = async () => {
  return await CommonService.getLocalData(CommonService.app_local_data_key);
};

const createNewUser = async () => {
  let userInfo = await AccountService.createNewAccount();
  await CommonService.setLocalData(CommonService.app_local_data_key, userInfo);
  return userInfo;
};

const doLogin = async (phase24Words) => {
  let userInfo = await AccountService.accessBy24Words(phase24Words);
  //TODO
  let marketAccountInfo = await AccountService.checkPairingStatus(userInfo.bitmarkAccountNumber, totemicMarketUrl + '/s/api/mobile/pairing-account');
  userInfo.markets = {
    'totemic': {
      id: marketAccountInfo.id,
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
  let marketAccountInfo = await AccountService.pairtMarketAccounut(userInfo.bitmarkAccountNumber, token, totemicMarketUrl + '/s/api/mobile/qrcode');
  userInfo.markets = {
    'totemic': {
      id: marketAccountInfo.id,
      name: marketAccountInfo.name,
      email: marketAccountInfo.email,
      account_number: marketAccountInfo.account_number,
    }
  }
  await CommonService.setLocalData(CommonService.app_local_data_key, userInfo);
  return userInfo;
};

const getMarketUrl = async () => {
  return totemicMarketUrl;
};


const getUserBitamrk = async () => {
  let userInfo = await CommonService.getLocalData(CommonService.app_local_data_key);
  let localBitmarks = await AccountService.getLocalBitamrks(userInfo.bitmarkAccountNumber);
  let marketBitmarks;
  let marketUserId = (userInfo.markets && userInfo.markets.totemic) ? userInfo.markets.totemic.id : null;
  if (marketUserId) {
    let url = totemicMarketUrl + `/s/api/editions?owner=${userInfo.markets.totemic.id}&include_card=true&include_user=true`;
    marketBitmarks = await AccountService.getMarketBitmarks(url);
  }

  let result = {
    localAssets: [],
    marketAssets: []
  };
  if (localBitmarks && localBitmarks.bitmarks && localBitmarks.assets) {
    localBitmarks.assets.forEach((asset) => {
      localBitmarks.bitmarks.forEach((bitmark) => {
        if (bitmark.asset_id === asset.id) {
          asset.key = asset.id;
          if (!asset.bitamrks) {
            asset.bitmarks = [];
            asset.totalPending = 0;
          }
          asset.created_at = moment(asset.created_at).format('YYYY MMM DD HH:mm:ss')
          asset.totalPending += bitmark.status === 'pending' ? 1 : 0;
          asset.bitamrks.push(bitmark);
        }
      });
      result.localAssets.push(asset);
    });
  }
  if (marketBitmarks && marketBitmarks.editions && marketBitmarks.cards) {
    marketBitmarks.cards.forEach((asset) => {
      marketBitmarks.editions.forEach((bitmark) => {
        if (bitmark.card_id === asset.id) {
          if (!asset.bitamrks) {
            asset.bitmarks = [];
          }
          asset.key = asset.id = asset.asset_id;
          asset.totalPending += bitmark.status === 'pending' ? 1 : 0;
          asset.created_at = moment(asset.created_at).format('YYYY MMM DD HH:mm:ss');
          let issuer = (marketBitmarks.users || []).find((user) => user.id === asset.creator_id);
          asset.issuer = issuer ? issuer.bitmark_account : null;
          asset.bitamrks.push(bitmark);
        }
      });
      result.marketAssets.push(asset);
    });
  }
  return result;
};

const getUserBalance = async () => {
  let balanceResult = await AccountService.getBalanceOnMarket(totemicMarketUrl);
  let balanceHistories = await AccountService.getBalanceHistoryOnMarket(totemicMarketUrl);
  return { balance: balanceResult.balance, pending: balanceResult.pending, balanceHistories };
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
  getMarketUrl,
  getUserBitamrk,
  getUserBalance,
}

export {
  AppService
}