import RNFS from 'react-native-fs';
import { zip, unzip } from 'react-native-zip-archive';

const FileUtil = {
  CacheDirectory: RNFS.CachesDirectoryPath,
  DocumentDirectory: RNFS.DocumentDirectoryPath,
  mkdir: async (folderPath) => {
    return RNFS.mkdir(folderPath, {
      NSURLIsExcludedFromBackupKey: true,
    });
  },
  create: async (filePath, data, encode) => {
    return RNFS.writeFile(filePath, data || '', encode || 'utf8');
  },
  remove: async (path) => {
    return RNFS.unlink(path);
  },
  removeSafe: async (path) => {
    try {
      await RNFS.unlink(path);
    } catch (err) {
      console.log("File isn't existing");
    }
  },
  copyFile: async (sourcePath, destinationPath) => {
    return RNFS.copyFile(sourcePath, destinationPath);
  },
  moveFile: async (sourcePath, destinationPath) => {
    return RNFS.moveFile(sourcePath, destinationPath);
  },
  moveFileSafe: async (sourcePath, destinationPath) => {
    try {
      await RNFS.unlink(destinationPath);
    } catch (err) {
      console.log("Destination path isn't existing");
    }
    return RNFS.moveFile(sourcePath, destinationPath);
  },
  downloadFile: async (urlDownload, filePath, headers) => {
    const options = {
      fromUrl: urlDownload,
      toFile: filePath,
      headers,
    };
    return await RNFS.downloadFile(options).promise;
  },

  zip: async (inputPath, outputPath) => {
    return zip(inputPath, outputPath);
  },
  unzip: async (inputPath, outputPath) => {
    return unzip(inputPath, outputPath);
  },

  exists: async (filePath) => {
    return RNFS.exists(filePath);
  }
};
export { FileUtil };