
import base58 from 'bs58';
import { iCloudSyncAdapter } from '../models';
import { IndexDBService } from './index-db.service';
import { CacheData } from '../caches';
import { FileUtil } from 'src/utils';
import DeviceInfo from "react-native-device-info/deviceinfo";

const setShareLocalStoragePath = async () => {
  let appBundleId = DeviceInfo.getBundleId();
  try {
    if (appBundleId === 'com.bitmark.healthplus.inhouse') {
      // Dev
      FileUtil.SharedGroupDirectory = await FileUtil.pathForGroup('group.com.bitmark.localstorage.dev');
    } else if (appBundleId === 'com.bitmark.healthplus.beta') {
      // Beta
      FileUtil.SharedGroupDirectory = await FileUtil.pathForGroup('group.com.bitmark.localstorage.beta');
    } else {
      // Live
      FileUtil.SharedGroupDirectory = await FileUtil.pathForGroup('group.com.bitmark.localstorage');
    }
  } catch {
    FileUtil.SharedGroupDirectory = FileUtil.DocumentDirectory;
  }

  console.log('FileUtil.ShareGroupDirectory :', FileUtil.SharedGroupDirectory);
};

const moveFilesFromLocalStorageToSharedStorage = async () => {
  let localStorageFolderPath = `${FileUtil.DocumentDirectory}/${CacheData.userInformation.bitmarkAccountNumber}`;
  let sharedStorageFolderPath = FileUtil.getSharedLocalStorageFolderPath(CacheData.userInformation.bitmarkAccountNumber);

  if (await FileUtil.exists(localStorageFolderPath)) {
    await FileUtil.copyDir(localStorageFolderPath, sharedStorageFolderPath, true);
  }
};

const moveOldDataFilesToNewLocalStorageFolder = async () => {
  // Copy assets folder
  let localAssetsFolderPath = FileUtil.getLocalAssetsFolderPath(CacheData.userInformation.bitmarkAccountNumber);
  if (!(await FileUtil.exists(localAssetsFolderPath))) {
    let oldAssetsFolderPath = `${FileUtil.DocumentDirectory}/assets/${CacheData.userInformation.bitmarkAccountNumber}`;

    if (await FileUtil.exists(oldAssetsFolderPath)) {
      await FileUtil.copyDir(oldAssetsFolderPath, localAssetsFolderPath, true);
    }
  }

  // Copy thumbnails folder
  let thumbnailsAssetsFolderPath = FileUtil.getLocalThumbnailsFolderPath(CacheData.userInformation.bitmarkAccountNumber);
  if (!(await FileUtil.exists(thumbnailsAssetsFolderPath))) {
    await FileUtil.mkdir(`${thumbnailsAssetsFolderPath}`);
    let oldThumbnailsFolderPath = `${FileUtil.DocumentDirectory}/thumbnails/`;

    if (await FileUtil.exists(oldThumbnailsFolderPath)) {
      await FileUtil.copyDir(oldThumbnailsFolderPath, thumbnailsAssetsFolderPath, true);
    }
  }
};

const moveFilesToNewAccount = async (oldBitmarkAccountNumber, newBitmarkAccountNumber) => {
  let oldSharedStorageFolderPath = FileUtil.getSharedLocalStorageFolderPath(oldBitmarkAccountNumber);
  let newSharedStorageFolderPath = FileUtil.getSharedLocalStorageFolderPath(newBitmarkAccountNumber);

  if (await FileUtil.exists(oldSharedStorageFolderPath)) {
    await FileUtil.copyDir(oldSharedStorageFolderPath, newSharedStorageFolderPath, true);
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
  await FileUtil.writeFile(tagFilePath, tags.join ? tags.join(' ') : tags, 'utf8');
};

const readNoteFile = async (noteFilePath) => {
  let note;
  if (await FileUtil.exists(noteFilePath)) {
    note = await FileUtil.readFile(noteFilePath, 'utf8');
  }
  return note;
};

const writeNoteFile = async (noteFilePath, note) => {
  await FileUtil.writeFile(noteFilePath, note, 'utf8');
};

const doCheckAndSyncDataWithICloud = async (bitmark) => {
  // upload to iCloud
  if (!bitmark) {
    return;
  }

  // Thumbnail
  if (bitmark.asset && !bitmark.asset.assetFileSyncedToICloud && bitmark.asset.filePath && (await FileUtil.exists(bitmark.asset.filePath))) {
    let assetFilename = bitmark.asset.filePath.substring(bitmark.asset.filePath.lastIndexOf('/') + 1, bitmark.asset.filePath.length);
    iCloudSyncAdapter.uploadFileToCloud(bitmark.asset.filePath, `${CacheData.userInformation.bitmarkAccountNumber}_assets_${base58.encode(new Buffer(bitmark.asset.id, 'hex'))}_${assetFilename}`);
    bitmark.asset.assetFileSyncedToICloud = true;
  }

  if (!bitmark.thumbnailSyncedToICloud && bitmark.thumbnail && bitmark.thumbnail.path && (await FileUtil.exists(bitmark.thumbnail.path))) {
    let filename = bitmark.thumbnail.path.substring(bitmark.thumbnail.path.lastIndexOf('/') + 1, bitmark.thumbnail.path.length);
    await iCloudSyncAdapter.uploadFileToCloud(bitmark.thumbnail.path, `${CacheData.userInformation.bitmarkAccountNumber}_thumbnails_${filename}`);
    bitmark.thumbnailSyncedToICloud = true;
  }

  // Index Data
  if (bitmark.asset && (!bitmark.asset.indexDataFileSyncedToICloud || !bitmark.asset.indexDataFileSyncedFromICloud)) {
    let indexedFileName = `${bitmark.asset.id}.txt`;
    let indexedDataFilePath = `${FileUtil.getLocalIndexedDataFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${indexedFileName}`;
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
      await FileUtil.mkdir(`${FileUtil.getLocalIndexedDataFolderPath(CacheData.userInformation.bitmarkAccountNumber)}`);
      await writeIndexedDataFile(indexedDataFilePath, indexedDataRecord.content);
      iCloudSyncAdapter.uploadFileToCloud(indexedDataFilePath, `${CacheData.userInformation.bitmarkAccountNumber}_indexedData_${indexedFileName}`);
      bitmark.asset.indexDataFileSyncedToICloud = true;
    }
  }

  // Tag
  if (!bitmark.indexTagFileSyncedToICloud || !bitmark.indexTagFileSyncedFromICloud) {
    let tagFileName = `${bitmark.id}.txt`;
    let tagFilePath = `${FileUtil.getLocalIndexedTagFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${tagFileName}`;
    let existFileIndexedTags = await FileUtil.exists(tagFilePath);
    let tagRecord = await IndexDBService.getTagRecordByBitmarkId(bitmark.id);

    if (existFileIndexedTags && !tagRecord && !bitmark.indexTagFileSyncedFromICloud) {
      let tags = await readTagFile(tagFilePath);
      await IndexDBService.updateTag(bitmark.id, tags);
      bitmark.indexTagFileSyncedFromICloud = true;
    }

    if (!existFileIndexedTags && tagRecord && !bitmark.indexTagFileSyncedToICloud) {
      await FileUtil.mkdir(`${FileUtil.getLocalIndexedTagFolderPath(CacheData.userInformation.bitmarkAccountNumber)}`);
      await writeTagFile(tagFilePath, tagRecord.tags);
      iCloudSyncAdapter.uploadFileToCloud(tagFilePath, `${CacheData.userInformation.bitmarkAccountNumber}_indexTag_${tagFileName}`);
      bitmark.indexTagFileSyncedToICloud = true;
    }
  }

  // Note
  if (!bitmark.indexNoteFileSyncedToICloud || !bitmark.indexNoteFileSyncedFromICloud) {
    let noteFileName = `${bitmark.id}.txt`;
    let noteFilePath = `${FileUtil.getLocalIndexedNoteFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${noteFileName}`;
    let existFileIndexedNote = await FileUtil.exists(noteFilePath);
    let noteRecord = await IndexDBService.getNoteByBitmarkId(bitmark.id);

    if (existFileIndexedNote && !noteRecord && !bitmark.indexNoteFileSyncedFromICloud) {
      let note = await readNoteFile(noteFilePath);
      await IndexDBService.updateNote(bitmark.id, note);
      bitmark.indexNoteFileSyncedFromICloud = true;
    }

    if (!existFileIndexedNote && noteRecord && !bitmark.indexNoteFileSyncedToICloud) {
      await FileUtil.mkdir(`${FileUtil.getLocalIndexedNoteFolderPath(CacheData.userInformation.bitmarkAccountNumber)}`);
      await writeNoteFile(noteFilePath, noteRecord);
      iCloudSyncAdapter.uploadFileToCloud(noteFilePath, `${CacheData.userInformation.bitmarkAccountNumber}_indexNote_${noteFileName}`);
      bitmark.indexNoteFileSyncedToICloud = true;
    }
  }
};

const doUpdateIndexTagFromICloud = async (bitmarkId) => {
  //sync index tags
  let tagFileName = `${bitmarkId}.txt`;
  let tagFilePath = `${FileUtil.getLocalIndexedTagFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${tagFileName}`;
  let existFileIndexedTags = await FileUtil.exists(tagFilePath);
  if (existFileIndexedTags) {
    let tags = await readTagFile(tagFilePath);
    await IndexDBService.updateTag(bitmarkId, tags);
  }
};

const doUpdateIndexTagToICloud = async (bitmarkId, tags) => {
  //sync index tags
  let tagFileName = `${bitmarkId}.txt`;
  let tagFilePath = `${FileUtil.getLocalIndexedTagFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${tagFileName}`;
  if (!tags) {
    let tagRecord = await IndexDBService.getTagRecordByBitmarkId(bitmarkId);
    tags = tagRecord ? tagRecord.tags : null;
  }
  if (tags) {
    await FileUtil.mkdir(`${FileUtil.getLocalIndexedTagFolderPath(CacheData.userInformation.bitmarkAccountNumber)}`);
    await writeTagFile(tagFilePath, tags);
    iCloudSyncAdapter.uploadFileToCloud(tagFilePath, `${CacheData.userInformation.bitmarkAccountNumber}_indexTag_${tagFileName}`);
  }
};

const doUpdateIndexNoteFromICloud = async (bitmarkId) => {
  //sync index note
  let noteFileName = `${bitmarkId}.txt`;
  let noteFilePath = `${FileUtil.getLocalIndexedNoteFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${noteFileName}`;
  let existFileIndexedNote = await FileUtil.exists(noteFilePath);
  if (existFileIndexedNote) {
    let note = await readNoteFile(noteFilePath);
    await IndexDBService.updateNote(bitmarkId, note);
  }
};

const doUpdateIndexNoteToICloud = async (bitmarkId, note) => {
  //sync index note
  let noteFileName = `${bitmarkId}.txt`;
  let noteFilePath = `${FileUtil.getLocalIndexedNoteFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/${noteFileName}`;
  if (!note) {
    note = await IndexDBService.getNoteByBitmarkId(bitmarkId);
  }
  if (note) {
    await FileUtil.mkdir(`${FileUtil.getLocalIndexedNoteFolderPath(CacheData.userInformation.bitmarkAccountNumber)}`);
    await writeNoteFile(noteFilePath, note);
    iCloudSyncAdapter.uploadFileToCloud(noteFilePath, `${CacheData.userInformation.bitmarkAccountNumber}_indexNote_${noteFileName}`);
  }
};

const initializeLocalStorage = async (bitmarkAccountNumber) => {
  let accountNumber = bitmarkAccountNumber || CacheData.userInformation.bitmarkAccountNumber;
  if (accountNumber) {
    await FileUtil.mkdir(FileUtil.getSharedLocalStorageFolderPath(accountNumber));
    await FileUtil.mkdir(FileUtil.getLocalAssetsFolderPath(accountNumber));
    await FileUtil.mkdir(FileUtil.getLocalThumbnailsFolderPath(accountNumber));
    await FileUtil.mkdir(FileUtil.getLocalDatabasesFolderPath(accountNumber));
    await FileUtil.mkdir(FileUtil.getLocalCachesFolderPath(accountNumber));
    await FileUtil.mkdir(FileUtil.getLocalIndexedDataFolderPath(accountNumber));
    await FileUtil.mkdir(FileUtil.getLocalIndexedTagFolderPath(accountNumber));
    await FileUtil.mkdir(FileUtil.getLocalIndexedNoteFolderPath(accountNumber));
  }
};

const getTagsCache = async () => {
  let tagsCache = [];
  let tagsCacheFilePath = `${FileUtil.getLocalCachesFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/tags_cache.txt`;

  if (await FileUtil.exists(tagsCacheFilePath)) {
    let tagsStr = await FileUtil.readFile(tagsCacheFilePath, 'utf8');
    tagsCache = tagsStr.split(' ');
  }

  return tagsCache;
};

const writeTagsCache = async (tags) => {
  // Only store top latest 10 tags
  if (tags.length > 10) {
    tags = tags.slice(0, 10);
  }
  let tagsCacheFilePath = `${FileUtil.getLocalCachesFolderPath(CacheData.userInformation.bitmarkAccountNumber)}/tags_cache.txt`;
  await FileUtil.writeFile(tagsCacheFilePath, tags.join(' '), 'utf8');
};

let LocalFileService = {
  setShareLocalStoragePath,
  initializeLocalStorage,
  moveOldDataFilesToNewLocalStorageFolder,
  moveFilesFromLocalStorageToSharedStorage,
  moveFilesToNewAccount,

  doCheckAndSyncDataWithICloud,

  // Index Tag
  doUpdateIndexTagFromICloud,
  doUpdateIndexTagToICloud,

  // Index Note
  doUpdateIndexNoteFromICloud,
  doUpdateIndexNoteToICloud,

  // Tag Caches
  getTagsCache,
  writeTagsCache,
};
export { LocalFileService };
