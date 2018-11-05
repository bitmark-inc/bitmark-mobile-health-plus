import { NativeModules } from 'react-native';

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

  syncCloud: () => {
    return new Promise((resolve) => {
      iCloudSyncNative.syncCloud((ok) => {
        console.log('sync with cloud result:', ok);
      });
      resolve();
    });
  },
};

export default iCloudSyncAdapter;
