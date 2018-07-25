import { Dimensions } from 'react-native';
import { CommonModel, UserModel } from "../models";
let currentSize = Dimensions.get('window');
let widthDesign = 375;

const convertWidth = (width) => {
  return width * currentSize.width / widthDesign;
};

const sortList = (list, compare) => {
  for (let index = 0; index < list.length; index++) {
    for (let tempIndex = index + 1; tempIndex < list.length; tempIndex++) {
      if (compare(list[index], list[tempIndex]) > 0) {
        let temp = list[index];
        list[index] = list[tempIndex];
        list[tempIndex] = temp;
      }
    }
  }
  return list;
};

const runPromiseWithoutError = (promise) => {
  return new Promise((resolve) => {
    promise.then(resolve).catch(error => resolve({ error }));
  });
};

const compareVersion = (version1, version2) => {
  if (version1 === null) {
    return -1;
  }
  if (version2 === null) {
    return 1;
  }
  let versionParts1 = version1.split('.');
  let versionParts2 = version2.split('.');
  for (let index in versionParts1) {
    let versionPart1 = +versionParts1[index];
    let versionPart2 = +versionParts2[index];
    if (versionPart1 !== versionPart2) {
      return versionPart1 < versionPart2 ? -1 : 1;
    }
  }
  return 0;
};

const addTestWriteRecoveryPhaseActionRequired = async (user) => {
  await CommonModel.doSetLocalData(`${CommonModel.KEYS.TEST_RECOVERY_PHASE_ACTION_REQUIRED}-${user.bitmarkAccountNumber}`, {
    timestamp: (new Date()).toISOString()
  });
};

const getTestWriteRecoveryPhaseActionRequired = async () => {
  let user = await UserModel.doGetCurrentUser();
  return CommonModel.doGetLocalData(`${CommonModel.KEYS.TEST_RECOVERY_PHASE_ACTION_REQUIRED}-${user.bitmarkAccountNumber}`);
};

const removeTestWriteRecoveryPhaseActionRequired = async () => {
  let user = await UserModel.doGetCurrentUser();
  await CommonModel.doRemoveLocalData(`${CommonModel.KEYS.TEST_RECOVERY_PHASE_ACTION_REQUIRED}-${user.bitmarkAccountNumber}`);
};


export { convertWidth, sortList, runPromiseWithoutError, compareVersion, addTestWriteRecoveryPhaseActionRequired, getTestWriteRecoveryPhaseActionRequired, removeTestWriteRecoveryPhaseActionRequired };