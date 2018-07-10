import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity,
  WebView,
  Share,
} from 'react-native';
import { BitmarkComponent } from './../../../../commons/components';

import defaultStyle from './../../../../commons/styles';

import styles from './study-consent.component.style';

import { AppProcessor } from '../../../../processors';
import { EventEmitterService } from '../../../../services';

export class StudyConsentComponent extends React.Component {
  constructor(props) {
    super(props);
    const { navigation: { state: { params: { study } } } } = this.props;
    this.state = { study };
  }

  render() {
    const shareConsent = (filePath) => {
      Share.share({ title: this.state.study.title, message: this.state.study.title + '\n' + this.state.study.description, url: filePath });
    };
    const downloadConsent = () => {
      AppProcessor.doDownloadStudyConsent(this.state.study).then(filePath => {
        shareConsent(filePath);
      }).catch(error => {
        console.log('doDownloadStudyConsent error:', error);
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {error});
      });
    };
    return (
      <BitmarkComponent
        header={(<View style={[defaultStyle.header]}>
          <TouchableOpacity style={defaultStyle.headerLeft}></TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>Study Consent</Text>
          <TouchableOpacity style={defaultStyle.headerRight} onPress={() => this.props.navigation.goBack()}>
            <Text style={defaultStyle.headerRightText}>Done</Text>
          </TouchableOpacity>
        </View>)}
        content={(<View style={styles.body}>
          <View style={styles.main}>
            <WebView source={{ uri: this.state.study.consentLink }} />
          </View>
          <View style={styles.bottomButtonArea}>
            <TouchableOpacity style={[styles.bottomButton, { backgroundColor: 'white' }]} onPress={() => downloadConsent()}>
              <Text style={[styles.infoButtonText]}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>)}
      />
    );
  }
}

StudyConsentComponent.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func,
  })
}