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

const downloadBitmarkFile = async (accountNumber, timestampe, signature, filePathInServer, filePath) => {
  let tempUrl = config.ifttt_server_url + `/api/user/bitmark-file?file_path=${filePathInServer}`;
  return await FileUtil.downloadFile(tempUrl, filePath, {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    requester: accountNumber,
    timestampe,
    signature,
  });
};

const doRemoveBitmarkFile = (accountNumber, timestampe, signature, filePathInServer) => {
  return new Promise((resolve, reject) => {
    let statusCode;
    let tempUrl = config.ifttt_server_url + `/api/user/bitmark-file?file_path=${filePathInServer}`;
    fetch(tempUrl, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        requester: accountNumber,
        timestampe,
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
  downloadBitmarkFile,
  doRemoveBitmarkFile,
};

export { IftttModel };