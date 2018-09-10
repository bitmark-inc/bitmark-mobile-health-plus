
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  View, Text, TouchableOpacity,
  StatusBar,
  AppState,
  Linking,
  NetInfo,
  Alert,
  StyleSheet,
} from 'react-native';

import { Actions } from 'react-native-router-flux';

import KeepAwake from 'react-native-keep-awake';
import Mailer from 'react-native-mail';
import RNExitApp from 'react-native-exit-app';
import { setJSExceptionHandler, setNativeExceptionHandler } from "react-native-exception-handler";

import { LoadingComponent, BitmarkInternetOffComponent, DefaultIndicatorComponent, BitmarkIndicatorComponent, BitmarkDialogComponent, } from '../commons'
import { HomeRouterComponent } from './home';
import { UserRouterComponent, } from './user';
import { EventEmitterService } from '../services';
import { UserModel, CommonModel } from '../models';
import { FileUtil, convertWidth } from '../utils';
import { DataProcessor, AppProcessor } from '../processors';
import { config } from '../configs';
import { constants } from '../constants';


const CRASH_LOG_FILE_NAME = 'crash_log.txt';
const CRASH_LOG_FILE_PATH = FileUtil.CacheDirectory + '/' + CRASH_LOG_FILE_NAME;
const ERROR_LOG_FILE_NAME = 'error_log.txt';
const ERROR_LOG_FILE_PATH = FileUtil.CacheDirectory + '/' + ERROR_LOG_FILE_NAME;

class MainEventsHandlerComponent extends Component {
  constructor(props) {
    super(props);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.handerProcessingEvent = this.handerProcessingEvent.bind(this);
    this.handerSubmittingEvent = this.handerSubmittingEvent.bind(this);
    this.handleNetworkChange = this.handleNetworkChange.bind(this);
    this.handerProcessErrorEvent = this.handerProcessErrorEvent.bind(this);
    this.doTryConnectInternet = this.doTryConnectInternet.bind(this);
    this.handleDeppLink = this.handleDeppLink.bind(this);
    this.displayEmptyDataSource = this.displayEmptyDataSource.bind(this);

    this.state = {
      processingCount: false,
      submitting: null,
      networkStatus: true,
      emptyDataSource: false,
    };
    this.appState = AppState.currentState;
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    Linking.addEventListener('url', this.handleDeppLink);
    NetInfo.isConnected.fetch().then().done(() => {
      NetInfo.isConnected.addEventListener('connectionChange', this.handleNetworkChange);
    });

    EventEmitterService.on(EventEmitterService.events.APP_PROCESSING, this.handerProcessingEvent);
    EventEmitterService.on(EventEmitterService.events.APP_SUBMITTING, this.handerSubmittingEvent);
    EventEmitterService.on(EventEmitterService.events.APP_PROCESS_ERROR, this.handerProcessErrorEvent);
    EventEmitterService.on(EventEmitterService.events.CHECK_DATA_SOURCE_HEALTH_KIT_EMPTY, this.displayEmptyDataSource);

    // Handle Crashes
    this.checkAndShowCrashLog();
    this.registerCrashHandler();
  }
  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
    Linking.removeListener('url', this.handleDeppLink);
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleNetworkChange);

    EventEmitterService.remove(EventEmitterService.events.APP_PROCESSING, this.handerProcessingEvent);
    EventEmitterService.remove(EventEmitterService.events.APP_SUBMITTING, this.handerSubmittingEvent);
    EventEmitterService.remove(EventEmitterService.events.APP_PROCESS_ERROR, this.handerProcessErrorEvent);
    EventEmitterService.on(EventEmitterService.events.CHECK_DATA_SOURCE_HEALTH_KIT_EMPTY, this.displayEmptyDataSource);
  }

  handleDeppLink(event) {
    const route = event.url.replace(/.*?:\/\//g, '');
    const params = route.split('/');
    // `granting-access/[token]`
    switch (params[0]) {
      case 'granting-access': {
        Actions.scanAccessQRCode({ token: params[1] });
        break;
      }
      default: {
        // TODO
        break;
      }
    }
  }

  handleNetworkChange(networkStatus) {
    let networkChanged = networkStatus === this.state.networkStatus;
    EventEmitterService.emit(EventEmitterService.events.APP_NETWORK_CHANGED, networkChanged);
    this.setState({ networkStatus });
  }

  handleAppStateChange = (nextAppState) => {
    if (this.appState.match(/background/) && nextAppState === 'active') {
      this.doTryConnectInternet();
    }
    this.appState = nextAppState;
  }

  handerProcessingEvent(processing) {
    let processingCount = this.state.processingCount + (processing ? 1 : -1);
    this.setState({ processingCount });

    if (processingCount === 1) {
      KeepAwake.activate();
    } else if (processingCount === 0) {
      KeepAwake.deactivate();
    }
  }

  registerCrashHandler() {
    // Handle JS error
    setJSExceptionHandler(async (error, isFatal) => {
      if (error && isFatal) {
        let userInformation = await UserModel.doGetCurrentUser();
        let crashLog = `JS error: ${error.name} : ${error.message}\r\n${error.stack ? error.stack : ''}`;
        crashLog = `${userInformation.bitmarkAccountNumber ? 'Bitmark account number:' + userInformation.bitmarkAccountNumber + '\r\n' : ''}${crashLog}`;

        console.log('Unexpected JS error:', crashLog);

        await FileUtil.create(CRASH_LOG_FILE_PATH, crashLog);
        RNExitApp.exitApp();
      }
    }, false);

    // Handle native code error
    setNativeExceptionHandler(async (exceptionString) => {
      let userInformation = await UserModel.doGetCurrentUser();
      let crashLog = `Native error: ${userInformation.bitmarkAccountNumber ? 'Bitmark account number:' + userInformation.bitmarkAccountNumber + '\r\n' : ''}${exceptionString}`;
      console.log('Unexpected Native Code error:', crashLog);

      await FileUtil.create(CRASH_LOG_FILE_PATH, crashLog);
    });
  }

  async checkAndShowCrashLog() {
    //let crashLog = await CommonModel.doGetLocalData(CommonModel.KEYS.CRASH_LOG);
    let hasCrashLog = await FileUtil.exists(CRASH_LOG_FILE_PATH);

    if (hasCrashLog) {
      let title = 'Crash Report';
      let message = 'The app has detected unreported crash.\nWould you like to send a report to the developer?';

      Alert.alert(title, message, [{
        text: 'Cancel',
        style: 'cancel',
        onPress: () => {
          FileUtil.removeSafe(CRASH_LOG_FILE_PATH);
        }
      }, {
        text: 'Send',
        onPress: () => {
          this.sendReport(CRASH_LOG_FILE_PATH, CRASH_LOG_FILE_NAME);
        }
      }]);
    }
  }

  sendReport(logFilePath, attachmentName) {
    Mailer.mail({
      subject: (attachmentName == CRASH_LOG_FILE_NAME) ? 'Crash Report' : 'Error Report',
      recipients: ['support@bitmark.com'],
      body: `App version: ${DataProcessor.getApplicationVersion()} (${DataProcessor.getApplicationBuildNumber()})`,
      attachment: {
        path: logFilePath,
        type: 'doc',
        name: attachmentName,
      }
    }, (error) => {
      if (error) {
        Alert.alert('Error', 'Could not send mail.');
      }

      // Remove crash/error log file
      FileUtil.removeSafe(logFilePath);
    });
  }

  handerProcessErrorEvent(processError) {
    if (processError && (processError.title || processError.message)) {
      this.handleDefaultJSError(processError);
    } else {
      this.handleUnexpectedJSError(processError);
    }
  }

  handleDefaultJSError(processError) {
    let title = processError.title;
    let message = processError.message;

    Alert.alert(title, message, [{
      text: 'OK',
      style: 'cancel',
      onPress: () => {
        if (processError && processError.onClose) {
          processError.onClose();
        }
      }
    }]);
  }

  handleUnexpectedJSError(processError) {
    let title = 'Error Report';
    let message = 'The app has detected unreported error.\nWould you like to send a report to the developer?';

    Alert.alert(title, message, [{
      text: 'Cancel',
      style: 'cancel',
      onPress: () => {
        if (processError && processError.onClose) {
          processError.onClose();
        }
      }
    }, {
      text: 'Send',
      onPress: async () => {
        // Write error to log file
        let error = processError.error || new Error('There was an error');
        let userInformation = await UserModel.doGetCurrentUser();
        let errorLog = `${error.name} : ${error.message}\r\n${error.stack ? error.stack : ''}`;
        errorLog = `${userInformation.bitmarkAccountNumber ? 'Bitmark account number:' + userInformation.bitmarkAccountNumber + '\r\n' : ''}${errorLog}`;

        console.log('Handled JS error:', errorLog);

        await FileUtil.create(ERROR_LOG_FILE_PATH, errorLog);
        this.sendReport(ERROR_LOG_FILE_PATH, ERROR_LOG_FILE_NAME);

        if (processError && processError.onClose) {
          processError.onClose();
        }
      }
    }]);
  }

  handerSubmittingEvent(submitting) {
    this.setState({ submitting });

    if (submitting) {
      KeepAwake.activate();
    } else {
      KeepAwake.deactivate();
    }
  }

  doTryConnectInternet() {
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleNetworkChange);
    NetInfo.isConnected.fetch().then().done(() => {
      NetInfo.isConnected.addEventListener('connectionChange', this.handleNetworkChange);
    });
  }

  displayEmptyDataSource() {
    this.setState({ emptyDataSource: true });
  }

  render() {
    let styles = {};
    if (!this.state.networkStatus || this.state.processingCount || this.state.emptyDataSource ||
      (!!this.state.submitting && !this.state.submitting.title && !this.state.submitting.message) ||
      (!!this.state.submitting && (this.state.submitting.title || this.state.submitting.message))) {
      styles.height = '100%';
    }
    return (
      <View style={[{ position: 'absolute', width: '100%', top: 0, left: 0, zIndex: constants.zIndex.dialog }, styles]}>
        {!this.state.networkStatus && <BitmarkInternetOffComponent tryConnectInternet={this.doTryConnectInternet} />}
        {this.state.processingCount > 0 && <DefaultIndicatorComponent />}
        {!!this.state.submitting && !this.state.submitting.title && !this.state.submitting.message && <DefaultIndicatorComponent />}
        {!!this.state.submitting && (this.state.submitting.title || this.state.submitting.message) && <BitmarkIndicatorComponent
          indicator={!!this.state.submitting.indicator} title={this.state.submitting.title} message={this.state.submitting.message} />}
        {this.state.emptyDataSource && <BitmarkDialogComponent dialogStyle={mainStyle.emptyDataSourceDialog}>
          <View style={mainStyle.emptyDataSourceDialogContent}>
            <Text style={mainStyle.emptyDataSourceTitle}>Health+ cannot access your HealthKit data.</Text>
            <Text style={mainStyle.emptyDataSourceDescription}>{'To register ownership of your health data, allow Health+ to access specific (or all) categories of data from within the Apple Health App.\n\nGo to Health App -> Sources.'}</Text>
            <TouchableOpacity style={mainStyle.emptyDataSourceOKButton} onPress={() => this.setState({ emptyDataSource: false })}>
              <Text style={mainStyle.emptyDataSourceOKButtonText}>{'OK, I’ve ALLOWED access!'.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={mainStyle.emptyDataSourceLaterButton} onPress={() => this.setState({ emptyDataSource: false })}>
              <Text style={mainStyle.emptyDataSourceLaterButtonText}>I will do it later.</Text>
            </TouchableOpacity>
          </View>
        </BitmarkDialogComponent>}
      </View>
    );
  }
}


let mainStyle = StyleSheet.create({
  emptyDataSourceDialog: {
    width: convertWidth(308), borderRadius: 5,
  },
  emptyDataSourceDialogContent: {
    paddingTop: 40, paddingBottom: 40, width: convertWidth(308), flexDirection: 'column', alignItems: 'center'
  },
  emptyDataSourceTitle: {
    width: convertWidth(256),
    fontFamily: 'Avenir Light', fontSize: 16, fontWeight: '800', lineHeight: 20,
  },
  emptyDataSourceDescription: {
    width: convertWidth(256),
    marginTop: 20,
    fontFamily: 'Avenir Heavy', fontSize: 16, fontWeight: '300', lineHeight: 20,
  },
  emptyDataSourceOKButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    width: convertWidth(277), minHeight: 52, marginTop: 50,
    borderRadius: 5, borderWidth: 1, borderColor: '#FF4444', backgroundColor: '#FF4444',
  },
  emptyDataSourceOKButtonText: {
    fontFamily: 'Avenir black', fontSize: 16, fontWeight: '900', lineHeight: 20, color: 'white',
  },
  emptyDataSourceLaterButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    width: convertWidth(277), minHeight: 52, marginTop: 10,
  },
  emptyDataSourceLaterButtonText: {
    fontFamily: 'Avenir Light', fontSize: 14, fontWeight: '300', color: '#FF4444',
  },
});

export class MainComponent extends Component {
  static propTypes = {
    message: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.doOpenApp = this.doOpenApp.bind(this);
    this.doRefresh = this.doRefresh.bind(this);

    this.state = {
      user: null,
      networkStatus: true,
    };
  }

  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.APP_NEED_REFRESH, this.doRefresh);
    EventEmitterService.on(EventEmitterService.events.APP_NETWORK_CHANGED, this.doOpenApp);
  }
  componentWillUnmount() {
    EventEmitterService.remove(EventEmitterService.events.APP_NEED_REFRESH, this.doRefresh);
    EventEmitterService.remove(EventEmitterService.events.APP_NETWORK_CHANGED, this.doOpenApp);
  }

  doOpenApp() {
    AppProcessor.doCheckNoLongerSupportVersion().then((result) => {
      if (!result) {
        Alert.alert('New Version Available', 'You’re using a version of Bitmark Health or operating system that’s no longer supported. Please update to the newest app version. Thanks!', [{
          text: 'Visit Appstore',
          onPress: () => Linking.openURL(config.appLink)
        }]);
        return;
      }
    }).then(() => {
      this.doRefresh();
    }).catch(error => {
      console.log('doOpenApp error:', error);
    });
  }
  doRefresh(justCreatedBitmarkAccount) {
    return DataProcessor.doOpenApp().then(user => {
      console.log('doOpenApp user:', user);
      if (!this.state.user || this.state.user.bitmarkAccountNumber !== user.bitmarkAccountNumber) {
        this.setState({ user });
      }
      if (user && user.bitmarkAccountNumber) {
        CommonModel.doCheckPasscodeAndFaceTouchId().then(ok => {
          if (ok) {
            AppProcessor.doStartBackgroundProcess(justCreatedBitmarkAccount);
          } else {
            if (!this.requiringTouchId) {
              this.requiringTouchId = true;
              Alert.alert('Please enable your Touch ID & Passcode to continue using Bitmark. Settings > Touch ID & Passcode', '', [{
                text: 'ENABLE',
                style: 'cancel',
                onPress: () => {
                  Linking.openURL('app-settings:');
                  this.requiringTouchId = false;
                }
              }]);
            }
          }
        });
      }
    }).catch(error => {
      console.log('doRefresh error:', error);
    });
  }

  render() {
    let DisplayComponent = LoadingComponent;
    if (this.state.user) {
      DisplayComponent = this.state.user.bitmarkAccountNumber ? UserRouterComponent : HomeRouterComponent;
    }
    return (

      <View style={{ flex: 1 }}>
        <StatusBar hidden={config.isIPhoneX ? false : true} />
        <DisplayComponent />
        <MainEventsHandlerComponent />
      </View>
    );
  }
}
