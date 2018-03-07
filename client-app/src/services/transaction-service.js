import { TransactionModel } from "../models";

let doGetAllSignRequests = async (accountNumber) => {
  return await TransactionModel.doGetAllGetSignRequests(accountNumber);
};

let doTryGetAllSignRequests = (accountNumber) => {
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

let TransactionService = {
  doGetAllSignRequests,
  doTryGetAllSignRequests
};

export { TransactionService };