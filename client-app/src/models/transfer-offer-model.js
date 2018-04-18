import { config } from './../configs';

const doGetTransferOfferDetail = (accountNumber, bitmarkId) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = config.api_server_url + `/v2/transfer_offers/${bitmarkId}`;
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
        return reject(new Error('doGetTransferOfferDetail error :' + JSON.stringify(data)));
      }
      resolve(data.offer);
    }).catch(reject);
  });
};

const doGetIncomingTransferOffers = (accountNumber) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = config.api_server_url + `/v2/transfer_offers?requester=${accountNumber}`;
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
        return reject(new Error('doGetIncomingTransferOffers error :' + JSON.stringify(data)));
      }
      resolve(data.offers.to);
    }).catch(reject);
  });
};

const doGetOutgoingTransferOffers = (accountNumber) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = config.api_server_url + `/v2/transfer_offers?requester=${accountNumber}`;
    console.log("tempURL :", tempURL);
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
        return reject(new Error('doGetOutgoingTransferOffers error :' + JSON.stringify(data)));
      }
      resolve(data.offers.from);
    }).catch(reject);
  });
};

const doAccepTransferOffer = (accountNumber, bitmarkId, timestamp, signature, countersignature) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = config.api_server_url + `/v2/transfer_offers/${bitmarkId}`;
    fetch(tempURL, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: accountNumber,
      },
      body: JSON.stringify({
        countersignature,
        action: "accept",
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
    let tempURL = config.api_server_url + `/v2/transfer_offers/${bitmarkId}`;
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
    let tempURL = config.api_server_url + `/v2/transfer_offers/${bitmarkId}`;
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
  doAccepTransferOffer,
  doRejectTransferOffer,
  doCancelTransferOffer,
};

export { TransferOfferModel };