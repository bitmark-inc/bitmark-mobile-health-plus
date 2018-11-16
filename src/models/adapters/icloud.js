import { NativeModules, NativeAppEventEmitter } from 'react-native';

const iCloudSyncNative = NativeModules.iCloudSync;

const iCloudSyncAdapter = {
  uploadToCloud: (folderPath) => {
    return new Promise((resolve) => {
      iCloudSyncNative.uploadToCloud(folderPath, (ok) => {
        console.log('upload to cloud result:', ok);
      });
      resolve();
    });
  },
  uploadFileToCloud: (filePath, key) => {
    return new Promise((resolve) => {
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
    NativeAppEventEmitter.addListener('oniCloudFileChanged', cbFunction);
  },
};

export default iCloudSyncAdapter;
