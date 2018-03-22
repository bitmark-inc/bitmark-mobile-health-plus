import moment from 'moment';
import { merge } from 'lodash';
import { BitmarkModel, CommonModel } from "../models";
import { sortList } from './../utils';
import { TransactionService } from '.';

// ================================================================================================
// ================================================================================================
let doGetBitmarks = async (bitmarkAccountNumber, oldLocalAssets) => {
  let lastOffset = null;
  if (oldLocalAssets) {
    oldLocalAssets.forEach(asset => {
      asset.bitmarks.forEach(bitmark => {
        lastOffset = lastOffset ? Math.max(lastOffset, bitmark.offset) : bitmark.offset;
      });
    });
  }
  let data = await BitmarkModel.doGetAllBitmarks(bitmarkAccountNumber, lastOffset);
  let localAssets = merge([], oldLocalAssets || []);
  if (data && data.bitmarks && data.assets) {
    for (let bitmark of data.bitmarks) {
      if (bitmark.owner === bitmarkAccountNumber) {
        let oldAsset = (localAssets).find(asset => asset.id === bitmark.asset_id);
        if (oldAsset) {
          let oldBitmarkIndex = oldAsset.bitmarks.findIndex(ob => ob.id === bitmark.id);
          if (oldBitmarkIndex >= 0) {
            oldAsset.bitmarks[oldBitmarkIndex] = bitmark;
          } else {
            oldAsset.bitmarks.push(bitmark);
          }
        } else {
          let newAsset = data.assets.find(asset => asset.id === bitmark.asset_id);
          newAsset.bitmarks = [bitmark];
          localAssets.push(newAsset);
        }
      } else {
        let oldAssetIndex = (localAssets).find(asset => asset.id === bitmark.asset_id);
        if (oldAssetIndex >= 0) {
          let oldAsset = localAssets[oldAssetIndex];
          let oldBitmarkIndex = oldAsset.bitmarks.findIndex(ob => bitmark.id === ob.id);
          if (oldBitmarkIndex >= 0) {
            oldAsset.bitmarks.splice(oldBitmarkIndex, 1);
            if (oldAsset.bitmarks.length === 0) {
              localAssets.splice(oldAssetIndex, 1);
            }
          }
        }
      }
    }
  }
  let outgoingTransferOffers = await TransactionService.doGetActiveOutgoinTransferOffers(bitmarkAccountNumber);
  localAssets.forEach(asset => {
    asset.totalPending = 0;
    asset.bitmarks = sortList(asset.bitmarks, ((a, b) => b.offset - a.offset));
    asset.bitmarks.forEach(bitmark => {
      let isTransferring = outgoingTransferOffers.findIndex(item => item.bitmark_id === bitmark.id);
      bitmark.status = isTransferring >= 0 ? 'transferring' : bitmark.status;
      asset.maxBitmarkOffset = asset.maxBitmarkOffset ? Math.max(asset.maxBitmarkOffset, bitmark.offset) : bitmark.offset;
      asset.totalPending += (bitmark.status === 'pending') ? 1 : 0;
    });
  });
  localAssets = sortList(localAssets, ((a, b) => b.maxBitmarkOffset - a.maxBitmarkOffset));
  CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS, localAssets);
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