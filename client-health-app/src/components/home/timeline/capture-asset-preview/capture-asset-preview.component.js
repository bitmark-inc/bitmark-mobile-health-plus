import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, Alert
} from 'react-native';

import { NavigationActions } from 'react-navigation';
import style from './capture-asset-preview.component.style';
import { BitmarkComponent } from "../../../../commons/components/";
import defaultStyle from "../../../../commons/styles";
import { AppProcessor, DataProcessor } from "../../../../processors";
import { EventEmitterService } from "../../../../services";
import { FileUtil } from "../../../../utils";
import { CommonModel } from '../../../../models';


export class CaptureAssetPreviewComponent extends React.Component {
  constructor(props) {
    super(props);
    let filePath = this.props.navigation.state.params.filePath;
    let timestamp = this.props.navigation.state.params.timestamp;
    this.state = { filePath, timestamp };
  }

  componentDidMount() {

  }

  checkAndIssueAsset() {
    let filePath = this.state.filePath;
    AppProcessor.doCheckFileToIssue(filePath).then(asset => {
      let existingAsset = !!(asset && asset.name);
      if (existingAsset) {
        Alert.alert('Error', 'This asset has registered before, please select another asset to register again.');
      } else {
        // Do issue
        let metadataList = [];
        metadataList.push({ label: 'source', value: 'Bitmark Health' });
        metadataList.push({ label: 'save_time', value: new Date(this.state.timestamp).toISOString() });
        this.issueAsset(filePath, metadataList);
      }
    }).catch(error => {
      console.log('Check file error :', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  gotoUserPage() {
    const timelinePage = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({
          routeName: 'User'
        }),
      ]
    });
    this.props.navigation.dispatch(timelinePage);
  }

  issueAsset(filePath, metadataList) {
    AppProcessor.doIssueFile(filePath, ' ', metadataList, 1, false, {
      indicator: true, title: '', message: 'Encrypting and protecting your health data...'
    }).then((data) => {
      if (data) {
        CommonModel.doTrackEvent({
          event_name: 'health_user_issued_capture_health_data',
          account_number: DataProcessor.getUserInformation() ? DataProcessor.getUserInformation().bitmarkAccountNumber : null,
        });
        // Remove temp asset file
        FileUtil.removeSafe(filePath);

        this.gotoUserPage();
      }
    }).catch(error => {
      Alert.alert('Error', 'There was a problem issuing bitmark. Please try again.');
      console.log('issue bitmark error :', error);
    });
  }

  render() {
    return (
      <BitmarkComponent
        backgroundColor='#E5E5E5'
        header={(<View style={[defaultStyle.header, { backgroundColor: '#E5E5E5' }]}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => { this.props.navigation.goBack() }}>
            <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>CAPTURE</Text>
          <TouchableOpacity style={defaultStyle.headerRight}>
          </TouchableOpacity>
        </View>)}
        content={(
          <View style={[style.body]}>
            <View style={style.previewContainer}>
              <Image style={style.previewImage} source={{ uri: 'file://' + this.state.filePath }} />
            </View>
            <TouchableOpacity style={style.bottomButton} onPress={() => this.checkAndIssueAsset()}>
              <Text style={style.buttonText}>USE IMAGE</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    );
  }
}

CaptureAssetPreviewComponent.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func,
    dispatch: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        filePath: PropTypes.string,
        timestamp: PropTypes.any,
      })
    })
  }),
  screenProps: PropTypes.shape({
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
      dispatch: PropTypes.func,
    }),
    filePath: PropTypes.string,
    timestamp: PropTypes.string
  })
};