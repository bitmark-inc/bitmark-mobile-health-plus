import SQLite from 'react-native-sqlite-storage';

import { FileUtil } from 'src/utils';
import { CacheData } from "../caches";

const DB_NAME = 'bitmark_indexed_data.db';
const DB_LOCATION = 'Documents'; //Documents subdirectory - visible to iTunes and backed up by iCloud
const INDEXED_DATA_TABLE_NAME = 'IndexedData';
const TAGS_TABLE_NAME = 'UserTags';

export class IndexedDBModel {
  static async connectDB(bitmarkAccountNumber) {
    let databaseFolderPath = `${FileUtil.DocumentDirectory}/${bitmarkAccountNumber || CacheData.userInformation.bitmarkAccountNumber}/databases`;
    let databaseFilePath = `${databaseFolderPath}/${DB_NAME}`;

    if (!(await FileUtil.exists(databaseFolderPath))) {
      await FileUtil.mkdir(databaseFolderPath);
    }

    // Relative path to "Documents" folder
    // Ex: /User/xxx/Documents/accountNumber/databases/bitmark_indexed_data.db -> /accountNumber/databases/bitmark_indexed_data.db
    let relativeDBFilePath = databaseFilePath.substring(databaseFilePath.indexOf(DB_LOCATION) + DB_LOCATION.length);

    this.db = SQLite.openDatabase({
      name: relativeDBFilePath,
      location: DB_LOCATION
    });
  }

  static async executeQuery(query, params = []) {
    return new Promise((resolve) => {
      this.db.transaction((tx) => {
        tx.executeSql(query, params, (tx, results) => {
          let rows = [];
          for (let i = 0; i < results.rows.length; i++) {
            let row = results.rows.item(i);
            rows.push(row);
          }

          resolve(rows);
        });
      });
    });
  }

  // INDEXED DATA
  static async createIndexedDataTable() {
    let query = `CREATE VIRTUAL TABLE IF NOT EXISTS ${INDEXED_DATA_TABLE_NAME} USING fts4(accountNumber, bitmarkId, asset_name, metadata, content, tokenize=porter)`;
    return this.executeQuery(query);
  }

  static async queryIndexedData(accountNumber, term) {
    let query = `SELECT * FROM ${INDEXED_DATA_TABLE_NAME} WHERE accountNumber='${accountNumber}' AND (asset_name MATCH '${term}' OR metadata MATCH '${term}' OR content MATCH '${term}')`;
    return this.executeQuery(query);
  }

  static async queryIndexedDataByBitmarkId(bitmarkId) {
    let query = `SELECT * FROM ${INDEXED_DATA_TABLE_NAME} WHERE bitmarkId='${bitmarkId}'`;
    return this.executeQuery(query);
  }

  static async insertIndexedData(accountNumber, bitmarkId, assetName, metadata, content) {
    let query = `INSERT INTO ${INDEXED_DATA_TABLE_NAME} VALUES (?,?,?,?,?)`;
    return this.executeQuery(query, [accountNumber, bitmarkId, assetName, metadata, content]);
  }

  static async deleteIndexedDataByBitmarkId(accountNumber, bitmarkId) {
    let query = `DELETE FROM ${INDEXED_DATA_TABLE_NAME} WHERE bitmarkId = '${bitmarkId}'`;
    return this.executeQuery(query);
  }

  // TAGS
  static async createTagsTable() {
    let query = `CREATE VIRTUAL TABLE IF NOT EXISTS ${TAGS_TABLE_NAME} USING fts4(accountNumber, bitmarkId, tags, tokenize=porter)`;
    return this.executeQuery(query);
  }

  static async queryTags(accountNumber, term) {
    let query = `SELECT * FROM ${TAGS_TABLE_NAME} WHERE accountNumber='${accountNumber}' AND tags MATCH '${term}'`;
    return this.executeQuery(query);
  }

  static async queryTagsByBitmarkId(bitmarkId) {
    let query = `SELECT * FROM ${TAGS_TABLE_NAME} WHERE bitmarkId='${bitmarkId}'`;
    return this.executeQuery(query);
  }

  static async insertTag(accountNumber, bitmarkId, tagsStr) {
    let query = `INSERT INTO ${TAGS_TABLE_NAME} VALUES (?,?,?)`;
    return this.executeQuery(query, [accountNumber, bitmarkId, tagsStr]);
  }

  static async updateTag(bitmarkId, tagsStr) {
    let query = `UPDATE ${TAGS_TABLE_NAME} SET tags='${tagsStr}' WHERE bitmarkId='${bitmarkId}'`;
    return this.executeQuery(query);
  }

  static async deleteTagsByBitmarkId(bitmarkId) {
    let query = `DELETE FROM ${TAGS_TABLE_NAME} WHERE bitmarkId = '${bitmarkId}'`;
    return this.executeQuery(query);
  }
}