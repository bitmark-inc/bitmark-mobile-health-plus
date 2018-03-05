import { TransactionModel } from "../models";

let doGetSignRequests = async () => {
  return await TransactionModel.doGetSignRequests();
};

let doTryGetSignRequests = () => {
  return new Promise((resolve) => {
    TransactionModel.doGetSignRequests().then(resolve).catch(error => {
      console.log('TransactionService doTryGetSignRequests error :', error)
      resolve({
        pendingTransactions: [],
        completedTransactions: [],
      })
    });
  });
};

let TransactionService = {
  doGetSignRequests,
  doTryGetSignRequests
};

export { TransactionService };