import { NativeModules, NativeEventEmitter } from 'react-native';

const iCloudSyncNative = NativeModules.iCloudSync;
const iCloudSyncNativeEmitter = new NativeEventEmitter(iCloudSyncNative);

const iCloudSyncAdapter = {
  deleteFileFromCloud: (key) => {
    return new Promise((resolve) => {
      iCloudSyncNative.deleteFileFromCloud(key, (ok) => {
        console.log('delete file from cloud result:', ok);
      });
      resolve();
    });
  },

  uploadFileToCloud: (filePath, key) => {
    return new Promise((resolve) => {
      key = key.replace(new RegExp(' ', 'g'), '_');
      iCloudSyncNative.uploadFileToCloud(filePath, key, (ok) => {
        console.log('upload file to cloud result:', ok);
      });
      resolve();
    });
  },

  syncCloud: () => {
    return new Promise((resolve) => {
      iCloudSyncNative.syncCloud((ok) => {
        console.log('sync with cloud result:', ok);
      });
      resolve();
    });
  },
  oniCloudFileChanged: (cbFunction) => {
    iCloudSyncNativeEmitter.addListener('oniCloudFileChanged', cbFunction);
  },
};

export default iCloudSyncAdapter;
export { iCloudSyncAdapter };
