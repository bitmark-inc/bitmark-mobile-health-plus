import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, WebView, ActivityIndicator,
} from 'react-native';

import styles from './ifttt-active.component.style';
import defaultStyle from './../../../../commons/styles';
import { config } from '../../../../configs';
import { AppProcessor, DataProcessor } from '../../../../processors';
import { BitmarkComponent } from '../../../../commons/components';
import { EventEmitterService } from '../../../../services';
import { convertWidth } from '../../../../utils';

let ComponentName = 'IftttActiveComponent';
export class IftttActiveComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onMessage = this.onMessage.bind(this);
    this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
    this.handerIftttInformationChange = this.handerIftttInformationChange.bind(this);

    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_IFTTT_INFORMATION, null, ComponentName);

    let stage;
    if (this.props.navigation.state && this.props.navigation.state.params) {
      stage = this.props.navigation.state.params.stage;
    }
    this.state = {
      iftttInformation: null,
      loading: true,
      processing: false,
      currentUrl: config.ifttt_invite_url,
      webViewUrl: config.ifttt_invite_url,
      stage,
    }
    let doGetScreenData = async () => {
      let iftttInformation = await DataProcessor.doGetIftttInformation();
      this.setState({ iftttInformation, gettingData: false });
    }
    doGetScreenData();
    this.signed = false;
  }

  // ==========================================================================================
  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_IFTTT_INFORMATION, this.handerIftttInformationChange, ComponentName);
  }
  // ==========================================================================================
  handerIftttInformationChange(iftttInformation) {
    this.setState({ iftttInformation });
  }

  onMessage(event) {
    let message = event.nativeEvent.data;
    if (message === 'enable-ifttt') {
      this.setState({ processing: true });
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, true);
      AppProcessor.doCreateSignatureData('Please sign to connect your IFTTT account.', true).then(data => {
        // this.setState({ processing: false });
        if (!data) {
          EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
          return;
        }
        this.signed = true;
        this.webViewRef.postMessage(JSON.stringify(data));

      }).catch(error => {
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
        this.setState({ processing: false });
        console.log('IftttActiveComponent createSignatureData error :', error);
      });
    }
  }

  onNavigationStateChange(webViewState) {
    let currentUrl = webViewState.url;
    this.setState({ currentUrl });

    if (!this.state.stage) {
      if ((currentUrl === config.ifttt_bitmark_service_url || currentUrl === (config.ifttt_bitmark_service_settings_url)) && this.signed) {
        DataProcessor.doReloadIFTTTInformation().then((iftttInformation) => {
          EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
          this.setState({ processing: false });
          if (iftttInformation.connectIFTTT && currentUrl === (config.ifttt_bitmark_service_settings_url)) {
            this.setState({
              webViewUrl: config.ifttt_bitmark_service_url,
              currentUrl: config.ifttt_bitmark_service_url,
            });
          }
        }).catch(error => {
          console.log('doReloadIFTTTInformation : ', error);
        });
      }
    } else {
      if (currentUrl === (config.ifttt_bitmark_service_settings_url) && this.signed) {
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
        this.setState({ processing: false });
      }
    }
  }

  render() {
    console.log('webViewUrl :', this.state.webViewUrl);
    return (
      <BitmarkComponent
        header={(<View style={defaultStyle.header}>
          {this.state.iftttInformation && this.state.iftttInformation.connectIFTTT && <TouchableOpacity style={[defaultStyle.headerLeft, { width: 60 }]} />}
          {!this.state.iftttInformation || !this.state.iftttInformation.connectIFTTT && <TouchableOpacity style={[defaultStyle.headerLeft, { width: 60 }]} onPress={() => {
            DataProcessor.doReloadIFTTTInformation().catch(error => {
              console.log('doReloadIFTTTInformation : ', error);
            });
            this.props.navigation.goBack();
          }}>
            <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>}
          <Text style={[defaultStyle.headerTitle, { maxWidth: convertWidth(375) - 120, }]}>REGISTER YOUR IFTTT DATA</Text>
          {(!this.state.iftttInformation || !this.state.iftttInformation.connectIFTTT) && <TouchableOpacity style={[defaultStyle.headerRight, { width: 60 }]} />}
          {this.state.iftttInformation && this.state.iftttInformation.connectIFTTT && <TouchableOpacity style={[defaultStyle.headerRight, { width: 60 }]} onPress={() => {
            this.props.navigation.goBack();
          }}>
            <Text style={defaultStyle.headerRightText}>Done</Text>
          </TouchableOpacity>}
        </View>)}

        content={(<View style={styles.main}>
          <WebView ref={(ref) => this.webViewRef = ref}
            dataDetectorTypes="none"
            source={{ uri: this.state.webViewUrl }}
            onMessage={this.onMessage}
            onNavigationStateChange={this.onNavigationStateChange}
            onLoadStart={() => this.setState({ loading: true })}
            onLoadEnd={() => {
              this.setState({ loading: false });
              let bitmarkAccountNumber = DataProcessor.getUserInformation().bitmarkAccountNumber;

              if (this.state.currentUrl.indexOf(config.ifttt_server_url) >= 0 && this.state.currentUrl.indexOf(bitmarkAccountNumber) < 0) {
                this.setState({
                  webViewUrl: this.state.currentUrl + `&bitmark_account=${bitmarkAccountNumber}`,
                  currentUrl: this.state.currentUrl + `&bitmark_account=${bitmarkAccountNumber}`,
                });
              }
              if (!this.state.stage && !this.signed &&
                (this.state.currentUrl.indexOf('https://ifttt.com/onboarding') >= 0 || this.state.currentUrl.indexOf('https://ifttt.com/discover') >= 0 || this.state.currentUrl === config.ifttt_bitmark_service_url)) {
                this.setState({
                  webViewUrl: config.ifttt_bitmark_service_settings_url + '/connect',
                  currentUrl: config.ifttt_bitmark_service_settings_url + '/connect',
                });
              }
            }}
          />
          {this.state.loading && !this.state.processing && <View style={{
            flex: 1, position: 'absolute', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            width: '100%',
            height: '100%',
            borderWidth: 1,
          }}>
            <ActivityIndicator style={{ marginTop: 20 }} size={"large"} />
          </View>}
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
        stage: PropTypes.string,
      }),
    }),
  }),
}