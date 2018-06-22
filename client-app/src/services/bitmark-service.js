import moment from 'moment';
import { merge } from 'lodash';
import { BitmarkModel, CommonModel } from "../models";
import { TransactionService } from '.';

// ================================================================================================
// ================================================================================================
const doGetBitmarks = async (bitmarkAccountNumber) => {
  let oldLocalAssets = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS);
  oldLocalAssets = oldLocalAssets || [];
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
  let outgoingTransferOffers = await TransactionService.doGetActiveOutgoingTransferOffers(bitmarkAccountNumber);
  for (let asset of localAssets) {
    asset.totalPending = 0;
    asset.bitmarks = asset.bitmarks.sort((a, b) => b.offset - a.offset);
    for (let bitmark of asset.bitmarks) {
      let transferOffer = outgoingTransferOffers.find(item => item.bitmark_id === bitmark.id);
      bitmark.transferOfferId = transferOffer ? transferOffer.id : null;
      asset.maxBitmarkOffset = asset.maxBitmarkOffset ? Math.max(asset.maxBitmarkOffset, bitmark.offset) : bitmark.offset;
      asset.totalPending += (bitmark.status === 'pending') ? 1 : 0;
    }
  }
  localAssets = localAssets.sort((a, b) => b.maxBitmarkOffset - a.maxBitmarkOffset);
  return {
    localAssets,
    lastOffset,
    outgoingTransferOffers,
  };
};

const doGet100Bitmarks = async (bitmarkAccountNumber, oldLocalAssets, lastOffset, outgoingTransferOffers) => {
  let hasChanging = false;
  if (!oldLocalAssets) {
    hasChanging = true;
    oldLocalAssets = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_LOCAL_BITMARKS);
  }
  oldLocalAssets = oldLocalAssets || [];
  if (!lastOffset) {
    oldLocalAssets.forEach(asset => {
      asset.bitmarks.forEach(bitmark => {
        lastOffset = lastOffset ? Math.max(lastOffset, bitmark.offset) : bitmark.offset;
      });
    });
  }
  let data = await BitmarkModel.doGet100Bitmarks(bitmarkAccountNumber, lastOffset);
  let localAssets = merge([], oldLocalAssets || []);

  if (data && data.bitmarks && data.assets) {
    hasChanging = data.bitmarks.length >= 100;
    for (let bitmark of data.bitmarks) {
      lastOffset = lastOffset ? Math.max(lastOffset, bitmark.offset) : bitmark.offset;
      bitmark.bitmark_id = bitmark.id;
      bitmark.isViewed = false;
      if (bitmark.owner === bitmarkAccountNumber) {
        hasChanging = true;
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
            hasChanging = true;
            oldAsset.bitmarks.splice(oldBitmarkIndex, 1);
            if (oldAsset.bitmarks.length === 0) {
              localAssets.splice(oldAssetIndex, 1);
            }
          }
        }
      }
    }
  }
  outgoingTransferOffers = outgoingTransferOffers ? outgoingTransferOffers : (await TransactionService.doGetActiveOutgoingTransferOffers(bitmarkAccountNumber));
  for (let asset of localAssets) {
    asset.totalPending = 0;
    asset.bitmarks = asset.bitmarks.sort((a, b) => b.offset - a.offset);
    for (let bitmark of asset.bitmarks) {
      let transferOffer = outgoingTransferOffers.find(item => item.bitmark_id === bitmark.id);
      console.log('transferOffer =============:', transferOffer);

      let oldData = bitmark.transferOfferId;
      bitmark.transferOfferId = transferOffer ? transferOffer.id : null;
      hasChanging = hasChanging || oldData !== bitmark.transferOfferId;

      oldData = asset.maxBitmarkOffset;
      asset.maxBitmarkOffset = asset.maxBitmarkOffset ? Math.max(asset.maxBitmarkOffset, bitmark.offset) : bitmark.offset;
      hasChanging = hasChanging || oldData !== asset.maxBitmarkOffset;

      oldData = asset.totalPending;
      asset.totalPending += (bitmark.status === 'pending') ? 1 : 0;
      hasChanging = hasChanging || oldData !== asset.totalPending;
    }
  }

  if (hasChanging) {
    localAssets = localAssets.sort((a, b) => b.maxBitmarkOffset - a.maxBitmarkOffset);
  }
  return {
    hasChanging,
    localAssets,
    lastOffset,
    outgoingTransferOffers,
  };
};

const doCheckFileToIssue = async (filePath) => {
  let assetInfo = await BitmarkModel.doPrepareAssetInfo(filePath);
  let assetInformation = await BitmarkModel.doGetAssetInformation(assetInfo.id);
  if (!assetInformation) {
    return assetInfo;
  } else {
    let accessibilityData = await BitmarkModel.doGetAssetAccessibility(assetInfo.id);
    assetInformation.accessibility = accessibilityData.accessibility;
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
  data.bitmark.created_at = moment(data.bitmark.created_at).format('YYYY MMM DD HH:mm:ss');
  data.bitmark.bitmark_id = data.bitmark.id;
  return data;
};

const doGetTrackingBitmarks = async (bitmarkAccountNumber) => {
  let oldTrackingBitmarks = await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRACKING_BITMARKS);
  oldTrackingBitmarks = oldTrackingBitmarks || [];
  let oldStatuses = {};
  let allTrackingBitmarksFromServer = await BitmarkModel.doGetAllTrackingBitmark(bitmarkAccountNumber);
  allTrackingBitmarksFromServer.bitmarks.forEach(tb => {
    oldStatuses[tb.bitmark_id] = {
      lastHistory: {
        status: tb.status,
        head_id: tb.tx_id,
      },
    };
  });
  oldTrackingBitmarks.forEach(otb => {
    if (oldStatuses[otb.id]) {
      oldStatuses[otb.id].lastHistory = otb.lastHistory;
      oldStatuses[otb.id].asset = otb.asset;
      oldStatuses[otb.id].isViewed = otb.isViewed;
    }
  });
  let bitmarkIds = Object.keys(oldStatuses);
  let allData = await BitmarkModel.doGetListBitmarks(bitmarkIds, { includeAsset: true });
  let bitmarks = allData ? (allData.bitmarks || []) : [];
  let assets = allData ? (allData.assets || []) : [];
  let trackingBitmarks = [];
  for (let bitmark of bitmarks) {
    let oldStatus = oldStatuses[bitmark.id];
    bitmark.asset = assets.find(asset => asset.id === bitmark.asset_id);

    if (oldStatus.lastHistory.head_id !== bitmark.head_id ||
      (oldStatus.lastHistory.head_id === bitmark.head_id && oldStatus.lastHistory.status !== bitmark.status)) {
      bitmark.isViewed = false;
    } else {
      bitmark.isViewed = !!oldStatus.isViewed;
    }
    bitmark.lastHistory = oldStatus.lastHistory;

    trackingBitmarks.push(bitmark);
  }
  return trackingBitmarks;
};

const doGetProvenance = async (bitmarkId, headId, status) => {
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
  return provenance;
};

const doConfirmWebAccount = async (touchFaceIdSession, bitmarkAccountNumber, token) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  return await BitmarkModel.doConfirmWebAccount(bitmarkAccountNumber, token, signatureData.timestamp, signatureData.signature);
};

// ================================================================================================
// ================================================================================================
let BitmarkService = {
  doGetBitmarks,
  doGet100Bitmarks,
  doCheckFileToIssue,
  doCheckMetadata,
  doIssueFile,
  doGetBitmarkInformation,
  doGetTrackingBitmarks,
  doGetProvenance,
  doConfirmWebAccount,
};

export { BitmarkService };