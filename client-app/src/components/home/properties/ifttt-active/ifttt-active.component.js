import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, WebView,
} from 'react-native';

import styles from './ifttt-active.component.style';
import defaultStyle from './../../../../commons/styles';
import { config } from '../../../../configs';
import { AppController, DataController } from '../../../../managers';
import { FullComponent } from '../../../../commons/components';

export class IftttActiveComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onMessage = this.onMessage.bind(this);
    this.state = {
      webViewURL: config.ifttt_invite_url,
    }
  }

  onMessage(event) {
    let message = event.nativeEvent.data;
    console.log('message :', message, message === 'enable-ifttt');
    if (message === 'ready') {
      this.webViewRef.postMessage(DataController.getUserInformation().bitmarkAccountNumber);
    } else if (message === 'enable-ifttt') {
      console.log('run1');
      AppController.doCreateSignatureData('Please sign to connect IFTTT data', true).then(data => {
        if (!data) {
          return;
        }
        console.log('run2, data :', data);
        this.webViewRef.postMessage(JSON.stringify(data));
      }).catch(error => {
        console.log('IftttActiveComponent createSignatureData error :', error);
      });
    }
  }

  onNavigationStateChange(webViewState) {
    let url = webViewState.url;

  }



  render() {
    return (
      <FullComponent
        header={(<View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>IFTTT DATA</Text>
          <TouchableOpacity style={defaultStyle.headerRight} />
        </View>)}

        content={(<View style={styles.main}>
          <WebView ref={(ref) => this.webViewRef = ref}
            dataDetectorTypes="none"
            source={{ uri: config.ifttt_invite_url }}
            onMessage={this.onMessage}
            onNavigationStateChange={this.onNavigationStateChange}
            onLoadEnd={() => {
              this.webViewRef.postMessage(DataController.getUserInformation().bitmarkAccountNumber);
            }}
          />
        </View>)}
      />
    );
  }
}

IftttActiveComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        refreshMarketStatus: PropTypes.func,
        market: PropTypes.string,
      }),
    }),
  }),
}