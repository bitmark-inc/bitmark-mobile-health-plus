import moment from 'moment';
import { config } from './../configs';

const doActiveBitmarkHealthData = (bitmark_account, timestamp, signature, active_bhd_at) => {
  let timezone = moment().toDate().getTimezoneOffset();
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.donation_server_url + `/s/api/active-bhd`;
    fetch(bitmarkUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bitmark_account,
        timestamp,
        signature,
        timezone,
        active_bhd_at,
      }),
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doActiveBitmarkHealthData error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doInactiveBitmarkHealthData = (bitmark_account, timestamp, signature) => {
  let timezone = moment().toDate().getTimezoneOffset();
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.donation_server_url + `/s/api/inactive-bhd`;
    fetch(bitmarkUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bitmark_account,
        timestamp,
        signature,
        timezone,
      }),
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doInactiveBitmarkHealthData error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doGetUserInformation = (bitmark_account) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.donation_server_url + `/s/api/user/${bitmark_account}`;
    fetch(bitmarkUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doGetUserInformation error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};


const doCompleteTask = (bitmark_account, timestamp, signature, task_type, completed_at, bitmark_id) => {
  let timezone = moment().toDate().getTimezoneOffset();
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.donation_server_url + `/s/api/complete-task`;
    fetch(bitmarkUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bitmark_account,
        timestamp,
        signature,
        task_type,
        completed_at,
        bitmark_id,
        timezone,
      }),
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doCompleteTask error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doGetAllDataTypes = () => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.donation_server_url + `/s/api/all-data-types`;
    fetch(bitmarkUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doGetAllDataTypes error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doDeleteAccount = (bitmark_account, timestamp, signature) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.donation_server_url + `/s/api/user/` + bitmark_account;
    fetch(bitmarkUrl, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        timestamp,
        signature,
      },
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doGetAllDataTypes error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
}

let DonationModel = {
  doActiveBitmarkHealthData,
  doInactiveBitmarkHealthData,
  doGetUserInformation,
  doCompleteTask,
  doGetAllDataTypes,
  doDeleteAccount,
};

export { DonationModel };