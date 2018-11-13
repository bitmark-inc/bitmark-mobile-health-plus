const SQLite = require('react-native-sqlite-storage');
const DB_NAME = 'bitmark_indexed_data.db';
const DB_LOCATION = 'Documents'; //Documents subdirectory - visible to iTunes and backed up by iCloud
const TABLE_NAME = 'IndexedData';

export class IndexedDB {
  static connectDB() {
    this.db = SQLite.openDatabase({ name: DB_NAME, location: DB_LOCATION });
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

  static async createIndexedDataTable() {
    let query = `CREATE VIRTUAL TABLE IF NOT EXISTS ${TABLE_NAME} USING fts4(accountNumber, bitmarkId, asset_name, metadata, content, tokenize=porter)`;
    return this.executeQuery(query);
  }

  static async query(accountNumber, term) {
    let query = `SELECT * FROM ${TABLE_NAME} WHERE accountNumber='${accountNumber}' AND (asset_name MATCH '${term}' OR metadata MATCH '${term}' OR content MATCH '${term}')`;
    console.log('query:', query);
    return this.executeQuery(query);
  }

  static async insert(accountNumber, bitmarkId, assetName, metadata, content) {
    let query = `INSERT INTO ${TABLE_NAME} VALUES (?,?,?,?,?)`;
    console.log('insert-query:', query, [accountNumber, bitmarkId, assetName, metadata, content]);
    return this.executeQuery(query, [accountNumber, bitmarkId, assetName, metadata, content]);
  }

  static async delete(accountNumber, bitmarkId) {
    let query = `DELETE FROM ${TABLE_NAME} WHERE bitmarkId = '${bitmarkId}'`;
    return this.executeQuery(query);
  }
}