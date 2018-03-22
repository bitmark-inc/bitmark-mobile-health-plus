import RNFS from 'react-native-fs';
import ZipArchive from 'react-native-zip-archive';

const FileUtil = {
  CacheDirectory: RNFS.CachesDirectoryPath + '/Bitmark',
  DocumentDirectory: RNFS.DocumentDirectoryPath + '/Bitmark/DataDonation',
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
  downloadFile: async (urlDownload, filePath) => {
    const options = {
      fromUrl: urlDownload,
      toFile: filePath,
    };
    await RNFS.downloadFile(options).promise;
    return filePath;
  },

  zip: async (inputPath, outputPath) => {
    return ZipArchive.zip(inputPath, outputPath);
  },
  unzip: async (inputPath, outputPath) => {
    return ZipArchive.unzip(inputPath, outputPath);
  },

};
export { FileUtil };