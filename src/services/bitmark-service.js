import { BitmarkModel } from "../models";
import { FileUtil } from "../utils";

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
  let issueResult = await BitmarkModel.doIssueFile(touchFaceIdSession, filePath, assetName, metadata, quantity, isPublicAsset);
  let encryptedAssetFolder = FileUtil.DocumentDirectory + '/encrypted_' + bitmarkAccountNumber + '/' + issueResult.assetId;
  await FileUtil.mkdir(encryptedAssetFolder);
  await FileUtil.create(encryptedAssetFolder + '/session_data.txt', JSON.stringify(issueResult.sessionData));

  let desEncryptedFilePath = encryptedAssetFolder + issueResult.encryptedFilePath.substring(issueResult.encryptedFilePath.lastIndexOf('/'), issueResult.encryptedFilePath.length);
  await FileUtil.moveFileSafe(issueResult.encryptedFilePath.replace('file://', ''), desEncryptedFilePath);
  let results = [];
  issueResult.bitmarkIds.forEach(id => {
    results.push({ id, sessionData: issueResult.sessionData });
  });
  return results;
};

const doGetBitmarkInformation = async (bitmarkId) => {
  return await BitmarkModel.doGetBitmarkInformation(bitmarkId);
};

// ================================================================================================
// ================================================================================================
let BitmarkService = {
  doCheckFileToIssue,
  doCheckMetadata,
  doIssueFile,
  doGetBitmarkInformation,
};

export { BitmarkService };