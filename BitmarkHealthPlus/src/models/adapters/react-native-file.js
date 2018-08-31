import RNFS from 'react-native-fs';
import ZipArchive from 'react-native-zip-archive';

const mkdir = (folderPath) => {
  return RNFS.mkdir(folderPath, {
    NSURLIsExcludedFromBackupKey: true,
  });
};

const create = (filePath, data, encode) => {
  return RNFS.writeFile(filePath, data || '', encode || 'utf8');
};

const remove = (path) => {
  return RNFS.unlink(path);
};

const moveFile = (sourcePath, destinationPath) => {
  return RNFS.moveFile(sourcePath, destinationPath);
};

const zip = (inputPath, outputPath) => {
  return ZipArchive.zip(inputPath, outputPath);
};

const unzip = (inputPath, outputPath) => {
  return ZipArchive.unzip(inputPath, outputPath);
};

let ReactNativeFile = {
  mkdir,
  create,
  remove,
  moveFile,
  zip,
  unzip,
}

export { ReactNativeFile };