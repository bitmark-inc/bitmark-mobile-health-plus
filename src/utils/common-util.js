import { FileUtil } from "./index";
import { AppProcessor, DataProcessor } from "../processors";
import { Alert } from "react-native";
import { EventEmitterService } from "../services";
import RNTextDetector from "../models/adapters/react-native-text-detector";
import DeviceInfo from "react-native-device-info/deviceinfo";
import i18n from "i18n-js";
import { intersection } from "lodash";
import { runPromiseWithoutError } from "./helper";

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
  const notContainsSepecicalCharacter = (str) => {
    const blacklistCharacters = '1234567890\'!|"#$%&/\\()={}[]+*-_:;<>‘.,`~¥§'.split('');
    let strCharactors = str.split('').filter(item => item !== ' ');

    return intersection(blacklistCharacters, strCharactors).length == 0;
  };

  return visionResp.filter(item => {
    let text = item.text.trim();
    return text.trim() && text.length > 3 && notContainsSepecicalCharacter(text);
  })
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
  AppProcessor.doCheckFileToIssue(filePath).then(({ asset }) => {
    if (asset && asset.name) {

      let message = asset.registrant === DataProcessor.getUserInformation().bitmarkAccountNumber
        ? i18n.t('CaptureAssetComponent_alertMessage11', { type })
        : i18n.t('CaptureAssetComponent_alertMessage12', { type });


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
    EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
  });
};

const populateAssetNameFromImage = async (filePath, defaultAssetName) => {

  let assetName = defaultAssetName;

  filePath = 'file://' + filePath;
  let visionResp = await runPromiseWithoutError(RNTextDetector.detectFromUri({
    imagePath: filePath,
    language: getLanguageForTextDetector()
  }));

  if (visionResp && !visionResp.error && visionResp.length) {
    let potentialAssetNameItem;
    let demension = calculateDocDimension(visionResp);
    let centerTextX = demension.centerTextX;

    visionResp = sanitizeTextDetectorResponse(visionResp);

    if (visionResp.length > 1) {
      // RULE 1: Choose top 5 items have highest score for next RULES
      let visionRespInOrder = visionResp.sort((item1, item2) => {
        let centerAwayScore1 = Math.abs((item1.bounding.left + item1.bounding.left + item1.bounding.width) / 2 - centerTextX);
        let centerAwayScore2 = Math.abs((item2.bounding.left + item2.bounding.left + item2.bounding.width) / 2 - centerTextX);

        let topAwayScore1 = item1.bounding.top;
        let topAwayScore2 = item2.bounding.top;

        let sizeScore1 = item1.bounding.height * item1.bounding.width / item1.text.length;
        let sizeScore2 = item2.bounding.height * item2.bounding.width / item2.text.length;

        // Sort items in descending order by size/(top * center)
        let sortScore1 = sizeScore1 / (topAwayScore1 * centerAwayScore1);
        let sortScore2 = sizeScore2 / (topAwayScore2 * centerAwayScore2);

        return sortScore2 - sortScore1;
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

    if (potentialAssetNameItem && potentialAssetNameItem.text.trim()) {
      assetName = 'HA_' + potentialAssetNameItem.text.trim();
    }
  }

  console.log('assetName:', assetName);
  return assetName;
};

export { issue, populateAssetNameFromImage }