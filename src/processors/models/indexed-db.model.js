import SQLite from 'react-native-sqlite-storage';

import { FileUtil } from 'src/utils';
import { CacheData } from "../caches";

const DB_NAME = 'bitmark_indexed_data.db';
const DB_LOCATION = 'Documents'; //Documents subdirectory - visible to iTunes and backed up by iCloud
const INDEXED_DATA_TABLE_NAME = 'IndexedData';
const TAGS_TABLE_NAME = 'UserTags';
const NOTES_TABLE_NAME = 'Notes';
const NAMES_TABLE_NAME = 'Names';

export class IndexedDBModel {
  static getDBFolderPath(bitmarkAccountNumber) {
    return `${FileUtil.DocumentDirectory}/${bitmarkAccountNumber || CacheData.userInformation.bitmarkAccountNumber}/databases/`;
  }

  static getDBFilePath(bitmarkAccountNumber) {
    return `${FileUtil.DocumentDirectory}/${bitmarkAccountNumber || CacheData.userInformation.bitmarkAccountNumber}/databases/${DB_NAME}`;
  }

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

  static closeDatabase() {
    console.log('this.db:', this.db);
    this.db && this.db.close();
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

  static async updateIndexedDataAccountNumber(oldAccountNumber, newAccountNumber) {
    let query = `UPDATE ${INDEXED_DATA_TABLE_NAME} SET accountNumber='${newAccountNumber}' WHERE accountNumber='${oldAccountNumber}'`;
    return this.executeQuery(query);
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

  static async updateTagAccountNumber(oldAccountNumber, newAccountNumber) {
    let query = `UPDATE ${TAGS_TABLE_NAME} SET accountNumber='${newAccountNumber}' WHERE accountNumber='${oldAccountNumber}'`;
    return this.executeQuery(query);
  }

  static async deleteTagsByBitmarkId(bitmarkId) {
    let query = `DELETE FROM ${TAGS_TABLE_NAME} WHERE bitmarkId = '${bitmarkId}'`;
    return this.executeQuery(query);
  }

  // NOTE
  static async createNoteTable() {
    let query = `CREATE VIRTUAL TABLE IF NOT EXISTS ${NOTES_TABLE_NAME} USING fts4(accountNumber, bitmarkId, note, tokenize=porter)`;
    return this.executeQuery(query);
  }

  static async queryNote(accountNumber, term) {
    let query = `SELECT * FROM ${NOTES_TABLE_NAME} WHERE accountNumber='${accountNumber}' AND note MATCH '${term}'`;
    return this.executeQuery(query);
  }

  static async queryNoteByBitmarkId(bitmarkId) {
    let query = `SELECT * FROM ${NOTES_TABLE_NAME} WHERE bitmarkId='${bitmarkId}'`;
    return this.executeQuery(query);
  }

  static async insertNote(accountNumber, bitmarkId, note) {
    let query = `INSERT INTO ${NOTES_TABLE_NAME} VALUES (?,?,?)`;
    return this.executeQuery(query, [accountNumber, bitmarkId, note]);
  }

  static async updateNote(bitmarkId, note) {
    let query = `UPDATE ${NOTES_TABLE_NAME} SET note='${note}' WHERE bitmarkId='${bitmarkId}'`;
    return this.executeQuery(query);
  }

  static async updateNoteAccountNumber(oldAccountNumber, newAccountNumber) {
    let query = `UPDATE ${NOTES_TABLE_NAME} SET accountNumber='${newAccountNumber}' WHERE accountNumber='${oldAccountNumber}'`;
    return this.executeQuery(query);
  }

  static async deleteNoteByBitmarkId(bitmarkId) {
    let query = `DELETE FROM ${NOTES_TABLE_NAME} WHERE bitmarkId = '${bitmarkId}'`;
    return this.executeQuery(query);
  }

  // NAME
  static async createNameTable() {
    let query = `CREATE VIRTUAL TABLE IF NOT EXISTS ${NAMES_TABLE_NAME} USING fts4(accountNumber, bitmarkId, name, tokenize=porter)`;
    return this.executeQuery(query);
  }

  static async queryName(accountNumber, term) {
    let query = `SELECT * FROM ${NAMES_TABLE_NAME} WHERE accountNumber='${accountNumber}' AND name MATCH '${term}'`;
    return this.executeQuery(query);
  }

  static async queryNameByBitmarkId(bitmarkId) {
    let query = `SELECT * FROM ${NAMES_TABLE_NAME} WHERE bitmarkId='${bitmarkId}'`;
    return this.executeQuery(query);
  }

  static async insertName(accountNumber, bitmarkId, name) {
    let query = `INSERT INTO ${NAMES_TABLE_NAME} VALUES (?,?,?)`;
    return this.executeQuery(query, [accountNumber, bitmarkId, name]);
  }

  static async updateName(bitmarkId, name) {
    let query = `UPDATE ${NAMES_TABLE_NAME} SET name='${name}' WHERE bitmarkId='${bitmarkId}'`;
    return this.executeQuery(query);
  }

  static async deleteNameByBitmarkId(bitmarkId) {
    let query = `DELETE FROM ${NAMES_TABLE_NAME} WHERE bitmarkId = '${bitmarkId}'`;
    return this.executeQuery(query);
  }
}