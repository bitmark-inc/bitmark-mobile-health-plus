import { TransactionModel, BitmarkSDK, BitmarkModel } from '../models';
import { UserService } from './user-service';

const doGetAllSignRequests = async (accountNumber) => {
  let signRequests = await TransactionModel.doGetAllGetSignRequests(accountNumber);
  for (let signRequest of signRequests) {
    let transactionData = await BitmarkModel.doGetBitmarkInformation(signRequest.half_signed_transfer.link);
    let bitmarkInformation = await BitmarkModel.doGetBitmarkInformation(transactionData.bitmark_id);
    signRequest.asset = bitmarkInformation.asset;
    signRequest.bitmark = bitmarkInformation.bitmark;
  }
  //TODO distinguish action and completed
  return { pendingTransactions: signRequests };
};

const doTryGetAllSignRequests = (accountNumber) => {
  return new Promise((resolve) => {
    TransactionModel.doGetAllGetSignRequests(accountNumber).then(resolve).catch(error => {
      console.log('TransactionService doTryGetAllSignRequests error :', error)
      resolve({
        pendingTransactions: [],
        completedTransactions: [],
      })
    });
  });
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

const doRejectTransferBitmark = async () => {
  //TODO
};
const doCancelTransferBitmark = async () => {
  //TODO
};

const TransactionService = {
  doTransferBitmark,
  doGetAllSignRequests,
  doTryGetAllSignRequests,
  doAcceptTransferBitmark,
  doRejectTransferBitmark,
  doCancelTransferBitmark,
};

export { TransactionService };