import { IndexedDB } from "../models";
import { DataProcessor } from "../processors/data-processor";
import moment from "moment/moment";
import { uniq } from "lodash";
import { removeVietnameseSigns } from "./common-util";

const initializeIndexedDB = async () => {
  await IndexedDB.connectDB();
  await IndexedDB.createIndexedDataTable();
  await IndexedDB.createTagsTable();
};

const insertDetectedDataToIndexedDB = async (bitmarkId, assetName, metadata, detectedTexts) => {
  let accountNumber = DataProcessor.getUserInformation().bitmarkAccountNumber;
  let metadataStr = '';

  if (metadata instanceof Array) {
    metadataStr = metadata.map((metadata) => {
      return metadata.label == 'Saved Time' ? `${metadata.label} ${moment(metadata.value).format('YYYY MMM DD')}` : `${metadata.label} ${metadata.value}`;
    }).join(' ');
  } else if (metadata instanceof Object) {
    let metadataList = [];
    for (let key in metadata) {
      let searchableData = (key == 'Saved Time') ? `${key} ${moment(metadata[key]).format('YYYY MMM DD')}` : `${key} ${metadata[key]}`;
      metadataList.push(searchableData);
    }

    metadataStr = metadataList.join(' ');
  }
  await IndexedDB.insertIndexedData(accountNumber, bitmarkId, assetName, metadataStr, detectedTexts);
};

const insertHealthDataToIndexedDB = async (bitmarkId, healthData) => {
  let accountNumber = DataProcessor.getUserInformation().bitmarkAccountNumber;
  let metadataList = [];
  for (let key in healthData.assetMetadata) {
    let searchableData = (key == 'Saved Time') ? `${key} ${moment(healthData.assetMetadata[key]).format('YYYY MMM DD')}` : `${key} ${healthData.assetMetadata[key]}`;
    metadataList.push(searchableData);
  }

  let metadataStr = metadataList.join(' ');

  // Strip json string to searchable text
  // Ex: {"Source":"HealthKit","Saved Time":"2018-01-01"} -> Source HealthKit Saved Time 2018-01-01
  let healthDataStr = healthData.data.replace(/{/g, "").replace(/}/g, "").replace(/"/g, "").replace(/:/g, " ").replace(/,/g, " ");

  await IndexedDB.insertIndexedData(accountNumber, bitmarkId, healthData.assetName, metadataStr, healthDataStr);
};

const searchIndexedBitmarks = async (searchTerm) => {
  let accountNumber = DataProcessor.getUserInformation().bitmarkAccountNumber;

  searchTerm = removeVietnameseSigns(searchTerm);

  // Modify original search term for fulltext search
  // Ex: "hello world" -> "hello* world*
  let searchTermParts = [];
  searchTerm.split(' ').forEach(item => {
    if (item) searchTermParts.push(`${item}*`);
  });
  searchTerm = `${searchTermParts.join(' ')}`;

  let indexedRecords = (await IndexedDB.queryIndexedData(accountNumber, searchTerm)) || [];
  let tagRecords = (await IndexedDB.queryTags(accountNumber, searchTerm)) || [];
  let records = indexedRecords.concat(tagRecords);

  return { bitmarkIds: uniq(records.map(record => record.bitmarkId)), tagRecords };
};

const getIndexedDataByBitmarkId = async (bitmarkId) => {
  let records = (await IndexedDB.queryIndexedDataByBitmarkId(bitmarkId)) || [];
  return records[0];
};

const checkExistIndexedDataForBitmark = async (bitmarkId) => {
  let indexedRecords = (await IndexedDB.queryIndexedDataByBitmarkId(bitmarkId)) || [];

  return indexedRecords.length > 0;
};

const deleteIndexedDataByBitmarkId = async (bitmarkId) => {
  await IndexedDB.deleteIndexedDataByBitmarkId(bitmarkId);
};

const getTagsByBitmarkId = async (bitmarkId) => {
  let tags = [];
  let records = (await IndexedDB.queryTagsByBitmarkId(bitmarkId)) || [];

  if (records.length && records[0].tags) {
    let tagsStr = records[0].tags;
    tags = tagsStr.split(' ');
  }

  return tags;
};

const getTagRecordByBitmarkId = async (bitmarkId) => {
  let records = (await IndexedDB.queryTagsByBitmarkId(bitmarkId)) || [];
  return records[0];
};

const updateTag = async (bitmarkId, tags) => {
  let records = (await IndexedDB.queryTagsByBitmarkId(bitmarkId)) || [];
  if (records.length) {
    await IndexedDB.updateTag(bitmarkId, tags.join(' '));
  } else {
    let accountNumber = DataProcessor.getUserInformation().bitmarkAccountNumber;
    await IndexedDB.insertTag(accountNumber, bitmarkId, tags.join(' '));
  }
};

const deleteTagsByBitmarkId = async (bitmarkId) => {
  await IndexedDB.deleteTagsByBitmarkId(bitmarkId);
};

export {
  initializeIndexedDB,
  insertDetectedDataToIndexedDB,
  insertHealthDataToIndexedDB,
  deleteIndexedDataByBitmarkId,
  searchIndexedBitmarks,
  getIndexedDataByBitmarkId,
  checkExistIndexedDataForBitmark,

  getTagsByBitmarkId,
  getTagRecordByBitmarkId,
  updateTag,
  deleteTagsByBitmarkId
}