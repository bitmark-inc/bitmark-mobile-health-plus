
import { DonationModel, CommonModel } from "../models";

const doRegisterUserInformation = async (touchFaceIdSession, bitmarkAccountNumber, ) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  if (!signatureData) {
    return null;
  }
  return await DonationModel.doRegisterUserInformation(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
};

const doDeregisterUserInformation = async (touchFaceIdSession, bitmarkAccountNumber, ) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  if (!signatureData) {
    return null;
  }
  return await DonationModel.doDeregisterUserInformation(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature);
};

const doJoinStudy = async (touchFaceIdSession, bitmarkAccountNumber, studyId) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  if (!signatureData) {
    return null;
  }
  return await DonationModel.doJoinStudy(bitmarkAccountNumber, studyId, signatureData.timestamp, signatureData.signature);
};

const doLeaveStudy = async (touchFaceIdSession, bitmarkAccountNumber, studyId) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  if (!signatureData) {
    return null;
  }
  return await DonationModel.doLeaveStudy(bitmarkAccountNumber, studyId, signatureData.timestamp, signatureData.signature);
};

const doCompleteTask = async (touchFaceIdSession, bitmarkAccountNumber, taskType, completedAt, studyId, txid) => {
  let signatureData = await CommonModel.doCreateSignatureData(touchFaceIdSession);
  if (!signatureData) {
    return null;
  }
  return await DonationModel.doCompleteTask(bitmarkAccountNumber, signatureData.timestamp, signatureData.signature, taskType, completedAt, studyId, txid);
};

const DonationService = {
  doGetUserInformation: DonationModel.doGetUserInformation,
  doRegisterUserInformation,
  doDeregisterUserInformation,
  doCompleteTask,
  doJoinStudy,
  doLeaveStudy,
};

export { DonationService };