import { config } from './../configs';

const doGetTransferOfferDetail = (accountNumber, bitmarkId) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = config.trade_server_url + `/transfer-offers/${bitmarkId}`;
    fetch(tempURL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: 'user/' + accountNumber,
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      console.log('doGetTransferOfferDetail data: ', data);
      if (statusCode >= 400) {
        return reject(new Error('doGetTransferOfferDetail error :' + JSON.stringify(data)));
      }
      resolve(data.offer);
    }).catch(reject);
  });
};

const doGetIncomingTransferOffers = (accountNumber) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = config.trade_server_url + `/transfer-offers?receiver=${accountNumber}`;
    fetch(tempURL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: 'user/' + accountNumber,
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      console.log('doGetIncomingTransferOffers data:', data);
      if (statusCode >= 400) {
        return reject(new Error('doGetIncomingTransferOffers error :' + JSON.stringify(data)));
      }
      resolve(data.offers);
    }).catch(reject);
  });
};

const doGetOutgoingTransferOffers = (accountNumber) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = config.trade_server_url + `/transfer-offers?sender=${accountNumber}`;
    fetch(tempURL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: 'user/' + accountNumber,
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      console.log('doGetOutgoingTransferOffers data:', data);
      if (statusCode >= 400) {
        return reject(new Error('doGetOutgoingTransferOffers error :' + JSON.stringify(data)));
      }
      resolve(data.offers);
    }).catch(reject);
  });
};

const doSubmitTransferOffer = (accountNumber, bitmarkId, link, signature, receiver) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = config.trade_server_url + `/transfer-offers/${bitmarkId}`;
    fetch(tempURL, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: 'user/' + accountNumber,
      },
      body: JSON.stringify({
        owner: receiver,
        signature,
        link
      }),
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      console.log('data: ', data);
      if (statusCode >= 400) {
        return reject(new Error('doSubmitTransferOffer error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doAccepTransferOffer = (accountNumber, bitmarkId, countersignature) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = config.trade_server_url + `/transfer-offers/${bitmarkId}`;
    fetch(tempURL, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: 'user/' + accountNumber,
      },
      body: JSON.stringify({
        countersignature,
        status: "accepted",
      }),
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      console.log('data: ', data)
      if (statusCode >= 400) {
        return reject(new Error('doAccepTransferOffer error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doRejectTransferOffer = (accountNumber, bitmarkId, signatureData) => {
  console.log('signatureData :', signatureData);
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = config.trade_server_url + `/transfer-offers/${bitmarkId}`;
    fetch(tempURL, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: 'user/' + accountNumber,
      }, body: JSON.stringify({
        "status": "rejected"
      })
    }).then((response) => {
      statusCode = response.status;
      return response.text();
    }).then((data) => {
      console.log('data: ', tempURL, data)
      if (statusCode >= 400) {
        return reject(new Error('doRejectTransferOffer error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doCancelTransferOffer = (accountNumber, bitmarkId) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = config.trade_server_url + `/transfer-offers/${bitmarkId}`;
    fetch(tempURL, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: 'user/' + accountNumber,
      }, body: JSON.stringify({
        "status": "rejected"
      })
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      console.log('data: ', data)
      if (statusCode >= 400) {
        return reject(new Error('doCancelTransferOffer error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const get100Transactions = (accountNumber, offsetNumber) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = config.api_server_url + `/v1/txs?owner=${accountNumber}&pending=true&to=earlier&sent=true&block=true`;
    tempURL += offsetNumber ? `&at=${offsetNumber}` : '';
    fetch(tempURL, {
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
        return reject(new Error('get100Transactions error :' + JSON.stringify(data)));
      }
      console.log('get100Transactions success:', tempURL);
      resolve(data);
    }).catch(reject);
  });
};

const getAllTransactions = async (accountNumber) => {
  let totalTxs;
  let lastOffset;
  let canContinue = true;
  while (canContinue) {
    let data = await get100Transactions(accountNumber, lastOffset);
    data.txs.forEach(tx => {
      tx.block = data.blocks.findIndex(block => block.number === tx.block_number);
    })
    if (!totalTxs) {
      totalTxs = data.txs;
    } else {
      totalTxs = totalTxs.concat(data.txs);
    }
    if (data.txs.length < 100) {
      canContinue = false;
      break;
    }
    data.txs.forEach(tx => {
      if (!lastOffset || lastOffset > tx.offset) {
        lastOffset = tx.offset;
      }
    });
  }
  return totalTxs;
};

const getTransactionDetail = (txid) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = config.api_server_url + `/v1/txs/${txid}?pending=true&asset=true&block=true`;
    fetch(tempURL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      console.log('getTransactionDetail data: ', data);
      if (statusCode >= 400) {
        return reject(new Error('get100Transactions error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

let TransactionModel = {
  doGetTransferOfferDetail,
  doGetIncomingTransferOffers,
  doGetOutgoingTransferOffers,
  doSubmitTransferOffer,
  doAccepTransferOffer,
  doRejectTransferOffer,
  doCancelTransferOffer,
  getAllTransactions,
  getTransactionDetail,
};

export { TransactionModel };