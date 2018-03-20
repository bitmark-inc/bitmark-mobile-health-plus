import moment from 'moment';
import { BitmarkModel } from "../models";
import { sortList } from './../utils';
import { TransactionService } from '.';

// ================================================================================================
// ================================================================================================
let doGetBitmarks = async (bitmarkAccountNumber) => {
  let data = await BitmarkModel.doGetAllBitmarks(bitmarkAccountNumber);
  let outgoingTransferOffers = await TransactionService.doGetActiveOutgoinTransferOffers(bitmarkAccountNumber);

  let localAssets = [];
  if (data && data.bitmarks && data.assets) {
    for (let asset of data.assets) {
      asset.asset_id = asset.id;
      for (let bitmark of data.bitmarks) {
        if (!bitmark.checked && bitmark.asset_id === asset.id) {
          bitmark.checked = true;
          let isTransferring = outgoingTransferOffers.findIndex(item => item.bitmark_id === bitmark.id);
          bitmark.status = isTransferring >= 0 ? 'transferring' : bitmark.status;
          bitmark.created_at = moment(bitmark.created_at).format('YYYY MMM DD HH:mm:ss');
          if (!bitmark.bitmark_id) {
            bitmark.bitmark_id = bitmark.id;
          }
          if (bitmark.asset_id === asset.id) {
            if (!asset.bitmarks) {
              asset.bitmarks = [];
              asset.totalPending = 0;
            }
            asset.metadata = (asset.metadata && (typeof asset.metadata === 'string')) ? JSON.parse(asset.metadata) : asset.metadata;
            asset.created_at = moment(asset.created_at).format('YYYY MMM DD HH:mm:ss')
            asset.totalPending += (bitmark.status === 'pending') ? 1 : 0;
            asset.maxBitmarkOffset = asset.maxBitmarkOffset ? Math.max(asset.maxBitmarkOffset, bitmark.offset) : bitmark.offset;
            asset.bitmarks.push(bitmark);
          }
        }
      }
      asset.bitmarks = sortList(asset.bitmarks, ((a, b) => b.offset - a.offset));
      localAssets.push(asset);
    }
  }
  localAssets = sortList(localAssets, ((a, b) => b.maxBitmarkOffset - a.maxBitmarkOffset));
  return localAssets;
};

const doCheckFileToIssue = async (filePath) => {
  let assetInfo = await BitmarkModel.doPrepareAssetInfo(filePath);
  let assetInformation = await BitmarkModel.doGetAssetInformation(assetInfo.id);
  if (!assetInformation) {
    return assetInfo;
  } else {
    return assetInformation;
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

const doIssueFile = async (touchFaceIdSession, filepath, assetName, metadataList, quantity) => {
  let metadata = {};
  metadataList.forEach(item => {
    if (item.label && item.value) {
      metadata[item.label] = item.value;
    }
  });
  return await BitmarkModel.doIssueFile(touchFaceIdSession, filepath, assetName, metadata, quantity);
};

const doGetBitmarkInformation = async (bitmarkId) => {
  let data = await BitmarkModel.doGetBitmarkInformation(bitmarkId);
  data.bitmark.created_at = moment(data.bitmark.created_at).format('YYYY MMM DD HH:mm:ss');
  data.bitmark.bitmark_id = data.bitmark.id;
  return data;
};

// ================================================================================================
// ================================================================================================
let BitmarkService = {
  doGetBitmarks,
  doCheckFileToIssue,
  doCheckMetadata,
  doIssueFile,
  doGetBitmarkInformation,
};

export { BitmarkService };