import {FileUtil} from "./index";
import {AppProcessor, DataProcessor} from "../processors";
import {Alert} from "react-native";
import {EventEmitterService} from "../services";
import { Actions } from 'react-native-router-flux';


const issue = (filePath, assetName, metadataList, type, quality = 1) => {
  AppProcessor.doCheckFileToIssue(filePath).then(({asset}) => {
    if (asset && asset.name) {

      let message = asset.registrant === DataProcessor.getUserInformation().bitmarkAccountNumber
        ? `You have already registered this ${type}.`
        : `The ${type} has already issued by other account.`;
      Alert.alert('', message, [{
        text: 'OK', style: 'cancel'
      }]);
    } else {
      AppProcessor.doIssueFile(filePath, assetName, metadataList, quality, false, {
        indicator: true, title: 'Encrypting and protecting your health record...', message: ''
      }).then((data) => {
        if (data) {
          FileUtil.removeSafe(filePath);
          Actions.pop();
        }
      }).catch(error => {
        Alert.alert('Error', 'There was a problem issuing bitmark. Please try again.');
        console.log('issue bitmark error :', error);
      });
    }
  }).catch(error => {
    console.log('Check file error :', error);
    EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {error});
  });
};

export {issue}