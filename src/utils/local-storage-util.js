import { FileUtil } from "./index";
import { DataProcessor } from "../processors";
import {
  getIndexedDataByBitmarkId, getTagRecordByBitmarkId,
  insertDetectedDataToIndexedDB,
  updateTag
} from "./indexed-db-util";
import iCloudSyncAdapter from "../models/adapters/icloud";
import base58 from 'bs58';

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

const getLocalCachesFolderPath = (bitmarkAccountNumber) => {
  return `${getUserLocalStorageFolderPath(bitmarkAccountNumber)}/caches`;
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

const readIndexedDataFile = async (assetId) => {
  let indexedData;
  let indexedDataFilePath = `${getLocalAssetsFolderPath()}/${assetId}/indexedData.txt`;

  if (await FileUtil.exists(indexedDataFilePath)) {
    indexedData = await FileUtil.readFile(indexedDataFilePath, 'utf8');
  }

  return indexedData;
};

const writeIndexedDataFile = async (indexedDataFilePath, indexedData) => {
  await FileUtil.writeFile(indexedDataFilePath, indexedData, 'utf8');
};

const readTagFile = async (assetId) => {
  let tags = [];
  let tagFilePath = `${getLocalAssetsFolderPath()}/${assetId}/tag.txt`;

  if (await FileUtil.exists(tagFilePath)) {
    let tagsStr = await FileUtil.readFile(tagFilePath, 'utf8');
    tags = tagsStr.split(' ');
  }

  return tags;
};

const writeTagFile = async (tagFilePath, tags) => {
  await FileUtil.writeFile(tagFilePath, tags.join(' '), 'utf8');
};

const checkAndSyncIndexedDataForBitmark = async (bitmark) => {
  let indexedFileName = 'indexedData.txt';
  let indexedDataFilePath = `${getLocalAssetsFolderPath()}/${bitmark.asset.id}/${indexedFileName}`;
  let isFileExisted = await FileUtil.exists(indexedDataFilePath);
  let indexedDataRecord = await getIndexedDataByBitmarkId(bitmark.id);

  if (isFileExisted && !indexedDataRecord) {
    let indexedData = await readIndexedDataFile(bitmark.asset.id);
    await insertDetectedDataToIndexedDB(bitmark.id, bitmark.asset.name, bitmark.asset.metadata, indexedData);
  }

  if (!isFileExisted && indexedDataRecord) {
    let indexedDataFilePath = `${getLocalAssetsFolderPath()}/${bitmark.asset.id}/indexedData.txt`;
    await writeIndexedDataFile(indexedDataFilePath, indexedDataRecord.content);
    iCloudSyncAdapter.uploadFileToCloud(indexedDataFilePath, `${DataProcessor.getUserInformation().bitmarkAccountNumber}_assets_${base58.encode(new Buffer(bitmark.asset.id, 'hex'))}_${indexedFileName}`);
  }
};

const checkAndSyncTagForBitmark = async (bitmark) => {
  let tagFileName = 'tag.txt';
  let tagFilePath = `${getLocalAssetsFolderPath()}/${bitmark.asset.id}/${tagFileName}`;
  let isFileExisted = await FileUtil.exists(tagFilePath);
  let tagRecord = await getTagRecordByBitmarkId(bitmark.id);

  if (isFileExisted && !tagRecord) {
    let tags = await readTagFile(bitmark.asset.id);
    await updateTag(bitmark.id, tags);
  }

  if (!isFileExisted && tagRecord) {
    await writeTagFile(tagFilePath, tagRecord.tags);
    iCloudSyncAdapter.uploadFileToCloud(tagFilePath, `${DataProcessor.getUserInformation().bitmarkAccountNumber}_assets_${base58.encode(new Buffer(bitmark.asset.id, 'hex'))}_${tagFileName}`);
  }
};

const initializeLocalStorage =  async () => {
  if (DataProcessor.getUserInformation() && DataProcessor.getUserInformation().bitmarkAccountNumber) {
    await FileUtil.mkdir(getUserLocalStorageFolderPath());
    await FileUtil.mkdir(getLocalAssetsFolderPath());
    await FileUtil.mkdir(getLocalThumbnailsFolderPath());
    await FileUtil.mkdir(getLocalDatabasesFolderPath());
    await FileUtil.mkdir(getLocalCachesFolderPath());
  }
};

export {
  initializeLocalStorage,
  getLocalAssetsFolderPath,
  getLocalThumbnailsFolderPath,
  getLocalDatabasesFolderPath,
  getLocalCachesFolderPath,
  moveOldDataFilesToNewLocalStorageFolder,
  readTagFile,
  writeTagFile,
  readIndexedDataFile,
  writeIndexedDataFile,
  checkAndSyncIndexedDataForBitmark,
  checkAndSyncTagForBitmark
}