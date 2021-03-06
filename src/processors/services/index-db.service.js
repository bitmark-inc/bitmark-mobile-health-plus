import moment from 'moment';
import { uniq } from 'lodash';
import { CacheData } from '../caches';
import { IndexedDBModel, CommonModel } from '../models';
import { FileUtil } from "src/utils";

const initializeIndexedDB = async () => {
  await IndexedDBModel.connectDB(CacheData.userInformation.bitmarkAccountNumber);
  await IndexedDBModel.createIndexedDataTable();
  await IndexedDBModel.createTagsTable();
  await IndexedDBModel.createNoteTable();
  await IndexedDBModel.createNameTable();
};

// INDEX DATA
const insertDetectedDataToIndexedDB = async (bitmarkId, assetName, metadata, detectedTexts) => {
  let accountNumber = CacheData.userInformation.bitmarkAccountNumber;
  let metadataStr = '';

  if (metadata instanceof Array) {
    metadataStr = metadata.map((metadata) => {
      return (metadata.label == 'Saved Time' || metadata.label == 'Collection Date') ? `${metadata.label} ${moment(metadata.value).format('YYYY MMM DD')}` : `${metadata.label} ${metadata.value}`;
    }).join(' ');
  } else if (metadata instanceof Object) {
    let metadataList = [];
    for (let key in metadata) {
      let searchableData = (key == 'Saved Time' || key == 'Collection Date') ? `${key} ${moment(metadata[key]).format('YYYY MMM DD')}` : `${key} ${metadata[key]}`;
      metadataList.push(searchableData);
    }

    metadataStr = metadataList.join(' ');
  }
  await IndexedDBModel.insertIndexedData(accountNumber, bitmarkId, assetName, metadataStr, detectedTexts);
};

const insertHealthDataToIndexedDB = async (bitmarkId, healthData) => {
  let accountNumber = CacheData.userInformation.bitmarkAccountNumber;
  let metadataList = [];
  for (let key in healthData.assetMetadata) {
    let searchableData = (key == 'Saved Time' || key == 'Collection Date') ? `${key} ${moment(healthData.assetMetadata[key]).format('YYYY MMM DD')}` : `${key} ${healthData.assetMetadata[key]}`;
    metadataList.push(searchableData);
  }

  let metadataStr = metadataList.join(' ');

  // Strip json string to searchable text
  // Ex: {'Source":"HealthKit","Saved Time":"2018-01-01"} -> Source HealthKit Saved Time 2018-01-01
  let healthDataStr = healthData.data.replace(/{/g, "").replace(/}/g, "").replace(/"/g, "").replace(/:/g, " ").replace(/,/g, " ");

  await IndexedDBModel.insertIndexedData(accountNumber, bitmarkId, healthData.assetName, metadataStr, healthDataStr);
};

const searchIndexedBitmarks = async (searchTerm) => {
  let accountNumber = CacheData.userInformation.bitmarkAccountNumber;

  searchTerm = CommonModel.removeVietnameseSigns(searchTerm);

  // Modify original search term for fulltext search
  // Ex: "hello world" -> "hello* world*
  let searchTermParts = [];
  searchTerm.split(' ').forEach(item => {
    if (item) searchTermParts.push(`${item}*`);
  });
  searchTerm = `${searchTermParts.join(' ')}`;

  let indexedRecords = (await IndexedDBModel.queryIndexedData(accountNumber, searchTerm)) || [];
  let tagRecords = (await IndexedDBModel.queryTags(accountNumber, searchTerm)) || [];
  let noteRecords = (await IndexedDBModel.queryNote(accountNumber, searchTerm)) || [];
  let nameRecords = (await IndexedDBModel.queryName(accountNumber, searchTerm)) || [];
  let records = indexedRecords.concat(tagRecords).concat(noteRecords).concat(nameRecords);

  return { bitmarkIds: uniq(records.map(record => record.bitmarkId)), tagRecords };
};

const getIndexedDataByBitmarkId = async (bitmarkId) => {
  let records = (await IndexedDBModel.queryIndexedDataByBitmarkId(bitmarkId)) || [];
  return records[0];
};

const deleteIndexedDataByBitmarkId = async (bitmarkId) => {
  await IndexedDBModel.deleteIndexedDataByBitmarkId(bitmarkId);
};

// TAGS
const getTagsByBitmarkId = async (bitmarkId) => {
  let tags = [];
  let records = (await IndexedDBModel.queryTagsByBitmarkId(bitmarkId)) || [];

  if (records.length && records[0].tags) {
    let tagsStr = records[0].tags;
    tags = tagsStr.split(' ');
  }

  return tags;
};

const getTagRecordByBitmarkId = async (bitmarkId) => {
  let records = (await IndexedDBModel.queryTagsByBitmarkId(bitmarkId)) || [];
  return records[0];
};

const updateTag = async (bitmarkId, tags) => {
  let records = (await IndexedDBModel.queryTagsByBitmarkId(bitmarkId)) || [];
  if (records.length) {
    await IndexedDBModel.updateTag(bitmarkId, tags.join(' '));
  } else {
    let accountNumber = CacheData.userInformation.bitmarkAccountNumber;
    await IndexedDBModel.insertTag(accountNumber, bitmarkId, tags.join(' '));
  }
};

const deleteTagsByBitmarkId = async (bitmarkId) => {
  await IndexedDBModel.deleteTagsByBitmarkId(bitmarkId);
};

// NOTE
const getNoteByBitmarkId = async (bitmarkId) => {
  let records = (await IndexedDBModel.queryNoteByBitmarkId(bitmarkId)) || [];
  return (records.length && records[0].note) || '';
};

const updateNote = async (bitmarkId, note) => {
  let records = (await IndexedDBModel.queryNoteByBitmarkId(bitmarkId)) || [];
  if (records.length) {
    await IndexedDBModel.updateNote(bitmarkId, note);
  } else {
    let accountNumber = CacheData.userInformation.bitmarkAccountNumber;
    await IndexedDBModel.insertNote(accountNumber, bitmarkId, note);
  }
};

const deleteNoteByBitmarkId = async (bitmarkId) => {
  await IndexedDBModel.deleteNoteByBitmarkId(bitmarkId);
};

// NAME
const getNameByBitmarkId = async (bitmarkId) => {
  let records = (await IndexedDBModel.queryNameByBitmarkId(bitmarkId)) || [];
  return (records.length && records[0].name) || '';
};

const updateName = async (bitmarkId, name) => {
  let records = (await IndexedDBModel.queryNameByBitmarkId(bitmarkId)) || [];
  if (records.length) {
    await IndexedDBModel.updateName(bitmarkId, name);
  } else {
    let accountNumber = CacheData.userInformation.bitmarkAccountNumber;
    await IndexedDBModel.insertName(accountNumber, bitmarkId, name);
  }
};

const deleteNameByBitmarkId = async (bitmarkId) => {
  await IndexedDBModel.deleteNameByBitmarkId(bitmarkId);
};

// MIGRATE
const upgradeDataFrom24Words = async (twentyFourWordsAccountNumber, twelveWordsAccountNumber) => {
  // Copy old database new one
  let oldDBFilePath = IndexedDBModel.getDBFilePath(twentyFourWordsAccountNumber);
  let newDBFilePath = IndexedDBModel.getDBFilePath(twelveWordsAccountNumber);
  let newDBFolderPath = IndexedDBModel.getDBFolderPath(twelveWordsAccountNumber);
  let existing = await FileUtil.exists(oldDBFilePath);

  if (existing) {
    await FileUtil.mkdir(newDBFolderPath);
    await FileUtil.copyFile(oldDBFilePath, newDBFilePath);
    await IndexedDBModel.connectDB(twelveWordsAccountNumber);

    await Promise.all([
      IndexedDBModel.updateIndexedDataAccountNumber(twentyFourWordsAccountNumber, twelveWordsAccountNumber),
      IndexedDBModel.updateTagAccountNumber(twentyFourWordsAccountNumber, twelveWordsAccountNumber),
    ]);
  }
};

let IndexDBService = {
  initializeIndexedDB,

  // Index data
  insertDetectedDataToIndexedDB,
  insertHealthDataToIndexedDB,
  deleteIndexedDataByBitmarkId,
  searchIndexedBitmarks,
  getIndexedDataByBitmarkId,

  // Tags
  getTagsByBitmarkId,
  getTagRecordByBitmarkId,
  updateTag,
  deleteTagsByBitmarkId,

  // Note
  getNoteByBitmarkId,
  updateNote,
  deleteNoteByBitmarkId,

  // Name
  getNameByBitmarkId,
  updateName,
  deleteNameByBitmarkId,

  // Migration
  upgradeDataFrom24Words
};
export { IndexDBService };