import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View,
  WebView,
  Share,
} from 'react-native';
import { BitmarkComponent } from './../../../../commons/components';

import defaultStyle from './../../../../commons/styles';

import styles from './study-consent.component.style';

import { AppProcessor } from '../../../../processors';
import { EventEmitterService } from '../../../../services';
import { BitmarkOneTabButtonComponent } from '../../../../commons/components/bitmark-button';

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
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
      });
    };
    return (
      <BitmarkComponent
        header={(<View style={[defaultStyle.header]}>
          <BitmarkOneTabButtonComponent style={defaultStyle.headerLeft}></BitmarkOneTabButtonComponent>
          <Text style={defaultStyle.headerTitle}>Study Consent</Text>
          <BitmarkOneTabButtonComponent style={defaultStyle.headerRight} onPress={() => this.props.navigation.goBack()}>
            <Text style={defaultStyle.headerRightText}>Done</Text>
          </BitmarkOneTabButtonComponent>
        </View>)}
        content={(<View style={styles.body}>
          <View style={styles.main}>
            <WebView source={{ uri: this.state.study.consentLink }} />
          </View>
          <View style={styles.bottomButtonArea}>
            <BitmarkOneTabButtonComponent style={[styles.bottomButton, { backgroundColor: 'white' }]} onPress={() => downloadConsent()}>
              <Text style={[styles.infoButtonText]}>Share</Text>
            </BitmarkOneTabButtonComponent>
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