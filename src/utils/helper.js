import { } from 'react-native';
import { Dimensions, Alert, Image } from 'react-native';
import { FileUtil } from './file-util';
let currentSize = Dimensions.get('window');
let widthDesign = 375;

const convertWidth = (width) => {
  return width * currentSize.width / widthDesign;
};


const runPromiseWithoutError = (promise) => {
  return new Promise((resolve) => {
    promise.then(resolve).catch(error => {
      console.log('runPromiseWithoutError :', error);
      resolve({ error })
    });
  });
};

const compareVersion = (version1, version2, length) => {
  if (version1 === null) {
    return -1;
  }
  if (version2 === null) {
    return 1;
  }
  let versionParts1 = version1.split('.');
  let versionParts2 = version2.split('.');
  length = length || versionParts1.length;
  for (let index = 0; index < length; index++) {
    let versionPart1 = +versionParts1[index];
    let versionPart2 = +versionParts2[index];
    if (versionPart1 !== versionPart2) {
      return versionPart1 < versionPart2 ? -1 : 1;
    }
  }
  return 0;
};

const isImageFile = (filePath) => {
  if (!filePath) {
    return false;
  }
  const imageExtensions = ['PNG', 'JPG', 'JPEG', 'HEIC', 'TIFF', 'BMP', 'HEIF', 'IMG'];
  let fileExtension = filePath.substring(filePath.lastIndexOf('.') + 1);

  return imageExtensions.includes(fileExtension.toUpperCase());
};

const isJPGFile = (filePath) => {
  if (!filePath) {
    return false;
  }
  const imageExtensions = ['JPG'];
  let fileExtension = filePath.substring(filePath.lastIndexOf('.') + 1);

  return imageExtensions.includes(fileExtension.toUpperCase());
};

const isPdfFile = (filePath) => {
  if (!filePath) {
    return false;
  }
  const pdfExtensions = ['PDF'];
  let fileExtension = filePath.substring(filePath.lastIndexOf('.') + 1);

  return pdfExtensions.includes(fileExtension.toUpperCase());
};

const isFileRecord = (asset) => {
  return asset && asset.metadata && asset.metadata.Source === 'Medical Records' && asset.metadata['Saved Time'];
};
const isCaptureDataRecord = (asset) => {
  return asset && asset.name.startsWith('HA') && asset.metadata && asset.metadata.Source === 'Health Records' && asset.metadata['Saved Time'];
};
const isHealthDataRecord = (asset) => {
  if (asset && asset.metadata && asset.metadata.Source === 'HealthKit' && asset.metadata['Saved Time']) {
    var regResults = /HK((\d)*)/.exec(asset.name);
    if (regResults && regResults.length > 1) {
      let randomNumber = regResults[1];
      return ((randomNumber.length == 8) && ('HK' + randomNumber) === asset.name);
    }
  }
  return false;
};
const isAssetDataRecord = (asset) => {
  return isCaptureDataRecord(asset) || isFileRecord(asset);
};

const getImageSize = async (imageFilePath) => {
  return new Promise((resolve) => {
    Image.getSize(imageFilePath, (width, height) => {
      resolve({ width, height })
    });
  })
};

const asyncAlert = (title, message) => {
  return new Promise((resolve) => {
    Alert.alert(title, message, [{ text: 'OK', onPress: resolve }]);
  });
};

const getUserLocalStorageFolderPath = (bitmarkAccountNumber) => {
  return `${FileUtil.DocumentDirectory}/${bitmarkAccountNumber}`;
};

const getLocalAssetsFolderPath = (bitmarkAccountNumber) => {
  return `${getUserLocalStorageFolderPath(bitmarkAccountNumber)}/assets`;
};

const getLocalThumbnailsFolderPath = (bitmarkAccountNumber) => {
  return `${getUserLocalStorageFolderPath(bitmarkAccountNumber)}/thumbnails`;
};

const getLocalDatabasesFolderPath = (bitmarkAccountNumber) => {
  return `${getUserLocalStorageFolderPath(bitmarkAccountNumber)}/databases`;
};

const getLocalCachesFolderPath = (bitmarkAccountNumber) => {
  return `${getUserLocalStorageFolderPath(bitmarkAccountNumber)}/caches`;
};

export {
  convertWidth,
  runPromiseWithoutError,
  compareVersion,
  isImageFile,
  isPdfFile,
  isFileRecord,
  isCaptureDataRecord,
  isHealthDataRecord,
  isAssetDataRecord,
  isJPGFile,
  getImageSize,
  asyncAlert,

  getLocalAssetsFolderPath,
  getLocalThumbnailsFolderPath,
  getLocalDatabasesFolderPath,
  getLocalCachesFolderPath,
};