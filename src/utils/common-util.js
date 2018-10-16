import {FileUtil} from "./index";
import {AppProcessor, DataProcessor} from "../processors";
import {Alert} from "react-native";
import {EventEmitterService} from "../services";
import RNTextDetector from "../models/adapters/react-native-text-detector";
import DeviceInfo from "react-native-device-info/deviceinfo";
import i18n from "i18n-js";
import {intersection} from "lodash";

const convertToPascalCase = (str) => {
  return str.replace(/(\w)(\w*)/g,
    function (g0, g1, g2) {
      return g1.toUpperCase() + g2.toLowerCase();
    });
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

const sanitizeTextDetectorResponse = (visionResp) => {
  const notContainsSepecicalCharcter = (str) => {
    const blacklistCharactors = '1234567890\'!"#$%&/()={}[]+*-_:;<>‘.,`~'.split('');
    let strCharactors = str.split('').filter(item => item !== ' ');

    return intersection(blacklistCharactors, strCharactors).length == 0;
  };

  return visionResp.filter(item => {
    let text = item.text.trim();
    return text.trim() && text.length > 3 && notContainsSepecicalCharcter(text);
  })
};

const calculateDocDimension = (visionResp) => {
  let maxDocWidth = visionResp[0].bounding.left + visionResp[0].bounding.width;
  let maxDocHeight = visionResp[0].bounding.top + visionResp[0].bounding.height;

  visionResp.forEach(item => {
    if ((item.bounding.left + item.bounding.width) > maxDocWidth) maxDocWidth = item.bounding.left + item.bounding.width;
    if ((item.bounding.top + item.bounding.height) > maxDocHeight) maxDocHeight = item.bounding.top + item.bounding.height;
  });

  return {
    width: maxDocWidth,
    height: maxDocHeight
  };
};

const issue = (filePath, assetName, metadataList, type, quality, callBack) => {
  AppProcessor.doCheckFileToIssue(filePath).then(({asset}) => {
    if (asset && asset.name) {

      let message = asset.registrant === DataProcessor.getUserInformation().bitmarkAccountNumber
        ? i18n.t('CaptureAssetComponent_alertMessage11', {type})
        : i18n.t('CaptureAssetComponent_alertMessage12', {type});


      Alert.alert('', message, [{
        text: i18n.t('CaptureAssetComponent_alertButton1'), style: 'cancel'
      }]);
    } else {
      AppProcessor.doIssueFile(filePath, assetName, metadataList, quality, false, {
        indicator: true, title: i18n.t('CaptureAssetComponent_title'), message: ''
      }).then((data) => {
        if (data) {
          FileUtil.removeSafe(filePath);
          callBack();
        }
      }).catch(error => {
        Alert.alert(i18n.t('CaptureAssetComponent_alertTitle2'), i18n.t('CaptureAssetComponent_alertMessage2'));
        console.log('issue bitmark error :', error);
      });
    }
  }).catch(error => {
    console.log('Check file error :', error);
    EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {error});
  });
};

const populateAssetNameFromImage = async (filePath, defaultAssetName) => {
  EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, true);
  let assetName = defaultAssetName;
  console.log('populateAssetFromImage...');

  filePath = 'file://' + filePath;
  let visionResp = await RNTextDetector.detectFromUri({
    imagePath: filePath,
    language: getLanguageForTextDetector()
  });

  console.log('visionResp', visionResp);

  if (visionResp && visionResp.length) {
    let potentialAssetNameItem;
    let demension = calculateDocDimension(visionResp);
    let centerPointX = demension.width / 2;

    visionResp = sanitizeTextDetectorResponse(visionResp);

    const DETECTOR_SCORE = {
      CENTER: 5,
      TOP: 3,
      HEIGHT: 1,
      WIDTH: 1
    };

    if (visionResp.length > 1) {
      // RULE 1: Choose top 5 items have highest score for next RULES
      let visionRespInOrder = visionResp.sort((item1, item2) => {
        let centerScore1 = Math.abs((item1.bounding.left + item1.bounding.left + item1.bounding.width) / 2 - centerPointX) * DETECTOR_SCORE.CENTER;
        let centerScore2 = Math.abs((item2.bounding.left + item2.bounding.left + item2.bounding.width) / 2 - centerPointX) * DETECTOR_SCORE.CENTER;

        let topScore1 = item1.bounding.top * DETECTOR_SCORE.TOP;
        let topScore2 = item2.bounding.top * DETECTOR_SCORE.TOP;

        let heightScore1 = item1.bounding.height * DETECTOR_SCORE.HEIGHT;
        let heightScore2 = item2.bounding.height * DETECTOR_SCORE.HEIGHT;

        let widthScore1 = item1.bounding.width * DETECTOR_SCORE.WIDTH;
        let widthScore2 = item2.bounding.width * DETECTOR_SCORE.WIDTH;

        // Sort items in descending order by height/(width * top * center)
        return heightScore2 / (widthScore2 * topScore2 * centerScore2) - heightScore1 / (widthScore1 * topScore1 * centerScore1);
      });

      // Choose top 5 candidates for next RULES
      visionRespInOrder = visionRespInOrder.slice(0, 5);
      console.log('Top 5:', visionRespInOrder);


      // RULE 2: Choose the first item has all characters in UPPER case (ex: BITMARK MANUAL)
      // Note: This rule can not apply for Chinese or any languages which don't have capital letters
      if (!potentialAssetNameItem) {
        for (let i = 0; i < visionRespInOrder.length; i++) {
          if (visionRespInOrder[i].text && (visionRespInOrder[i].text.toUpperCase() === visionRespInOrder[i].text)) {
            potentialAssetNameItem = visionRespInOrder[i];
            break;
          }
        }
      }


      // RULE 3: Choose the first item has all words in Pascal case (ex: Bitmark Manual)
      // Note: This rule can not apply for Chinese or any languages which don't have capital letters
      if (!potentialAssetNameItem) {
        for (let i = 0; i < visionRespInOrder.length; i++) {
          if (visionRespInOrder[i].text && (convertToPascalCase(visionRespInOrder[i].text) === visionRespInOrder[i].text)) {
            potentialAssetNameItem = visionRespInOrder[i];
            break;
          }
        }
      }


      // RULE 4: Choose the first item has CAPITAL character at the beginning (ex: Bitmark manual)
      // Note: This rule can not apply for Chinese or any languages which don't have capital letters
      if (!potentialAssetNameItem) {
        for (let i = 0; i < visionRespInOrder.length; i++) {
          if (visionRespInOrder[i].text && (visionRespInOrder[i].text.charAt(0).toUpperCase() === visionRespInOrder[i].text.charAt(0))) {
            potentialAssetNameItem = visionRespInOrder[i];
            break;
          }
        }
      }


      // RULE 5: Just Choose the first item
      if (!potentialAssetNameItem) {
        potentialAssetNameItem = visionRespInOrder[0];
      }

    } else {
      potentialAssetNameItem = visionResp[0];
    }

    if (potentialAssetNameItem && potentialAssetNameItem.text) {
      assetName = 'HA_' + potentialAssetNameItem.text;
    }
  }

  console.log('assetName:', assetName);
  EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);

  return assetName;
};

export {issue, populateAssetNameFromImage}