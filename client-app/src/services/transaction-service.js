import moment from 'moment';
import { merge } from 'lodash';
import { TransferOfferModel, BitmarkSDK, BitmarkModel, CommonModel } from '../models';
import { sortList } from '../utils';

const doGetAllTransactions = async (accountNumber) => {
  let oldTransactions = (await CommonModel.doGetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS)) || {};
  oldTransactions = oldTransactions || [];
  let lastOffset = null;
  if (oldTransactions) {
    oldTransactions.forEach(oldTx => {
      lastOffset = lastOffset ? Math.max(lastOffset, oldTx.offset) : oldTx.offset;
    });
  }

  let allTransactions = await BitmarkModel.doGetAllTransactions(accountNumber, lastOffset);
  let completedTransfers = merge([], oldTransactions || []);

  for (let transaction of allTransactions) {
    let existingOldTransaction = completedTransfers.find(item => item.txid === transaction.id);
    if (existingOldTransaction) {
      let transactionData = await BitmarkModel.doGetTransactionDetail(transaction.id);
      existingOldTransaction.assetId = transaction.asset_id;
      existingOldTransaction.blockNumber = transaction.block_number;
      existingOldTransaction.assetName = transactionData.asset.name;
      existingOldTransaction.timestamp = transaction.block ? moment(transaction.block.created_at) : '';
      existingOldTransaction.status = transaction.status;
      existingOldTransaction.txid = transaction.id;
      existingOldTransaction.offset = transaction.offset;
    } else {
      if (transaction.owner === accountNumber) {
        if (transaction.id && transaction.previous_id) {
          let previousTransactionData = await BitmarkModel.doGetTransactionDetail(transaction.previous_id);
          completedTransfers.push({
            assetName: previousTransactionData.asset.name,
            from: previousTransactionData.tx.owner,
            to: accountNumber,
            timestamp: transaction.block ? moment(transaction.block.created_at) : '',
            status: transaction.status,
            txid: transaction.id,
            previousId: transaction.previous_id,
            offset: transaction.offset,
          });
        } else if (transaction.id && !transaction.previous_id) {
          let transactionData = await BitmarkModel.doGetTransactionDetail(transaction.id);
          let record = {
            assetId: transaction.asset_id,
            blockNumber: transaction.block_number,
            assetName: transactionData.asset.name,
            from: transactionData.tx.owner,
            timestamp: transaction.block ? moment(transaction.block.created_at) : '',
            status: transaction.status,
            txid: transaction.id,
            offset: transaction.offset,
          };
          completedTransfers.push(record);
        }
      } else if (transaction.id) {
        let nextTransactionData = await BitmarkModel.doGetTransactionDetail(transaction.id);
        completedTransfers.push({
          assetName: nextTransactionData.asset.name,
          from: accountNumber,
          to: transaction.owner,
          timestamp: nextTransactionData.block ? moment(nextTransactionData.block.created_at) : '',
          status: nextTransactionData.tx.status,
          offset: transaction.offset,
          txid: transaction.id,
          previousId: transaction.previous_id,
        });
      }
    }
  }
  completedTransfers = sortList(completedTransfers, (a, b) => b.offset - a.offset);
  return completedTransfers;
};

const doGetActiveIncomingTransferOffers = async (accountNumber) => {
  let activeIncomingTransferOffers = [];
  let allIncomingTransferOffers = await TransferOfferModel.doGetIncomingTransferOffers(accountNumber);

  let bitmarkIds = [];
  allIncomingTransferOffers.forEach(incomingTransferOffer => {
    if (incomingTransferOffer.status === 'open') {
      bitmarkIds.push(incomingTransferOffer.bitmark_id);
    }
  });

  let allData = await BitmarkModel.doGetListBitmarks(bitmarkIds, { includeAsset: true });
  let bitmarks = allData ? (allData.bitmarks || []) : [];
  let assets = allData ? (allData.assets || []) : [];

  for (let incomingTransferOffer of allIncomingTransferOffers) {
    if (incomingTransferOffer.status === 'open') {
      incomingTransferOffer.bitmark = bitmarks.find(bm => bm.id === incomingTransferOffer.bitmark_id);
      incomingTransferOffer.asset = assets.find(a => a.id === incomingTransferOffer.bitmark.asset_id);
      incomingTransferOffer.created_at = moment(incomingTransferOffer.created_at);
      activeIncomingTransferOffers.push(incomingTransferOffer);
    }
  }
  return activeIncomingTransferOffers;
};

const doGetActiveOutgoingTransferOffers = async (accountNumber) => {
  let outgoingTransferOffers = await TransferOfferModel.doGetOutgoingTransferOffers(accountNumber);
  return outgoingTransferOffers.filter(item => item.status === 'open');
};

const doTransferBitmark = async (touchFaceIdSession, bitmarkId, receiver) => {
  return await BitmarkSDK.transferOneSignature(touchFaceIdSession, bitmarkId, receiver);
};

const doGetTransferOfferDetail = async (transferOfferId) => {
  let incomingTransferOffer = await TransferOfferModel.doGetTransferOfferDetail(transferOfferId);
  let transactionData = await BitmarkModel.doGetTransactionDetail(incomingTransferOffer.record.link);
  let bitmarkInformation = await BitmarkModel.doGetBitmarkInformation(transactionData.tx.bitmark_id);
  incomingTransferOffer.tx = transactionData.tx;
  incomingTransferOffer.block = transactionData.block;
  incomingTransferOffer.asset = bitmarkInformation.asset;
  incomingTransferOffer.bitmark = bitmarkInformation.bitmark;
  incomingTransferOffer.created_at = moment(incomingTransferOffer.created_at);
  return incomingTransferOffer;
};
const doAcceptTransferBitmark = async (touchFaceIdSession, transferOffer) => {
  return await BitmarkSDK.signForTransferOfferAndSubmit(touchFaceIdSession, transferOffer.record.link,
    transferOffer.record.signature, transferOffer.id, 'accept');
};

const doRejectTransferBitmark = async (touchFaceIdSession, transferOffer) => {
  return await BitmarkSDK.signForTransferOfferAndSubmit(touchFaceIdSession, transferOffer.record.link,
    transferOffer.record.signature, transferOffer.id, 'reject');
};

const doCancelTransferBitmark = async (touchFaceIdSession, transferOfferId) => {
  let transferOffer = await TransferOfferModel.doGetTransferOfferDetail(transferOfferId);
  return await BitmarkSDK.signForTransferOfferAndSubmit(touchFaceIdSession, transferOffer.record.link,
    transferOffer.record.signature, transferOffer.id, 'cancel');
};

const TransactionService = {
  doGetAllTransactions,
  doTransferBitmark,
  doGetTransferOfferDetail,
  doGetActiveIncomingTransferOffers,
  doGetActiveOutgoingTransferOffers,
  doAcceptTransferBitmark,
  doRejectTransferBitmark,
  doCancelTransferBitmark,
};

export { TransactionService };