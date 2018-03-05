

const doGetSignRequest = () => {
  return new Promise((resolve, reject) => {
    let statusCode;
    //TODO
    let tempURL = '';
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
        return reject(new Error('doGetProvenance error :' + JSON.stringify(data)));
      }
      //TODO
      resolve(data);
    }).catch(reject);
  });
};

const doGetSignRequests = () => {
  return new Promise((resolve, reject) => {
    let statusCode;
    //TODO
    let tempURL = '';
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
        return reject(new Error('doGetProvenance error :' + JSON.stringify(data)));
      }
      //TODO
      resolve(data);
    }).catch(reject);
  });
};

const doSubmitSignRequest = () => {

};
const doSubmitCounterSignRequest = () => {

};

let TransactionModel = {
  doGetSignRequest,
  doGetSignRequests,
  doSubmitSignRequest,
  doSubmitCounterSignRequest,
};

export { TransactionModel };