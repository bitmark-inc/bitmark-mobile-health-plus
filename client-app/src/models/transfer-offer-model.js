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
      if (statusCode >= 400) {
        return reject(new Error('doAccepTransferOffer error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doRejectTransferOffer = (accountNumber, bitmarkId, signatureData) => {
  //TODO need signature
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
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: 'user/' + accountNumber,
      }
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doCancelTransferOffer error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

let TransferOfferModel = {
  doGetTransferOfferDetail,
  doGetIncomingTransferOffers,
  doGetOutgoingTransferOffers,
  doSubmitTransferOffer,
  doAccepTransferOffer,
  doRejectTransferOffer,
  doCancelTransferOffer,
};

export { TransferOfferModel };