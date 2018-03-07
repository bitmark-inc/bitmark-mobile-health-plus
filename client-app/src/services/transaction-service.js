import { TransactionModel, BitmarkSDK, BitmarkModel, CommonModel } from '../models';
import { UserService } from './user-service';

const doGetAllSignRequests = async (accountNumber) => {
  let signRequests = await TransactionModel.doGetAllGetSignRequests(accountNumber);
  for (let signRequest of signRequests) {
    let transactionData = await BitmarkModel.doGetTransactionInformation(signRequest.half_signed_transfer.link);
    let bitmarkInformation = await BitmarkModel.doGetBitmarkInformation(transactionData.tx.bitmark_id);
    signRequest.tx = transactionData.tx;
    signRequest.block = transactionData.block;
    signRequest.asset = bitmarkInformation.asset;
    signRequest.bitmark = bitmarkInformation.bitmark;
  }
  //TODO distinguish action and completed
  return { pendingTransactions: signRequests };
};


const doTransferBitmark = async (touchFaceIdSession, bitmarkId, receiver) => {
  let userInfo = await UserService.doGetCurrentUser();
  let firstSignatureData = await BitmarkSDK.sign1stForTransfer(touchFaceIdSession, bitmarkId, receiver);
  return await TransactionModel.doSubmitSignRequest(userInfo.bitmarkAccountNumber, bitmarkId, firstSignatureData.txid, firstSignatureData.signature);
};

const doAcceptTransferBitmark = async (touchFaceIdSession, bitmarkId, txid, firstSignature) => {
  let userInfo = await UserService.doGetCurrentUser();
  let counterSigature = await BitmarkSDK.sign2ndForTransfer(touchFaceIdSession, txid, firstSignature);
  return await TransactionModel.doSubmitCounterSignRequest(userInfo.bitmarkAccountNumber, bitmarkId, counterSigature);
};

const doRejectTransferBitmark = async (accountNumber, bitmarkId) => {
  let userInfo = await UserService.doGetCurrentUser();
  let signatureData = CommonModel.doCreateSignatureData();
  return await TransactionModel.doRejectlSignRequest(userInfo.bitmarkAccountNumber, bitmarkId, signatureData);
};
const doCancelTransferBitmark = async () => {
  //TODO
};

const TransactionService = {
  doTransferBitmark,
  doGetAllSignRequests,
  doAcceptTransferBitmark,
  doRejectTransferBitmark,
  doCancelTransferBitmark,
};

export { TransactionService };