import { NativeModules, NativeEventEmitter } from 'react-native';

const iCloudSyncNative = NativeModules.iCloudSync;
const iCloudSyncNativeEmitter = new NativeEventEmitter(iCloudSyncNative);

const iCloudSyncAdapter = {
  uploadFileToCloud: (filePath, key) => {
    console.log('uploadFileToCloud :', filePath, key);
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
    iCloudSyncNativeEmitter.addListener('oniCloudFileChanged', cbFunction);
  },
};

export default iCloudSyncAdapter;
