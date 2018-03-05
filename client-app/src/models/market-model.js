import moment from 'moment';

import { config } from './../configs';
import { BitmarkSDK } from './adapters';
import { sortList } from './../utils';

// ===================================================================================================================
// ===================================================================================================================
const convertDataFromMarket = (market, marketBitmarks) => {
  let marketAssets = [];
  if (market === config.markets.totemic.name) {
    // convert data for totemic data
    if (marketBitmarks && marketBitmarks.editions && marketBitmarks.cards) {
      marketBitmarks.cards.forEach((asset) => {
        asset.market = market;
        marketBitmarks.editions.forEach((bitmark) => {
          if (!asset.bitmarks) {
            asset.bitmarks = [];
            asset.totalPending = 0;
          }
          bitmark.market = market;
          if (bitmark.card_id === asset.id) {
            asset.metadata = (asset.metadata && (typeof asset.metadata === 'string')) ? JSON.parse(asset.metadata) : asset.metadata;
            asset.totalPending += (bitmark.status === 'pending') ? 1 : 0;
            asset.created_at = moment(asset.created_at).format('YYYY MMM DD HH:mm:ss');
            let issuer = (marketBitmarks.users || []).find((user) => user.id === asset.creator_id);
            asset.registrant = issuer ? issuer.account_number : null;
            asset.bitmarks.push(bitmark);
            asset.bitmarks = sortList(asset.bitmarks, ((a, b) => {
              if (!a || !a.created_at || a.status === 'pending') { return -1; }
              if (!b || !b.created_at || b.status === 'pending') { return -1; }
              return moment(a.created_at).toDate().getTime() < moment(b.created_at).toDate().getTime();
            }));
          }
        });
        marketAssets.push(asset);
      });
    }
  }
  return marketAssets;
};

const doWithdrawFirstSignature = (localBitmarkAccount, bitmarkIds) => {
  return new Promise((resolve, reject) => {
    let withdrawURL = config.trade_server_url + `/bitmarks/withdraw_request`;
    let header = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      requester: 'user/' + localBitmarkAccount,
    };
    let data = {
      bitmarks: bitmarkIds
    };
    let statusCode;
    fetch(withdrawURL, {
      method: 'POST',
      headers: header,
      body: JSON.stringify(data)
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doWithdrawFirstSignature error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doWithdrawSecondSignature = (localBitmarkAccount, timestamp, signature, signedTransfers) => {
  return new Promise((resolve, reject) => {
    let withdrawURL = config.trade_server_url + `/bitmarks/withdraw`;
    let header = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      requester: 'user/' + localBitmarkAccount,
      timestamp,
      signature,
    };
    let data = { items: signedTransfers };
    let statusCode = null;
    fetch(withdrawURL, {
      method: 'POST',
      headers: header,
      body: JSON.stringify(data)
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doWithdrawSecondSignature error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doDeposit = (localBitmarkAccount, timestamp, signature, firstSignatures) => {
  return new Promise((resolve, reject) => {
    let withdrawURL = config.trade_server_url + `/bitmarks/deposit`;
    let header = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      requester: 'user/' + localBitmarkAccount,
      signature,
      timestamp,
    };
    let data = { items: firstSignatures };
    let statusCode = null;
    fetch(withdrawURL, {
      method: 'POST',
      headers: header,
      body: JSON.stringify(data)
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doDeposit error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

// ===================================================================================================================
// ===================================================================================================================
const doAccessToMarket = (market, localBitmarkAccountNumber, timestamp, signature) => {
  return new Promise((resolve, reject) => {
    if (!market || !config.market_urls[market]) {
      return reject(new Error('Invalid market!'));
    }
    let marketServerUrl = config.market_urls[market];
    let urlCheck;
    switch (market) {
      case config.markets.totemic.name:
        urlCheck = marketServerUrl + `/s/api/mobile/access`;
        break;
      default:
        break;
    }
    if (!urlCheck) {
      return reject(new Error('Invalid market!'));
    }
    let statusCode = null;
    fetch(urlCheck, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pair_account_number: localBitmarkAccountNumber,
        timestamp,
        signature,
      })
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doAccessToMarket error :' + JSON.stringify(data)));
      }
      resolve(data.user || {});
    }).catch((error) => {
      reject(error);
    });
  });
};
const doGetBitmarks = (market, marketUserInfo) => {
  return new Promise((resolve, reject) => {
    if (!market || !config.market_urls[market]) {
      return reject(new Error('Invalid market!'));
    }
    let marketServerUrl = config.market_urls[market];
    let marketBitmarkUrl;
    switch (market) {
      case config.markets.totemic.name:
        marketBitmarkUrl = marketServerUrl +
          `/s/api/editions?owner=${marketUserInfo.id}&include_card=true&include_user=true&include_order=true`;
        break;
      default:
        break;
    }
    if (!marketBitmarkUrl) {
      return reject(new Error('Invalid market!'));
    }
    let statusCode;
    fetch(marketBitmarkUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`doGetBitmarks on ${market} error :` + JSON.stringify(data)));
      }
      resolve(convertDataFromMarket(market, data || {}));
    }).catch(reject);
  });
};

const doGetProvenance = (bitmark) => {
  return new Promise((resolve, reject) => {
    if (!bitmark.market || !config.market_urls[bitmark.market]) {
      return reject(new Error('Invalid market!'));
    }
    let marketServerUrl = config.market_urls[bitmark.market];
    let marketBitmarkUrl;
    switch (bitmark.market) {
      case config.markets.totemic.name:
        marketBitmarkUrl = marketServerUrl +
          `/s/api/editions/${bitmark.id}?include_provenance=true`;
        break;
      default:
        break;
    }
    if (!marketBitmarkUrl) {
      return reject(new Error('Invalid market!'));
    }
    let statusCode;
    fetch(marketBitmarkUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error(`doGetProvenance of ${bitmark.id} on ${bitmark.market} error :` + JSON.stringify(data)));
      }
      let provenance = data.provenance || [];
      provenance.forEach(item => item.created_at = moment(item.created_at).format('YYYY MMM DD HH:mm:ss'));
      resolve(provenance);
    }).catch(reject);
  });
};

const doCheckMarketSession = (market) => {
  return new Promise((resolve, reject) => {
    if (!market || !config.market_urls[market]) {
      return reject(new Error('Invalid market!'));
    }
    let marketServerUrl = config.market_urls[market];
    let marketBitmarkUrl;
    switch (market) {
      case config.markets.totemic.name:
        marketBitmarkUrl = marketServerUrl + `/s/api/account`;
        break;
      default:
        break;
    }
    if (!marketBitmarkUrl) {
      return reject(new Error('Invalid market!'));
    }
    let statusCode;
    fetch(marketBitmarkUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode === 401) {
        return resolve(null);
      }
      if (statusCode >= 400) {
        return reject(new Error(`doCheckMarketSession ${market} error :` + JSON.stringify(data)));
      }
      resolve(data.user);
    }).catch(reject);
  });
};

const doWithdrawBitmarks = async (touchFaceIdSession, bitmarkIds, localBitmarkAccount) => {
  let firstSignatureData = await doWithdrawFirstSignature(localBitmarkAccount, bitmarkIds);
  let signedTransfers = [];
  for (let item of firstSignatureData.items) {
    signedTransfers.push({
      bitmark_id: item.bitmark_id,
      signed_transfer: {
        link: item.half_signed_transfer.link,
        owner: item.half_signed_transfer.owner,
        signature: item.half_signed_transfer.signature,
        countersignature: await BitmarkSDK.sign2ndForTransfer(touchFaceIdSession, item.half_signed_transfer.link, item.half_signed_transfer.signature)
      }
    });
  }
  let timestamp = moment().toDate().getTime() + '';
  let timestampSignatures = await BitmarkSDK.rickySignMessage([timestamp], touchFaceIdSession);
  return await doWithdrawSecondSignature(localBitmarkAccount, timestamp, timestampSignatures, signedTransfers);
};

const doDepositBitmarks = async (touchFaceIdSession, bitmarkIds, localBitmarkAccount, marketBitmarkAccount) => {
  let timestamp = moment().toDate().getTime() + '';
  let signatures = await BitmarkSDK.rickySignMessage([timestamp], touchFaceIdSession);
  let firstSignatures = {};
  for (let bitmarkId of bitmarkIds) {
    let firstSignatureData = await BitmarkSDK.sign1stForTransfer(touchFaceIdSession, bitmarkId, marketBitmarkAccount);
    firstSignatures[bitmarkId] = {
      link: firstSignatureData.txid,
      owner: localBitmarkAccount,
      signature: firstSignatureData.signature,
    };
  }
  return await doDeposit(localBitmarkAccount, timestamp, signatures, firstSignatures);
};

const doPairAccount = async (touchFaceIdSession, localBitmarkAccountNumber, token, market) => {
  if (!market || !config.market_urls[market]) {
    throw new Error('Invalid market!');
  }
  let marketServerUrl = config.market_urls[market];
  let marketPairUrl;
  switch (market) {
    case config.markets.totemic.name:
      marketPairUrl = marketServerUrl + '/s/api/mobile/token-pair-confirmation';
      break;
    default:
      break;
  }
  if (!marketPairUrl) {
    throw new Error('Invalid market!');
  }

  let requestPair = (signature) => {
    return new Promise((resolve, reject) => {
      let statusCode = null;
      fetch(marketPairUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pair_account_number: localBitmarkAccountNumber,
          token,
          signature,
        })
      }).then((response) => {
        statusCode = response.status;
        return response.json();
      }).then((data) => {
        if (statusCode >= 400) {
          return reject(new Error('pairtMarketAccounut error :' + JSON.stringify(data)));
        }
        resolve(data.user || {});
      }).catch((error) => {
        console.log('pairtMarketAccounut error:', error);
        reject(error);
      });
    });
  }

  let signatures = await BitmarkSDK.rickySignMessage([token], touchFaceIdSession);
  let user = await requestPair(signatures[0]);
  return user;
};

const doGetCurrentBalance = (market) => {
  return new Promise((resolve, reject) => {
    if (!market || !config.market_urls[market]) {
      return reject(new Error('Invalid market!'));
    }
    let marketServerUrl = config.market_urls[market];
    let marketBalanceUrl;
    switch (market) {
      case config.markets.totemic.name:
        marketBalanceUrl = marketServerUrl + '/s/api/balance';
        break;
      default:
        break;
    }
    if (!marketBalanceUrl) {
      return reject(new Error('Invalid market!'));
    }

    let statusCode = null;
    fetch(marketBalanceUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('getBalanceOnMarket error :' + JSON.stringify(data)));
      }
      let ethData = (data && data.fund) ? data.fund.eth : {};
      let balance = ethData.balance || 0;
      let pending = ethData.pending || 0;
      resolve({ balance, pending });
    }).catch((error) => {
      reject(error);
    });
  });
};

const doGetBalanceHistory = (market) => {
  return new Promise((resolve, reject) => {
    if (!market || !config.market_urls[market]) {
      return reject(new Error('Invalid market!'));
    }
    let marketServerUrl = config.market_urls[market];
    let marketBalanceHistoryUrl;
    switch (market) {
      case config.markets.totemic.name:
        marketBalanceHistoryUrl = marketServerUrl + '/s/api/balance-history';
        break;
      default:
        break;
    }
    if (!marketBalanceHistoryUrl) {
      return reject(new Error('Invalid market!'));
    }
    let statusCode = null;
    fetch(marketBalanceHistoryUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('getBalanceHistoryOnMarket error :' + JSON.stringify(data)));
      }
      resolve(data.history || []);
    }).catch((error) => {
      reject(error);
    });
  });
};

// ===========================================================================


let MarketModel = {
  doGetBitmarks,
  doGetProvenance,
  doCheckMarketSession,
  doWithdrawBitmarks,
  doDepositBitmarks,
  doAccessToMarket,
  doPairAccount,
  doGetCurrentBalance,
  doGetBalanceHistory,
}

export {
  MarketModel
}