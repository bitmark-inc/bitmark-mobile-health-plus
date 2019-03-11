import { } from 'react-native';
import { Dimensions, Alert, Image } from 'react-native';
import moment from "moment";
let currentSize = Dimensions.get('window');
let widthDesign = 375;

const convertWidth = (width) => {
  return width * currentSize.width / widthDesign;
};

const runPromiseIgnoreError = (promise) => {
  return new Promise((resolve) => {
    promise.then(resolve).catch(error => {
      console.log('runPromiseIgnoreError :', error);
      resolve();
    });
  });
};

const runPromiseWithoutError = (promise) => {
  return new Promise((resolve) => {
    promise.then(resolve).catch(error => {
      console.log('runPromiseWithoutError :', error);
      resolve({ error });
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

const isHealthDataRecord = (asset) => {
  return asset && asset.metadata && asset.metadata.Source === 'HealthKit' && asset.metadata['Saved Time'] &&
    (asset.name.startsWith('HD') || asset.name.startsWith('HK'));
};
const isDailyHealthDataRecord = (asset) => {
  return asset && asset.metadata && asset.metadata.Type === 'Health' && asset.metadata.Source === 'HealthKit' && asset.metadata['Collection Date'] && asset.metadata.Period === 'Daily';
};
const isFileRecord = (asset) => {
  return asset && asset.metadata && asset.metadata.Source === 'Medical Records' && asset.metadata['Saved Time'] &&
    (asset.name.startsWith('HR') || asset.name.startsWith('HA'));
};
const isCaptureDataRecord = (asset) => {
  return asset && asset.metadata && asset.metadata.Source === 'Health Records' && asset.metadata['Saved Time'] &&
    (asset.name.startsWith('HR') || asset.name.startsWith('HA'));
};
const isOldMedicalRecord = (asset) => {
  return isCaptureDataRecord(asset) || isFileRecord(asset);
};
const isNewMedicalRecord = (asset) => {
  return asset && asset.metadata && asset.metadata.Type === 'Health' && asset.metadata.Source === 'Medical Records' && asset.metadata['Collection Date'];
};
const isMedicalRecord = (asset) => {
  return isOldMedicalRecord(asset) || isNewMedicalRecord(asset);
};
const isEMRRecord = (asset) => {
  return asset && asset.metadata && asset.metadata.type === 'HEALTH-EMR' && asset.name.startsWith('EMR');
};

const bitmarkSortFunction = (a, b) => {
  if (a.addedOn && !b.addedOn) {
    return 1;
  } else if (b.addedOn && !a.addedOn) {
    return -1;
  } else if (!a.addedOn && !b.addedOn) {
    return 0;
  }

  return moment(b.addedOn).toDate().getTime() - moment(a.addedOn).toDate().getTime();
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

const delay = (ts) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ts);
  });
};


const humanFileSize = (bytes) => {
  let thresh = 1024;
  // if (Math.abs(bytes) < thresh) {
  //   return bytes + ' B';
  // }
  let units = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + ' ' + units[u];
};

const numberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const percentToDegree = (percent) => {
  return Math.round(percent / 100 * 360);
};

export {
  convertWidth,
  runPromiseIgnoreError,
  runPromiseWithoutError,
  compareVersion,
  isImageFile,
  isPdfFile,
  isHealthDataRecord,
  isDailyHealthDataRecord,
  isMedicalRecord,
  isEMRRecord,
  bitmarkSortFunction,
  isJPGFile,
  getImageSize,
  asyncAlert,
  humanFileSize,
  numberWithCommas,
  percentToDegree,
  delay,
};