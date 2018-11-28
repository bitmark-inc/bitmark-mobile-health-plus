import { FileUtil } from "./index";
import { AppProcessor, DataProcessor } from "../processors";
import { Alert } from "react-native";
import { EventEmitterService } from "../services";
import RNTextDetector from "../models/adapters/react-native-text-detector";
import PDFScanner from "../models/adapters/pdf-scanner";
import DeviceInfo from "react-native-device-info/deviceinfo";
import i18n from "i18n-js";
import { runPromiseWithoutError } from "./helper";
import ImageResizer from 'react-native-image-resizer';
import { flatten } from 'lodash';
import { Image } from 'react-native';
import { getLocalThumbnailsFolderPath } from "./local-storage-util";

const COMBINE_FILE_SUFFIX = 'combine';

const isPascalCase = (str) => {
  let pascalCase1 = str.replace(/(\w)(\w*)/g,
    function (g0, g1, g2) {
      return g1.toUpperCase() + g2.toLowerCase();
    });

  let pascalCase2 =
    str.replace(/(\w)(\w*)/g,
      function (g0, g1, g2) {
        return g1 + g2.toLowerCase();
      });

  return pascalCase1 === pascalCase2;
};

const getLanguageForTextDetector = () => {
  let lang = 'eng';
  let locale = DeviceInfo.getDeviceLocale();

  if (locale.startsWith('vi')) {
    lang = 'vie';
  } else if (locale.startsWith('zh')) {
    if (locale == 'zh-Hans') {
      lang = 'chi_sim';
    } else {
      lang = 'chi_tra';
    }
  }

  return lang;
};

const sanitizeTextDetectorResponse = (detectedItems) => {
  // Remove special characters
  detectedItems.forEach(item => {
    if (item.text) {
      item.text = item.text.replace(/[`~!@#$%^&*()_|+\-=÷¿?;:'",.<>\{\}\[\]\\\/‘.,`~¥§˘ˆ↵˛˝”˙»]/gi, '').trim();
    }
  });

  return detectedItems.filter(item => {
    return item.text && item.text.length > 3;
  });
};

const calculateDocDimension = (visionResp) => {
  let minLeft = visionResp[0].bounding.left;
  let maxLeft = visionResp[0].bounding.left + visionResp[0].bounding.width;
  let minTop = visionResp[0].bounding.top;
  let maxTop = visionResp[0].bounding.top + visionResp[0].bounding.height;

  visionResp.forEach(item => {
    if (item.bounding.left < minLeft) minLeft = item.bounding.left;
    if ((item.bounding.left + item.bounding.width) > maxLeft) maxLeft = item.bounding.left + item.bounding.width;

    if (item.bounding.top < minTop) minTop = item.bounding.top;
    if ((item.bounding.top + item.bounding.height) > maxTop) maxTop = item.bounding.top + item.bounding.height;
  });

  return {
    width: maxLeft,
    centerTextX: (minLeft + maxLeft) / 2,
    height: maxTop,
    centerTextY: (minTop + maxTop) / 2,
  };
};

const issue = (filePath, assetName, metadataList, type, quality, callBack) => {
  if (assetName.length > 64) assetName = assetName.substring(0, 64);

  AppProcessor.doCheckFileToIssue(filePath).then(({ asset }) => {
    if (asset && asset.name && !asset.canIssue) {
      let message = asset.registrant === DataProcessor.getUserInformation().bitmarkAccountNumber
        ? i18n.t('CaptureAssetComponent_alertMessage11', { type })
        : i18n.t('CaptureAssetComponent_alertMessage12', { type });

      Alert.alert('', message, [{
        text: i18n.t('CaptureAssetComponent_alertButton1'), style: 'cancel'
      }]);
    } else {
      AppProcessor.doIssueFile(filePath, assetName, metadataList, quality, {
        indicator: true, title: i18n.t('CaptureAssetComponent_title'), message: ''
      }).then(async (data) => {
        if (data) {
          await callBack(data);
          FileUtil.removeSafe(filePath);
        }
      }).catch(error => {
        Alert.alert(i18n.t('CaptureAssetComponent_alertTitle2'), i18n.t('CaptureAssetComponent_alertMessage2'));
        console.log('issue bitmark error :', error);
      });
    }
  }).catch(error => {
    console.log('Check file error :', error);
    EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
  });
};

const detectAssetNameByCommonRules = (texts) => {
  let potentialAssetNameItem;
  // RULE 1: Choose the first item has all characters in UPPER case (ex: BITMARK MANUAL)
  // Note: This rule can not apply for Chinese or any languages which don't have capital letters
  if (!potentialAssetNameItem) {
    for (let i = 0; i < texts.length; i++) {
      if (texts[i].text && (texts[i].text.toUpperCase() === texts[i].text)) {
        potentialAssetNameItem = texts[i];
        break;
      }
    }
  }


  // RULE 2: Choose the first item has all words in Pascal case (ex: Bitmark Manual)
  // Note: This rule can not apply for Chinese or any languages which don't have capital letters
  if (!potentialAssetNameItem) {
    for (let i = 0; i < texts.length; i++) {
      if (texts[i].text && isPascalCase(texts[i].text)) {
        potentialAssetNameItem = texts[i];
        break;
      }
    }
  }


  // RULE 3: Choose the first item has CAPITAL character at the beginning (ex: Bitmark manual)
  // Note: This rule can not apply for Chinese or any languages which don't have capital letters
  if (!potentialAssetNameItem) {
    for (let i = 0; i < texts.length; i++) {
      if (texts[i].text && (texts[i].text.charAt(0).toUpperCase() === texts[i].text.charAt(0))) {
        potentialAssetNameItem = texts[i];
        break;
      }
    }
  }


  // RULE 4: Just Choose the first item
  if (!potentialAssetNameItem) {
    potentialAssetNameItem = texts[0];
  }

  return potentialAssetNameItem;
};

const populateAssetNameFromImage = async (filePath, defaultAssetName) => {
  let assetName = defaultAssetName;
  let detectFilePath = filePath;

  if (isJPGFile(filePath)) {
    // Convert JPG format to PNG format in the case of multiple selection because it can not be used for detected text from image
    let imageSize = await getImageSize(filePath);
    console.log('imageSize:', imageSize);
    let outputDir = filePath.substring(0, filePath.lastIndexOf('/'));
    let response = await ImageResizer.createResizedImage(filePath, imageSize.width, imageSize.height, 'PNG', 100, 0, outputDir);
    detectFilePath = response.uri;
  }

  if (!detectFilePath.startsWith('file://')) {
    detectFilePath = 'file://' + detectFilePath;
  }

  let visionResp = await runPromiseWithoutError(RNTextDetector.detectFromUri({
    imagePath: detectFilePath,
    language: getLanguageForTextDetector()
  }));

  // Clean up file if necessary
  if (isJPGFile(filePath)) {
    // Remove converted PNG file
    await FileUtil.removeSafe(detectFilePath);
  }

  if (visionResp && !visionResp.error && visionResp.length) {
    let potentialAssetNameItem;
    let demension = calculateDocDimension(visionResp);
    let centerTextX = demension.centerTextX;

    console.log('visionResp-Original:', visionResp);
    visionResp = sanitizeTextDetectorResponse(visionResp);
    console.log('visionResp-Sanitized:', visionResp);

    if (visionResp.length > 1) {
      // Sort items in descending order by size/(top * center)
      let visionRespInOrder = visionResp.sort((item1, item2) => {
        let centerAwayScore1 = Math.abs((item1.bounding.left + item1.bounding.left + item1.bounding.width) / 2 - centerTextX);
        let centerAwayScore2 = Math.abs((item2.bounding.left + item2.bounding.left + item2.bounding.width) / 2 - centerTextX);

        let topAwayScore1 = item1.bounding.top;
        let topAwayScore2 = item2.bounding.top;

        let sizeScore1 = item1.bounding.height * item1.bounding.width / item1.text.length;
        let sizeScore2 = item2.bounding.height * item2.bounding.width / item2.text.length;

        let sortScore1 = sizeScore1 / (topAwayScore1 * centerAwayScore1);
        let sortScore2 = sizeScore2 / (topAwayScore2 * centerAwayScore2);

        return sortScore2 - sortScore1;
      });

      // Choose top 5 candidates for next RULES
      visionRespInOrder = visionRespInOrder.slice(0, 5);
      console.log('Top 5:', visionRespInOrder);

      potentialAssetNameItem = detectAssetNameByCommonRules(visionRespInOrder);
    } else {
      potentialAssetNameItem = visionResp[0];
    }

    if (potentialAssetNameItem && potentialAssetNameItem.text.trim()) {
      assetName = 'HA ' + potentialAssetNameItem.text.trim();
    }
  }

  let detectedTexts = [];
  if (visionResp instanceof Array) {
    visionResp.forEach(item => {
      if (item.text) detectedTexts.push(item.text);
    })
  }

  let detectedTextsStr = detectedTexts.join(' ');
  detectedTextsStr = removeVietnameseSigns(detectedTextsStr);

  console.log('assetName:', assetName);
  console.log('allDetectedTexts:', detectedTexts);

  return {
    detectedTexts: detectedTextsStr,
    assetName
  };
};

const populateAssetNameFromPdf = async (filePath, defaultAssetName) => {
  let allDetectedTexts = [];
  let assetName = defaultAssetName;
  console.log('populateAssetFromPDF...');

  let detectedTexts = await runPromiseWithoutError(PDFScanner.pdfScan(filePath));
  console.log('original-DetectedTexts:', detectedTexts);

  if (detectedTexts && !detectedTexts.error && detectedTexts.length) {
    detectedTexts = detectedTexts.map(item => {
      item = item.map(text => {
        return { text: text ? text.trim() : text }
      });
      return sanitizeTextDetectorResponse(item);
    });
    console.log('detectedTexts-sanitized:', detectedTexts);

    let potentialAssetNameItem;
    // Take the first page to detect asset name
    if (detectedTexts[0].length) {
      potentialAssetNameItem = detectAssetNameByCommonRules(detectedTexts[0]);
    }

    if (potentialAssetNameItem && potentialAssetNameItem.text.trim()) {
      assetName = 'HA ' + potentialAssetNameItem.text.trim();
    }

    flatten(detectedTexts).forEach(item => {
      allDetectedTexts.push(item.text);
    });
  }

  let detectedTextsStr = allDetectedTexts.join(' ');
  detectedTextsStr = removeVietnameseSigns(detectedTextsStr);

  console.log('assetName:', assetName);
  console.log('allDetectedTexts:', allDetectedTexts);

  return {
    detectedTexts: detectedTextsStr,
    assetName
  };
};

const detectTextsFromPdf = async (filePath) => {
  let allDetectTexts = '';
  let outputFolderPath = `${FileUtil.CacheDirectory}/temp_images`;
  await FileUtil.mkdir(outputFolderPath);
  await runPromiseWithoutError(PDFScanner.pdfThumbnails(filePath, 2000, 2000, outputFolderPath));

  let imageFiles = (await FileUtil.readDir(outputFolderPath)) || [];

  for (let i = 0; i < imageFiles.length; i++) {
    let detectTexts = (await populateAssetNameFromImage(`${outputFolderPath}/${imageFiles[i]}`)).detectedTexts;
    if (detectTexts) {
      allDetectTexts = allDetectTexts.concat(detectTexts);
    }
  }

  await FileUtil.removeSafe(outputFolderPath);

  console.log('allDetectTexts:', allDetectTexts);

  return allDetectTexts;
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

const generateThumbnail = async (filePath, bitmarkId, isCombineFile = false) => {
  // Create new one if thumbnail folder is not existing
  let thumbnailsFolderPath = getLocalThumbnailsFolderPath();
  let outputFilePath = isCombineFile ? `${thumbnailsFolderPath}/${bitmarkId}_${COMBINE_FILE_SUFFIX}.PNG` : `${thumbnailsFolderPath}/${bitmarkId}.PNG`;

  const THUMBNAIL_WIDTH = 300;
  const THUMBNAIL_HEIGHT = 300;

  if (isImageFile(filePath)) {
    // Generate image thumbnail
    let response = await ImageResizer.createResizedImage(filePath, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, 'PNG', 100, 0, thumbnailsFolderPath);
    await FileUtil.moveFileSafe(response.uri, outputFilePath);

  } else if (isPdfFile(filePath)) {
    // Generate pdf thumbnail
    await runPromiseWithoutError(PDFScanner.pdfThumbnail(filePath, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, outputFilePath));
  }
  return outputFilePath;
};

const checkThumbnailForBitmark = async (bitmarkId) => {
  let thumbnailInfo = { exists: false };

  let thumbnailsFolderPath = getLocalThumbnailsFolderPath();
  let thumbnailFilePath = `${thumbnailsFolderPath}/${bitmarkId}.PNG`;
  let thumbnailMultipleFilePath = `${thumbnailsFolderPath}/${bitmarkId}_${COMBINE_FILE_SUFFIX}.PNG`;

  if ((await FileUtil.exists(thumbnailFilePath))) {
    thumbnailInfo = {
      exists: true,
      path: thumbnailFilePath
    }
  } else if ((await FileUtil.exists(thumbnailMultipleFilePath))) {
    thumbnailInfo = {
      exists: true,
      path: thumbnailMultipleFilePath,
      multiple: true
    }
  }
  return thumbnailInfo;
};

const getThumbnail = (bitmarkId, isCombineFile) => {
  let thumbnailsFolderPath = getLocalThumbnailsFolderPath();
  return isCombineFile ? `${thumbnailsFolderPath}/${bitmarkId}_${COMBINE_FILE_SUFFIX}.PNG` : `${thumbnailsFolderPath}/${bitmarkId}.PNG`;
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

const removeVietnameseSigns = (str) => {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
};

export {
  issue,
  populateAssetNameFromImage,
  populateAssetNameFromPdf,
  generateThumbnail,
  isImageFile,
  isPdfFile,
  checkThumbnailForBitmark,
  getThumbnail,
  isFileRecord,
  isCaptureDataRecord,
  isHealthDataRecord,
  isAssetDataRecord,
  isJPGFile,
  getImageSize,
  detectTextsFromPdf,
  removeVietnameseSigns
}