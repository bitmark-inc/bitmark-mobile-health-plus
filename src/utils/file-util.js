import RNFS from 'react-native-fs';
import { zip, unzip } from 'react-native-zip-archive';

const FileUtil = {
  CacheDirectory: RNFS.CachesDirectoryPath,
  DocumentDirectory: RNFS.DocumentDirectoryPath,
  mkdir: async (folderPath) => {
    return await RNFS.mkdir(folderPath, {
      NSURLIsExcludedFromBackupKey: true,
    });
  },
  create: async (filePath, data, encode) => {
    return await RNFS.writeFile(filePath, data || '', encode || 'utf8');
  },
  remove: async (path) => {
    return await RNFS.unlink(path);
  },
  removeSafe: async (path) => {
    try {
      await RNFS.unlink(path);
    } catch (err) {
      console.log("File isn't existing");
    }
  },
  copyFile: async (sourcePath, destinationPath) => {
    return await RNFS.copyFile(sourcePath, destinationPath);
  },
  moveFile: async (sourcePath, destinationPath) => {
    console.log('moveFile :', sourcePath, destinationPath);
    return await RNFS.moveFile(sourcePath, destinationPath);
  },
  moveFileSafe: async (sourcePath, destinationPath) => {
    console.log('moveFileSafe :', sourcePath, destinationPath);
    try {
      await RNFS.unlink(destinationPath);
    } catch (err) {
      console.log("Destination path isn't existing");
    }
    return await RNFS.moveFile(sourcePath, destinationPath);
  },
  downloadFile: async (urlDownload, filePath, headers) => {
    const options = {
      fromUrl: urlDownload,
      toFile: filePath,
      headers,
    };
    return await RNFS.downloadFile(options).promise;
  },
  readDir: async (folderPath) => {
    return await RNFS.readdir(folderPath);
  },
  readFile: async (filePath, encoding) => {
    return await RNFS.readFile(filePath, encoding);
  },
  writeFile: async (filePath, content, encoding) => {
    return await RNFS.writeFile(filePath, content, encoding);
  },

  zip: async (inputPath, outputPath) => {
    return await zip(inputPath, outputPath);
  },
  unzip: async (inputPath, outputPath) => {
    return await unzip(inputPath, outputPath);
  },
  exists: async (filePath) => {
    return await RNFS.exists(filePath);
  },
  stat: async (filePath) => {
    return await RNFS.stat(filePath);
  }
};
export { FileUtil };