import { IndexedDB } from "../models";
import { DataProcessor } from "../processors/data-processor";
import moment from "moment/moment";

const initializeIndexedDB = async () => {
  await IndexedDB.connectDB();
  await IndexedDB.createIndexedDataTable();
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

  let detectedTextsStr = (detectedTexts instanceof Array) ? detectedTexts.join(' ') : '';
  detectedTextsStr = removeVietnameseSigns(detectedTextsStr);

  await IndexedDB.insert(accountNumber, bitmarkId, assetName, metadataStr, detectedTextsStr);
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

  await IndexedDB.insert(accountNumber, bitmarkId, healthData.assetName, metadataStr, healthDataStr);
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

  let indexedRecords = (await IndexedDB.query(accountNumber, searchTerm)) || [];

  return indexedRecords.map(record => record.bitmarkId);
};

const checkExistIndexedDataForBitmark = async (bitmarkId) => {
  let indexedRecords = (await IndexedDB.queryByBitmarkId(bitmarkId)) || [];

  return indexedRecords.length > 0;
};

const removeVietnameseSigns = (str) => {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
};

export {
  initializeIndexedDB,
  insertDetectedDataToIndexedDB,
  insertHealthDataToIndexedDB,
  searchIndexedBitmarks,
  checkExistIndexedDataForBitmark
}