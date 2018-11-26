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

const readIndexedDataFile = async (indexedDataFilePath) => {
  let indexedData;
  if (await FileUtil.exists(indexedDataFilePath)) {
    indexedData = await FileUtil.readFile(indexedDataFilePath, 'utf8');
  }
  return indexedData;
};

const writeIndexedDataFile = async (indexedDataFilePath, indexedData) => {
  await FileUtil.writeFile(indexedDataFilePath, indexedData, 'utf8');
};

const readTagFile = async (tagFilePath) => {
  let tags = [];
  if (await FileUtil.exists(tagFilePath)) {
    let tagsStr = await FileUtil.readFile(tagFilePath, 'utf8');
    tags = tagsStr.split(' ');
  }
  return tags;
};

const writeTagFile = async (tagFilePath, tags) => {
  await FileUtil.writeFile(tagFilePath, tags.join(' '), 'utf8');
};

const doCheckAndSyncDataWithICloud = async (bitmark) => {
  // upload to iCloud
  if (bitmark.asset && !bitmark.asset.iCloudSynced && bitmark.asset.filePath) {
    let bitmarkAccountNumber = DataProcessor.getUserInformation().bitmarkAccountNumber;
    //sync files
    let assetFilename = bitmark.asset.filePath.substring(bitmark.asset.filePath.lastIndexOf('/') + 1, bitmark.asset.filePath.length);
    iCloudSyncAdapter.uploadFileToCloud(bitmark.asset.filePath, `${bitmarkAccountNumber}_assets_${base58.encode(new Buffer(bitmark.asset.id, 'hex'))}_${assetFilename}`);

    //sync thumbnail
    if (bitmark.thumbnail && bitmark.thumbnail.path && !(await FileUtil.exists(bitmark.thumbnail.path))) {
      let filename = bitmark.thumbnail.path.substring(bitmark.thumbnail.path.lastIndexOf('/') + 1, bitmark.thumbnail.path.length);
      await iCloudSyncAdapter.uploadFileToCloud(bitmark.thumbnail.path, `${bitmarkAccountNumber}_thumbnails_${filename}`);
    }

    //sync index asset
    let indexedFileName = `${bitmark.asset.id}.txt`;
    let indexedDataFilePath = `${getUserLocalStorageFolderPath()}/indexedData/${indexedFileName}`;
    let existFileIndexedData = await FileUtil.exists(indexedDataFilePath);
    let indexedDataRecord = await getIndexedDataByBitmarkId(bitmark.id);
    if (existFileIndexedData && !indexedDataRecord) {
      let indexedData = await readIndexedDataFile(indexedDataFilePath);
      await insertDetectedDataToIndexedDB(bitmark.id, bitmark.asset.name, bitmark.asset.metadata, indexedData);
    }
    if (!existFileIndexedData && indexedDataRecord) {
      await FileUtil.mkdir(`${getUserLocalStorageFolderPath()}/indexedData`);
      await writeIndexedDataFile(indexedDataFilePath, indexedDataRecord.content);
      iCloudSyncAdapter.uploadFileToCloud(indexedDataFilePath, `${DataProcessor.getUserInformation().bitmarkAccountNumber}_indexedData_${indexedFileName}`);
    }
    //sync index tags
    let tagFileName = `${bitmark.id}.txt`;
    let tagFilePath = `${getUserLocalStorageFolderPath()}/indexTag/${tagFileName}`;
    let existFileIndexedTags = await FileUtil.exists(tagFilePath);
    let tagRecord = await getTagRecordByBitmarkId(bitmark.id);

    if (existFileIndexedTags && !tagRecord) {
      let tags = await readTagFile(tagFilePath);
      await updateTag(bitmark.id, tags);
    }

    if (!existFileIndexedTags && tagRecord) {
      await FileUtil.mkdir(`${getUserLocalStorageFolderPath()}/indexTag`);
      await writeTagFile(tagFilePath, tagRecord.tags);
      iCloudSyncAdapter.uploadFileToCloud(tagFilePath, `${DataProcessor.getUserInformation().bitmarkAccountNumber}_indexTag_${tagFileName}`);
    }
    bitmark.asset.iCloudSynced = true;
  }
};

const doUpdateIndexTag = async (bitmarkId) => {
  //sync index tags
  let tagFileName = `${bitmarkId}.txt`;
  let tagFilePath = `${getUserLocalStorageFolderPath()}/indexTag/${tagFileName}`;
  let existFileIndexedTags = await FileUtil.exists(tagFilePath);
  if (existFileIndexedTags) {
    let tags = await readTagFile(tagFilePath);
    await updateTag(bitmarkId, tags);
  }
};

const initializeLocalStorage = async () => {
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

  doCheckAndSyncDataWithICloud,
  doUpdateIndexTag
}