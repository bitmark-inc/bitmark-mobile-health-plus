import { Alert } from 'react-native';
import { AppProcessor, DataProcessor, EventEmitterService } from "src/processors";
import { FileUtil } from 'src/utils';

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
export {
  issue,
};