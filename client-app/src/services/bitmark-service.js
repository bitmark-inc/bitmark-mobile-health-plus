import { BitmarkModel } from "../models";

// ================================================================================================
// ================================================================================================
let doGetBitmarks = (bitmarkAccountNumber) => {
  return new Promise((resolve) => {
    BitmarkModel.doGetBitmarks(bitmarkAccountNumber).then(resolve).catch(error => {
      resolve([]);
      console.log('BitmarkService doGetBitmarks error :', error);
    })
  })
};

const doCheckFileToIssue = async (filePath) => {
  let assetInfo = BitmarkModel.doPrepareAssetInfo(filePath);
  let assetInformation = await BitmarkModel.doGetAssetInformation(assetInfo.id);
  if (!assetInformation) {
    return assetInfo;
  } else {
    return assetInformation;
  }
};

const doCheckMetadata = async (metadatList) => {
  let metadata = {};
  metadatList.forEach(item => {
    if (item.label && item.value) {
      metadata[item.label] = item.value;
    }
  });
  return await BitmarkModel.doCheckMetadata(metadata);
};

const doIssueFile = async (touchFaceIdSession, filepath, assetName, metadatList, quantity) => {
  let metadata = {};
  metadatList.forEach(item => {
    metadata[item.label] = item.value;
  });
  return await BitmarkModel.doIssueFile(touchFaceIdSession, filepath, assetName, metadata, quantity);
};

// ================================================================================================
// ================================================================================================
let BitmarkService = {
  doGetBitmarks,
  doCheckFileToIssue,
  doCheckMetadata,
  doIssueFile,
};

export { BitmarkService };