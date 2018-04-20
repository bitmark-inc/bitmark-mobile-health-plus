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
  copyFile: async (sourcePath, destinationPath) => {
    return RNFS.copyFile(sourcePath, destinationPath);
  },
  moveFile: async (sourcePath, destinationPath) => {
    return RNFS.moveFile(sourcePath, destinationPath);
  },
  downloadFile: async (urlDownload, filePath, headers) => {
    const options = {
      fromUrl: urlDownload,
      toFile: filePath,
      headers,
    };
    await RNFS.downloadFile(options).promise;
    return filePath;
  },

  zip: async (inputPath, outputPath) => {
    console.log('zip :', inputPath, outputPath);
    return zip(inputPath, outputPath);
  },
  unzip: async (inputPath, outputPath) => {
    return unzip(inputPath, outputPath);
  },

};
export { FileUtil };