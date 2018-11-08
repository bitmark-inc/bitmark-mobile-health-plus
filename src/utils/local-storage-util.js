import { FileUtil } from "./index";
import { DataProcessor } from "../processors";

const getUserLocalStorageFolderPath = (bitmarkAccountNumber) => {
  return `${FileUtil.DocumentDirectory}/${bitmarkAccountNumber || DataProcessor.getUserInformation().bitmarkAccountNumber}`;
};

const getLocalAssetsFolderPath = (bitmarkAccountNumber) => {
  return `${getUserLocalStorageFolderPath(bitmarkAccountNumber)}/assets`;
};

const getLocalThumbnailsFolderPath = (bitmarkAccountNumber) => {
  return `${getUserLocalStorageFolderPath(bitmarkAccountNumber)}/thumbnails`;
};

const getLocalDatabasesFolderPath = (bitmarkAccountNumber) => {
  return `${getUserLocalStorageFolderPath(bitmarkAccountNumber)}/databases`;
};

const moveOldDataFilesToNewLocalStorageFolder = async () => {
  let bitmarkAccountNumber = DataProcessor.getUserInformation() && DataProcessor.getUserInformation().bitmarkAccountNumber;
  if (bitmarkAccountNumber) {
    // Move asset folder
    let localAssetsFolderPath = getLocalAssetsFolderPath();
    if (!(await FileUtil.exists(localAssetsFolderPath))) {
      let oldAssetsFolderPath = `${FileUtil.DocumentDirectory}/assets/${bitmarkAccountNumber}`;

      if (await FileUtil.exists(oldAssetsFolderPath)) {
        await FileUtil.copyDir(oldAssetsFolderPath, localAssetsFolderPath);
      }
    }

    // Copy asset folder
    let thumbnailsAssetsFolderPath = getLocalThumbnailsFolderPath();
    if (!(await FileUtil.exists(thumbnailsAssetsFolderPath))) {
      await FileUtil.mkdir(`${thumbnailsAssetsFolderPath}`);
      let oldThumbnailsFolderPath = `${FileUtil.DocumentDirectory}/thumbnails/`;

      if (await FileUtil.exists(oldThumbnailsFolderPath)) {
        await FileUtil.copyDir(oldThumbnailsFolderPath, thumbnailsAssetsFolderPath);
      }
    }
  }
};

const initializeLocalStorage =  async () => {
  if (DataProcessor.getUserInformation() && DataProcessor.getUserInformation().bitmarkAccountNumber) {
    await FileUtil.mkdir(getUserLocalStorageFolderPath());
    await FileUtil.mkdir(getLocalAssetsFolderPath());
    await FileUtil.mkdir(getLocalThumbnailsFolderPath());
  }
};

export {
  initializeLocalStorage,
  getLocalAssetsFolderPath,
  getLocalThumbnailsFolderPath,
  getLocalDatabasesFolderPath,
  moveOldDataFilesToNewLocalStorageFolder
}