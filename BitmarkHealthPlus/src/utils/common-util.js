import { FileUtil } from "./index";
import { AppProcessor, DataProcessor } from "../processors";
import { Alert } from "react-native";
import { EventEmitterService } from "../services";
import { Actions } from 'react-native-router-flux';


const issue = (filePath, assetName, metadataList, type, quality = 1) => {
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
          Actions.pop();
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

export { issue }