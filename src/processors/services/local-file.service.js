import { FileUtil } from "./index";
import base58 from 'bs58';
import { CacheData } from "../caches";
import { iCloudSyncAdapter } from "../models";
import { IndexDBService } from "./index-db.service";

const getUserLocalStorageFolderPath = (bitmarkAccountNumber) => {
  return `${FileUtil.DocumentDirectory}/${bitmarkAccountNumber || CacheData.userInformation.bitmarkAccountNumber}`;
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
  let bitmarkAccountNumber = CacheData.userInformation && CacheData.userInformation.bitmarkAccountNumber;
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
  if (!bitmark) {
    return;
  }
  let bitmarkAccountNumber = CacheData.userInformation.bitmarkAccountNumber;
  if (bitmark.asset && !bitmark.asset.assetFileSyncedToICloud && bitmark.asset.filePath && (await FileUtil.exists(bitmark.asset.filePath))) {
    let assetFilename = bitmark.asset.filePath.substring(bitmark.asset.filePath.lastIndexOf('/') + 1, bitmark.asset.filePath.length);
    iCloudSyncAdapter.uploadFileToCloud(bitmark.asset.filePath, `${bitmarkAccountNumber}_assets_${base58.encode(new Buffer(bitmark.asset.id, 'hex'))}_${assetFilename}`);
    bitmark.asset.assetFileSyncedToICloud = true;
  }

  if (!bitmark.thumbnailSyncedToICloud && bitmark.thumbnail && bitmark.thumbnail.path && (await FileUtil.exists(bitmark.thumbnail.path))) {
    let filename = bitmark.thumbnail.path.substring(bitmark.thumbnail.path.lastIndexOf('/') + 1, bitmark.thumbnail.path.length);
    await iCloudSyncAdapter.uploadFileToCloud(bitmark.thumbnail.path, `${bitmarkAccountNumber}_thumbnails_${filename}`);
    bitmark.thumbnailSyncedToICloud = true;
  }

  if (bitmark.asset && (!bitmark.asset.indexDataFileSyncedToICloud || !bitmark.asset.indexDataFileSyncedFromICloud)) {
    let indexedFileName = `${bitmark.asset.id}.txt`;
    let indexedDataFilePath = `${getUserLocalStorageFolderPath()}/indexedData/${indexedFileName}`;
    let existFileIndexedData = await FileUtil.exists(indexedDataFilePath);
    let indexedDataRecord = await IndexDBService.getIndexedDataByBitmarkId(bitmark.id);
    if (existFileIndexedData && !indexedDataRecord && !bitmark.asset.indexDataFileSyncedFromICloud) {
      let indexedData = await readIndexedDataFile(indexedDataFilePath);
      await IndexDBService.insertDetectedDataToIndexedDB(bitmark.id, bitmark.asset.name, bitmark.asset.metadata, indexedData);
      bitmark.asset.indexDataFileSyncedFromICloud = true;
    } else if (indexedDataRecord) {
      bitmark.asset.indexDataFileSyncedFromICloud = true;
    }
    if (!existFileIndexedData && indexedDataRecord && !bitmark.asset.indexDataFileSyncedToICloud) {
      await FileUtil.mkdir(`${getUserLocalStorageFolderPath()}/indexedData`);
      await writeIndexedDataFile(indexedDataFilePath, indexedDataRecord.content);
      iCloudSyncAdapter.uploadFileToCloud(indexedDataFilePath, `${CacheData.userInformation.bitmarkAccountNumber}_indexedData_${indexedFileName}`);
      bitmark.asset.indexDataFileSyncedToICloud = true;
    }
  }

  if (!bitmark.indexTagFileSyncedToICloud || !bitmark.indexTagFileSyncedFromICloud) {
    let tagFileName = `${bitmark.id}.txt`;
    let tagFilePath = `${getUserLocalStorageFolderPath()}/indexTag/${tagFileName}`;
    let existFileIndexedTags = await FileUtil.exists(tagFilePath);
    let tagRecord = await IndexDBService.getTagRecordByBitmarkId(bitmark.id);

    if (existFileIndexedTags && !tagRecord && !bitmark.indexTagFileSyncedFromICloud) {
      let tags = await readTagFile(tagFilePath);
      await IndexDBService.updateTag(bitmark.id, tags);
      bitmark.indexTagFileSyncedFromICloud = true;
    }

    if (!existFileIndexedTags && tagRecord && !bitmark.indexTagFileSyncedToICloud) {
      await FileUtil.mkdir(`${getUserLocalStorageFolderPath()}/indexTag`);
      await writeTagFile(tagFilePath, tagRecord.tags);
      iCloudSyncAdapter.uploadFileToCloud(tagFilePath, `${CacheData.userInformation.bitmarkAccountNumber}_indexTag_${tagFileName}`);
      bitmark.indexTagFileSyncedToICloud = true;
    }
  }
};

const doUpdateIndexTagFromICloud = async (bitmarkId) => {
  //sync index tags
  let tagFileName = `${bitmarkId}.txt`;
  let tagFilePath = `${getUserLocalStorageFolderPath()}/indexTag/${tagFileName}`;
  let existFileIndexedTags = await FileUtil.exists(tagFilePath);
  if (existFileIndexedTags) {
    let tags = await readTagFile(tagFilePath);
    await IndexDBService.updateTag(bitmarkId, tags);
  }
};

const doUpdateIndexTagToICloud = async (bitmarkId, tags) => {
  //sync index tags
  let tagFileName = `${bitmarkId}.txt`;
  let tagFilePath = `${getUserLocalStorageFolderPath()}/indexTag/${tagFileName}`;
  if (!tags) {
    let tagRecord = await IndexDBService.getTagRecordByBitmarkId(bitmarkId);
    tags = tagRecord ? tagRecord.tags : null;
  }
  if (tags) {
    await FileUtil.mkdir(`${getUserLocalStorageFolderPath()}/indexTag`);
    await writeTagFile(tagFilePath, tags);
    iCloudSyncAdapter.uploadFileToCloud(tagFilePath, `${CacheData.userInformation.bitmarkAccountNumber}_indexTag_${tagFileName}`);
  }
};

const initializeLocalStorage = async () => {
  if (CacheData.userInformation && CacheData.userInformation.bitmarkAccountNumber) {
    await FileUtil.mkdir(getUserLocalStorageFolderPath());
    await FileUtil.mkdir(getLocalAssetsFolderPath());
    await FileUtil.mkdir(getLocalThumbnailsFolderPath());
    await FileUtil.mkdir(getLocalDatabasesFolderPath());
    await FileUtil.mkdir(getLocalCachesFolderPath());
  }
};

let LocalFileService = {
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
  doUpdateIndexTagFromICloud,
  doUpdateIndexTagToICloud,
};
export { LocalFileService };
