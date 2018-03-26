import moment from 'moment';
import { config } from './../configs';

const doRegisterUserInformation = (bitmark_account, timestamp, signature) => {
  let timezone = moment().toDate().getTimezoneOffset();
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.donation_server_url + `/s/api/register`;
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
        return reject(new Error('doRegisterUserInformation error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doDeregisterUserInformation = (bitmark_account, timestamp, signature) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.donation_server_url + `/s/api/deregister`;
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
      }),
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doDeregisterUserInformation error :' + JSON.stringify(data)));
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

const doJoinStudy = (bitmark_account, study_id, timestamp, signature, ) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.donation_server_url + `/s/api/join-study`;
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
        study_id
      }),
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doJoinStudy error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doLeaveStudy = (bitmark_account, study_id, timestamp, signature, ) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let bitmarkUrl = config.donation_server_url + `/s/api/leave-study`;
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
        study_id
      }),
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doLeaveStudy error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doCompleteTask = (bitmark_account, timestamp, signature, task_type, completed_at, study_id, bitmark_id, txid, first_signature) => {
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
        study_id,
        bitmark_id,
        txid,
        first_signature,
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

let DonationModel = {
  doRegisterUserInformation,
  doDeregisterUserInformation,
  doGetUserInformation,
  doCompleteTask,
  doJoinStudy,
  doLeaveStudy,

};

export { DonationModel };