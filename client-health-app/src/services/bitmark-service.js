import { BitmarkModel } from "../models";

// ================================================================================================
// ================================================================================================

const doCheckFileToIssue = async (filePath, bitmarkAccountNumber) => {
  let assetInfo = await BitmarkModel.doPrepareAssetInfo(filePath);
  let assetInformation = await BitmarkModel.doGetAssetInformation(assetInfo.id);
  if (!assetInformation) {
    return { asset: assetInfo };
  } else {
    let accessibilityData = await BitmarkModel.doGetAssetAccessibility(assetInfo.id);
    assetInformation.accessibility = accessibilityData.accessibility;
    let bitmark;
    if (assetInformation.registrant === bitmarkAccountNumber) {
      let bitmarks = await BitmarkModel.doGetBitmarksOfAsset(assetInfo.id, bitmarkAccountNumber);
      if (bitmarks && bitmarks.length > 0) {
        bitmark = bitmarks[0];
      }
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
        return resolve('Duplicated labels: ' + item.label);
      }
      if (item.label && item.value) {
        existFields[item.label.toLowerCase()] = index;
        metadata[item.label] = item.value;
      }
    }

    BitmarkModel.doCheckMetadata(metadata).then(resolve).catch(() => resolve('METADATA is too long (2048-BYTE LIMIT)!'));
  });
};

const doIssueFile = async (touchFaceIdSession, filePath, assetName, metadataList, quantity, isPublicAsset) => {
  let metadata = {};
  metadataList.forEach(item => {
    if (item.label && item.value) {
      metadata[item.label] = item.value;
    }
  });
  return await BitmarkModel.doIssueFile(touchFaceIdSession, filePath, assetName, metadata, quantity, isPublicAsset);
};

const doGetBitmarkInformation = async (bitmarkId) => {
  let data = await BitmarkModel.doGetBitmarkInformation(bitmarkId);
  data.bitmark.bitmark_id = data.bitmark.id;
  return data;
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