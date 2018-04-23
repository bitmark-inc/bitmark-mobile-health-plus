import { config } from "../configs";
import { FileUtil } from "../utils";

const doGetIFtttInformation = (accountNumber) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempUrl = config.ifttt_server_url + `/api/user`;
    fetch(tempUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: accountNumber,
      },
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doGetIFtttInformation error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const doRevokeIftttToken = (accountNumber, timestamp, signature) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempUrl = config.ifttt_server_url + `/api/user`;
    fetch(tempUrl, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: accountNumber,
        timestamp,
        signature,
      },
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doRemoveBitmarkFile error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const downloadBitmarkFile = async (accountNumber, timestamp, signature, id, filePath) => {
  let tempUrl = config.ifttt_server_url + `/api/user/bitmark-file/${id}`;
  return await FileUtil.downloadFile(tempUrl, filePath, {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    requester: accountNumber,
    timestamp,
    signature,
  });
};

const doRemoveBitmarkFile = (accountNumber, timestamp, signature, id) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempUrl = config.ifttt_server_url + `/api/user/bitmark-file/${id}`;
    fetch(tempUrl, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: accountNumber,
        timestamp,
        signature,
      },
    }).then((response) => {
      statusCode = response.status;
      return response.json();
    }).then((data) => {
      if (statusCode >= 400) {
        return reject(new Error('doRemoveBitmarkFile error :' + JSON.stringify(data)));
      }
      resolve(data);
    }).catch(reject);
  });
};

const IftttModel = {
  doGetIFtttInformation,
  doRevokeIftttToken,
  downloadBitmarkFile,
  doRemoveBitmarkFile,
};

export { IftttModel };