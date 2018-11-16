import randomString from "random-string";
import moment from 'moment';
import { BitmarkModel, BitmarkSDK } from "../models";
import { FileUtil, getLocalAssetsFolderPath } from "../utils";
import iCloudSyncAdapter from "../models/adapters/icloud";

// ================================================================================================
// ================================================================================================

const doCheckFileToIssue = async (filePath, bitmarkAccountNumber) => {
  let assetInfo = await BitmarkModel.doPrepareAssetInfo(filePath);
  let assetInformation = await BitmarkModel.doGetAssetInformation(assetInfo.id);
  if (!assetInformation) {
    return { asset: assetInfo };
  } else {
    let accessibilityData = await BitmarkModel.doGetAssetAccessibility(assetInfo.id);
    assetInformation.accessibility = accessibilityData ? accessibilityData.accessibility : null;
    let bitmark;
    let bitmarks = await BitmarkModel.doGetBitmarksOfAsset(assetInfo.id, assetInformation.registrant === bitmarkAccountNumber ? bitmarkAccountNumber : null);
    if (bitmarks && bitmarks.length > 0) {
      bitmark = bitmarks[0];
    }
    return { asset: assetInformation, bitmark };
  }
};

const doCheckMetadata = (metadataList) => {
  let metadata = {};
  let existFields = {};
  return new Promise((resolve) => {
    for (let index = 0; index < metadataList.length; index++) {
      let item = metadataList[index];
      item.labelError = !!((index < (metadataList.length - 1) && !item.label) ||
        (index === (metadataList.length - 1) && !item.label && item.value));
      item.valueError = !!((index < (metadataList.length - 1) && !item.value) ||
        (index === (metadataList.length - 1) && !item.value && item.label));
      if (item.label && existFields[item.label.toLowerCase()] >= 0) {
        item.labelError = true;
        metadataList[existFields[item.label.toLowerCase()]].labelError = true;
        return resolve(i18n.t('BitmarkService_doCheckMetadata1') + item.label);
      }
      if (item.label && item.value) {
        existFields[item.label.toLowerCase()] = index;
        metadata[item.label] = item.value;
      }
    }

    BitmarkModel.doCheckMetadata(metadata).then(resolve).catch(() => resolve('BitmarkService_doCheckMetadata2'));
  });
};

const doIssueFile = async (touchFaceIdSession, bitmarkAccountNumber, filePath, assetName, metadataList, quantity, isPublicAsset) => {
  let metadata = {};
  metadataList.forEach(item => {
    if (item.label && item.value) {
      metadata[item.label] = item.value;
    }
  });

  let tempFolder = `${getLocalAssetsFolderPath(bitmarkAccountNumber)}/temp_${randomString({ length: 8, numeric: true, letters: false, }) + moment().toDate().getTime()}`;
  let tempFolderDownloaded = `${tempFolder}/downloaded`;
  await FileUtil.mkdir(tempFolder);
  await FileUtil.mkdir(tempFolderDownloaded);

  let issueResult = await BitmarkModel.doIssueFile(touchFaceIdSession, tempFolderDownloaded, filePath, assetName, metadata, quantity, isPublicAsset);

  let assetFolderPath = `${getLocalAssetsFolderPath(bitmarkAccountNumber)}/${issueResult.assetId}`;
  let downloadedFolder = `${assetFolderPath}/downloaded`;
  await FileUtil.mkdir(assetFolderPath);
  await FileUtil.mkdir(downloadedFolder);
  let list = await FileUtil.readDir(tempFolderDownloaded);
  for (let filename of list) {
    await FileUtil.moveFile(`${tempFolderDownloaded}/${filename}`, `${downloadedFolder}/${filename}`);
    let iCloudFilename = 'asset-file' + filename.substring(filename.lastIndexOf('.'), filename.length);
    iCloudSyncAdapter.uploadFileToCloud(`${downloadedFolder}/${filename}`, `${bitmarkAccountNumber}_${issueResult.assetId}_downloaded_${iCloudFilename}`);
  }
  await FileUtil.removeSafe(tempFolder);

  let sessionAssetFolder = `${FileUtil.DocumentDirectory}/assets-session-data/${bitmarkAccountNumber}/${issueResult.assetId}`;
  await FileUtil.mkdir(sessionAssetFolder);
  await FileUtil.create(`${sessionAssetFolder}/session_data.txt`, JSON.stringify(issueResult.sessionData));

  let results = [];
  issueResult.bitmarkIds.forEach(id => {
    results.push({ id, sessionData: issueResult.sessionData });
  });
  return results;
};

const doGetBitmarkInformation = async (bitmarkId) => {
  return await BitmarkModel.doGetBitmarkInformation(bitmarkId);
};

const doTransferBitmark = async (touchFaceIdSession, bitmarkId, receiver) => {
  return await BitmarkSDK.transferOneSignature(touchFaceIdSession, bitmarkId, receiver);
};

// ================================================================================================
// ================================================================================================
let BitmarkService = {
  doCheckFileToIssue,
  doCheckMetadata,
  doIssueFile,
  doGetBitmarkInformation,
  doTransferBitmark,
};

export { BitmarkService };