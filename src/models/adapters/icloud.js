import { NativeModules } from 'react-native';

const iCloudSyncNative = NativeModules.iCloudSync;

const iCloudSyncAdapter = {
  syncCloudFile: (folderPath) => {
    return new Promise((resolve) => {
      iCloudSyncNative.syncCloudFile(folderPath, (ok) => {
        console.log('I cloud sync result:', ok);
      });
      resolve();
    });
  },
};

export default iCloudSyncAdapter;
