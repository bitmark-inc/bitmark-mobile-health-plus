import moment from 'moment';
import { merge } from 'lodash';
import { TransactionModel, BitmarkSDK, BitmarkModel, UserModel, CommonModel } from '../models';
import { sortList } from '../utils';

const getAllTransactions = async (accountNumber, oldTransactions) => {
  let lastOffset = null;
  if (oldTransactions) {
    oldTransactions.forEach(oldTx => {
      lastOffset = lastOffset ? Math.max(lastOffset, oldTx.offset) : oldTx.offset;
    });
  }

  let allTransactions = await TransactionModel.getAllTransactions(accountNumber, lastOffset);
  let completedTransfers = merge([], oldTransactions || []);

  let mapIssuanceBlock = {};
  for (let transaction of allTransactions) {
    let existingOldTransaction = completedTransfers.find(item => item.txid === transaction.id);
    if (existingOldTransaction) {
      existingOldTransaction.status = transaction.status;
      return;
    }
    if (transaction.owner === accountNumber) {
      if (transaction.id && transaction.previous_id) {
        let previousTransactionData = await TransactionModel.getTransactionDetail(transaction.previous_id);
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
        if (mapIssuanceBlock[transaction.asset_id] && mapIssuanceBlock[transaction.asset_id][transaction.block_number]) {
          mapIssuanceBlock[transaction.asset_id][transaction.block_number].offset =
            Math.max(mapIssuanceBlock[transaction.asset_id][transaction.block_number].offset, transaction.offset);
        } else {
          if (!mapIssuanceBlock[transaction.asset_id]) {
            mapIssuanceBlock[transaction.asset_id] = {};
          }
          let transactionData = await TransactionModel.getTransactionDetail(transaction.id);
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
          mapIssuanceBlock[transaction.asset_id][transaction.block_number] = record;
          completedTransfers.push(record);
        }
      }
    } else if (transaction.id) {
      let nextTransactionData = await TransactionModel.getTransactionDetail(transaction.id);
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
  completedTransfers = sortList(completedTransfers, (a, b) => b.offset - a.offset);
  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSACTIONS, completedTransfers);
  return completedTransfers;
};

const doGetActiveIncomingTransferOffers = async (accountNumber) => {
  let activeIncomingTransferOffers = [];
  let allIncomingTransferOffers = await TransactionModel.doGetIncomingTransferOffers(accountNumber);
  for (let incomingTransferOffer of allIncomingTransferOffers) {
    if (incomingTransferOffer.status === 'waiting') {
      let transactionData = await BitmarkModel.doGetTransactionInformation(incomingTransferOffer.link);
      let bitmarkInformation = await BitmarkModel.doGetBitmarkInformation(transactionData.tx.bitmark_id);
      incomingTransferOffer.tx = transactionData.tx;
      incomingTransferOffer.block = transactionData.block;
      incomingTransferOffer.asset = bitmarkInformation.asset;
      incomingTransferOffer.bitmark = bitmarkInformation.bitmark;
      incomingTransferOffer.created_at = moment(incomingTransferOffer.created_at);
      activeIncomingTransferOffers.push(incomingTransferOffer);
    }
  }
  await CommonModel.doSetLocalData(CommonModel.KEYS.USER_DATA_TRANSFER_OFFERS, activeIncomingTransferOffers);
  return activeIncomingTransferOffers;
};

const doGetActiveOutgoinTransferOffers = async (accountNumber) => {
  let outgoinTransferOffers = await TransactionModel.doGetOutgoingTransferOffers(accountNumber);
  return outgoinTransferOffers.filter(item => item.status === 'waiting');
};

const doTransferBitmark = async (touchFaceIdSession, bitmarkId, receiver) => {
  let userInfo = await UserModel.doGetCurrentUser();
  let firstSignatureData = await BitmarkSDK.sign1stForTransfer(touchFaceIdSession, bitmarkId, receiver);
  return await TransactionModel.doSubmitTransferOffer(userInfo.bitmarkAccountNumber, bitmarkId, firstSignatureData.txid, firstSignatureData.signature, receiver);
};

const doAcceptTransferBitmark = async (touchFaceIdSession, bitmarkId) => {
  let userInfo = await UserModel.doGetCurrentUser();
  let incomingTransferOffer = await TransactionModel.doGetTransferOfferDetail(userInfo.bitmarkAccountNumber, bitmarkId);
  let counterSigature = await BitmarkSDK.sign2ndForTransfer(touchFaceIdSession, incomingTransferOffer.half_signed_transfer.link, incomingTransferOffer.half_signed_transfer.signature);
  return await TransactionModel.doAccepTransferOffer(userInfo.bitmarkAccountNumber, bitmarkId, counterSigature);
};

const doGetTransferOfferDetail = async (bitmarkId) => {
  let userInfo = await UserModel.doGetCurrentUser();
  let incomingTransferOffer = await TransactionModel.doGetTransferOfferDetail(userInfo.bitmarkAccountNumber, bitmarkId);
  let transactionData = await BitmarkModel.doGetTransactionInformation(incomingTransferOffer.half_signed_transfer.link);
  let bitmarkInformation = await BitmarkModel.doGetBitmarkInformation(transactionData.tx.bitmark_id);
  incomingTransferOffer.tx = transactionData.tx;
  incomingTransferOffer.block = transactionData.block;
  incomingTransferOffer.asset = bitmarkInformation.asset;
  incomingTransferOffer.bitmark = bitmarkInformation.bitmark;
  incomingTransferOffer.created_at = moment(incomingTransferOffer.created_at);
  return incomingTransferOffer;
};

const doRejectTransferBitmark = async (bitmarkId) => {
  let userInfo = await UserModel.doGetCurrentUser();
  //TODO need signature
  // let signatureData = await CommonModel.doCreateSignatureData();
  // return await TransactionModel.doRejectTransferOffer(userInfo.bitmarkAccountNumber, bitmarkId, signatureData);
  return await TransactionModel.doRejectTransferOffer(userInfo.bitmarkAccountNumber, bitmarkId, null);
};

const doCancelTransferBitmark = async (bitmarkId) => {
  let userInfo = await UserModel.doGetCurrentUser();
  return await TransactionModel.doCancelTransferOffer(userInfo.bitmarkAccountNumber, bitmarkId);
};

const TransactionService = {
  getAllTransactions,
  doTransferBitmark,
  doGetTransferOfferDetail,
  doGetActiveIncomingTransferOffers,
  doGetActiveOutgoinTransferOffers,
  doAcceptTransferBitmark,
  doRejectTransferBitmark,
  doCancelTransferBitmark,
};

export { TransactionService };