import { config } from './../configs';

const doGetSignRequest = (accountNumber, bitmarkId) => {
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
      console.log('data: ', data);
      if (statusCode >= 400) {
        return reject(new Error('doGetSignRequest error :' + JSON.stringify(data)));
      }
      resolve(data.offer);
    }).catch(reject);
  });
};

const doGetAllGetSignRequests = (accountNumber) => {
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
      console.log('doGetAllGetSignRequests data:', data);
      if (statusCode >= 400) {
        return reject(new Error('doGetAllGetSignRequests error :' + JSON.stringify(data)));
      }
      resolve(data.offers);
    }).catch(reject);
  });
};

const doSubmitSignRequest = (owner, bitmarkId, link, signature) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempURL = config.trade_server_url + `/transfer-offers/${bitmarkId}`;
    fetch(tempURL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: 'user/' + owner,
      },
      body: JSON.stringify({
        owner, signature, link
      }),
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      console.log('data: ', data);
      if (statusCode >= 400) {
        return reject(new Error('doSubmitSignRequest error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doSubmitCounterSignRequest = (accountNumber, bitmarkId, countersignature) => {
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
      }),
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      console.log('data: ', data)
      if (statusCode >= 400) {
        return reject(new Error('doSubmitCounterSignRequest error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doRejectlSignRequest = (accountNumber, bitmarkId, signatureData) => {
  console.log('signatureData :', signatureData);
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
      console.log('data: ', data)
      if (statusCode >= 400) {
        return reject(new Error('doRejectlSignRequest error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doCancelSignRequest = (accountNumber, bitmarkId) => {
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
      console.log('data: ', data)
      if (statusCode >= 400) {
        return reject(new Error('doCancelSignRequest error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

let TransactionModel = {
  doGetSignRequest,
  doGetAllGetSignRequests,
  doSubmitSignRequest,
  doSubmitCounterSignRequest,
  doRejectlSignRequest,
  doCancelSignRequest,
};

export { TransactionModel };