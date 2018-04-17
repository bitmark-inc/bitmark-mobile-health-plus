import moment from 'moment';
import { merge } from 'lodash';
import { BitmarkModel, CommonModel } from "../models";
import { sortList } from './../utils';
import { TransactionService } from '.';

// ================================================================================================
// ================================================================================================
const doGetBitmarks = async (bitmarkAccountNumber, oldLocalAssets) => {
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
      bitmark.bitmark_id = bitmark.id;
      let { provenance } = await BitmarkModel.doGetProvenance(bitmark.id);
      bitmark.provenance = provenance;
      bitmark.isViewed = false;
      if (bitmark.owner === bitmarkAccountNumber) {
        let oldAsset = (localAssets).find(asset => asset.id === bitmark.asset_id);
        if (oldAsset) {
          let oldBitmarkIndex = oldAsset.bitmarks.findIndex(ob => ob.id === bitmark.id);
          if (oldBitmarkIndex >= 0) {
            oldAsset.bitmarks[oldBitmarkIndex] = bitmark;
          } else {
            oldAsset.bitmarks.push(bitmark);
          }
          oldAsset.isViewed = false;
        } else {
          let newAsset = data.assets.find(asset => asset.id === bitmark.asset_id);
          newAsset.bitmarks = [bitmark];
          newAsset.isViewed = false;
          localAssets.push(newAsset);
        }
      } else {
        let oldAssetIndex = (localAssets).findIndex(asset => asset.id === bitmark.asset_id);
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
  for (let asset of localAssets) {
    asset.totalPending = 0;
    asset.bitmarks = sortList(asset.bitmarks, ((a, b) => b.offset - a.offset));
    for (let bitmark of asset.bitmarks) {
      if (!bitmark.provenance) {
        let { provenance } = await BitmarkModel.doGetProvenance(bitmark.id);
        bitmark.provenance = provenance;
      }
      let isTransferring = outgoingTransferOffers.findIndex(item => item.bitmark_id === bitmark.id);
      bitmark.displayStatus = isTransferring >= 0 ? 'transferring' : bitmark.status;
      asset.maxBitmarkOffset = asset.maxBitmarkOffset ? Math.max(asset.maxBitmarkOffset, bitmark.offset) : bitmark.offset;
      asset.totalPending += (bitmark.displayStatus === 'pending') ? 1 : 0;
    }
  }
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

const doGetTrackingBitmarks = async (bitmarkAccountNumber, oldTrackingBitmarks) => {
  oldTrackingBitmarks = oldTrackingBitmarks || [];
  let trackingBitmarks = [];
  let bitmarkIds = [];
  for (let oldTB of oldTrackingBitmarks) {
    bitmarkIds.push(oldTB.id);
  }
  //TODO get new tracking from server

  let bitmarks = await BitmarkModel.getListBitmarks(bitmarkIds);
  console.log('bitmarks :', bitmarks);

  for (let bitmark of bitmarks) {
    let oldTB = oldTrackingBitmarks.find(otb => otb.id === bitmark.id);
    console.log('oldTB :', oldTB);
    if (oldTB) {
      if (oldTB.head_id !== bitmark.head_id || (oldTB.head_id === bitmark.head_id && oldTB.status !== bitmark.status)) {
        oldTB.isViewed = false;
        trackingBitmarks.push(merge({}, oldTB, bitmark));
      } else {
        trackingBitmarks.push(oldTB);
      }
    } else {
      let bitmarkFullInfo = BitmarkModel.doGetBitmarkInformation(bitmark.id);
      bitmark.asset = bitmarkFullInfo.asset;
      bitmark.isViewed = false;
      trackingBitmarks.push(bitmark);
    }
  }

  // oldTrackingBitmarks = oldTrackingBitmarks || [];
  // let trackingBitmarks = [];
  // for (let oldBitmark of oldTrackingBitmarks) {
  // let { bitmark } = await BitmarkModel.doGetProvenance(bitmark.id);
  //   let lastProvenance;
  //   if (bitmark.provenance && bitmark.provenance.length > 0) {
  //     lastProvenance = bitmark.provenance[0];
  //   }
  //   if (lastProvenance && (lastProvenance.tx_id !== oldBitmark.lastProvenance.tx_id ||
  //     (lastProvenance.tx_id === oldBitmark.lastProvenance.tx_id && lastProvenance.status !== oldBitmark.lastProvenance.status))) {
  //     let isViewed = false;
  //     bitmark.provenance.forEach(hs => {
  //       if (hs.tx_id === bitmark.lastProvenance.tx_id) {
  //         hs.isViewed = hs.status === bitmark.lastProvenance.status;
  //         isViewed = true;
  //       } else {
  //         hs.isViewed = isViewed;
  //       }
  //     });
  //     trackingBitmarks.push(merge({}, oldBitmark, bitmark));
  //   } else {
  //     trackingBitmarks.push(bitmark);
  //   }
  // }
  // trackingBitmarks.forEach(bitmark => {
  //   bitmark.isViewed = bitmark.provenance.findIndex(hs => !hs.isViewed) < 0;
  // })

  // trackingBitmarks = sortList(trackingBitmarks, ((a, b) => b.offset - a.offset));
  return trackingBitmarks;
};

const doGetProvenance = async (bitmarkId, headId, status) => {
  console.log('doGetProvenance :', bitmarkId, headId, status);
  let { provenance } = await BitmarkModel.doGetProvenance(bitmarkId);
  if (headId && status) {
    let isViewed = false;
    provenance.forEach(hs => {
      if (hs.tx_id === headId) {
        hs.isViewed = hs.status === status;
        isViewed = true;
      } else {
        hs.isViewed = isViewed;
      }
    });
  }
  console.log(provenance);
  return provenance;
};

// ================================================================================================
// ================================================================================================
let BitmarkService = {
  doGetBitmarks,
  doCheckFileToIssue,
  doCheckMetadata,
  doIssueFile,
  doGetBitmarkInformation,
  doGetTrackingBitmarks,
  doGetProvenance,
};

export { BitmarkService };