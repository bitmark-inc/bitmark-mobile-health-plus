import { BitmarkModel, BitmarkSDK } from '../models';
import { FileUtil } from 'src/utils';

// ================================================================================================
// ================================================================================================

const doCheckFileToIssue = async (filePath, bitmarkAccountNumber) => {
  let assetInfo = await BitmarkModel.doPrepareAssetInfo(filePath);
  let assetInformation = await BitmarkModel.doGetAssetInformation(assetInfo.id);
  if (!assetInformation) {
    return { asset: assetInfo };
  } else {
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

const doIssueFile = async (bitmarkAccountNumber, filePath, assetName, metadataList, quantity) => {
  let metadata = {};
  if (Array.isArray(metadataList)) {
    metadataList.forEach(item => {
      if (item.label && item.value) {
        metadata[item.label] = item.value;
      }
    });
  } else {
    metadata = metadataList;
  }

  let issueResult = await BitmarkModel.doIssueFile(filePath, assetName, metadata, quantity);

  let assetFolderPath = `${FileUtil.getLocalAssetsFolderPath(bitmarkAccountNumber)}/${issueResult.assetId}`;
  let downloadedFolder = `${assetFolderPath}/downloaded`;
  await FileUtil.mkdir(assetFolderPath);
  await FileUtil.mkdir(downloadedFolder);

  //TODO need change to write file level4
  let filename = filePath.substring(filePath.lastIndexOf('/') + 1, filePath.length);
  await BitmarkSDK.storeFileSecurely(filePath, `${downloadedFolder}/${filename}`);
  // await FileUtil.copyFile(filePath, `${downloadedFolder}/${filename}`);

  let listFile = await FileUtil.readDir(downloadedFolder);
  let results = [];
  issueResult.bitmarkIds.forEach(id => {
    results.push({
      id,
      sessionData: issueResult.sessionData,
      assetId: issueResult.assetId,
      filePath: `${downloadedFolder}/${listFile[0]}`
    });
  });
  return results;
};

const doGetBitmarkInformation = async (bitmarkId) => {
  return await BitmarkModel.doGetBitmarkInformation(bitmarkId);
};

const doTransferBitmark = async (bitmarkId, receiver) => {
  return await BitmarkSDK.transfer(bitmarkId, receiver);
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