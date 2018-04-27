import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, WebView, ActivityIndicator,
} from 'react-native';

import styles from './ifttt-active.component.style';
import defaultStyle from './../../../../commons/styles';
import { config } from '../../../../configs';
import { AppController, DataController } from '../../../../managers';
import { FullComponent } from '../../../../commons/components';
import { EventEmiterService } from '../../../../services';

export class IftttActiveComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onMessage = this.onMessage.bind(this);
    this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
    this.handerIftttInformationChange = this.handerIftttInformationChange.bind(this);
    let stage;
    if (this.props.navigation.state && this.props.navigation.state.params) {
      stage = this.props.navigation.state.params.stage;
    }
    this.state = {
      iftttInformation: DataController.getIftttInformation(),
      loading: true,
      processing: false,
      currentUrl: config.ifttt_invite_url,
      webViewUrl: config.ifttt_invite_url,
      stage,
    }
    this.signed = false;
  }

  // ==========================================================================================
  componentDidMount() {
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_IFTTT_INFORMATION, this.handerIftttInformationChange);
  }
  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_IFTTT_INFORMATION, this.handerIftttInformationChange);
  }
  // ==========================================================================================
  handerIftttInformationChange() {
    this.setState({ iftttInformation: DataController.getIftttInformation() });
  }

  onMessage(event) {
    let message = event.nativeEvent.data;
    if (message === 'enable-ifttt') {
      this.setState({ processing: true });
      AppController.doCreateSignatureData('Please sign to connect IFTTT data', true).then(data => {
        this.setState({ processing: false });
        if (!data) {
          return;
        }
        this.signed = true;
        this.webViewRef.postMessage(JSON.stringify(data));
      }).catch(error => {
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
        DataController.doReloadIFTTTInformation().then(() => {
          if (DataController.getIftttInformation().connectIFTTT && currentUrl === (config.ifttt_bitmark_service_settings_url)) {
            this.setState({
              webViewUrl: config.ifttt_bitmark_service_url,
              currentUrl: config.ifttt_bitmark_service_url,
            });
          }
        }).catch(error => {
          console.log('doReloadIFTTTInformation : ', error);
        });
      }
    }
  }

  render() {
    console.log('webViewUrl :', this.state.webViewUrl);
    return (
      <FullComponent
        header={(<View style={defaultStyle.header}>
          {this.state.iftttInformation && this.state.iftttInformation.connectIFTTT && <TouchableOpacity style={defaultStyle.headerLeft} />}
          {!this.state.iftttInformation || !this.state.iftttInformation.connectIFTTT && <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => {
            DataController.doReloadIFTTTInformation().catch(error => {
              console.log('doReloadIFTTTInformation : ', error);
            });
            this.props.navigation.goBack();
          }}>
            <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>}
          <Text style={defaultStyle.headerTitle}>IFTTT DATA</Text>
          {(!this.state.iftttInformation || !this.state.iftttInformation.connectIFTTT) && <TouchableOpacity style={defaultStyle.headerRight} />}
          {this.state.iftttInformation && this.state.iftttInformation.connectIFTTT && <TouchableOpacity style={defaultStyle.headerRight} onPress={() => {
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
              this.setState({ loading: false })
              if (this.state.currentUrl.indexOf(config.ifttt_server_url) >= 0) {
                this.webViewRef.postMessage(DataController.getUserInformation().bitmarkAccountNumber);
              }
              if (!this.state.stage && (this.state.currentUrl === 'https://ifttt.com/discover' || this.state.currentUrl === config.ifttt_bitmark_service_url) && !this.signed) {
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