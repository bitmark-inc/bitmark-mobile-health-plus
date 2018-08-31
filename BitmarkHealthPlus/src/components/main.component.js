
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  View,
  StatusBar,
  AppState,
  Linking,
  NetInfo,
  Alert,
} from 'react-native';

import KeepAwake from 'react-native-keep-awake';
import Mailer from 'react-native-mail';
import RNExitApp from 'react-native-exit-app';
import { setJSExceptionHandler, setNativeExceptionHandler } from "react-native-exception-handler";

import { LoadingComponent, BitmarkInternetOffComponent, DefaultIndicatorComponent, BitmarkIndicatorComponent, } from '../commons'
import { HomeRouterComponent } from './home';
import { UserRouterComponent, } from './user';
import { EventEmitterService } from '../services';
import { UserModel, CommonModel } from '../models';
import { FileUtil } from '../utils';
import { DataProcessor, AppProcessor } from '../processors';
import { config } from '../configs';


const CRASH_LOG_FILE_NAME = 'crash_log.txt';
const CRASH_LOG_FILE_PATH = FileUtil.CacheDirectory + '/' + CRASH_LOG_FILE_NAME;
const ERROR_LOG_FILE_NAME = 'error_log.txt';
const ERROR_LOG_FILE_PATH = FileUtil.CacheDirectory + '/' + ERROR_LOG_FILE_NAME;

export class MainComponent extends Component {
  static propTypes = {
    message: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.handleDeppLink = this.handleDeppLink.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.handerProcessingEvent = this.handerProcessingEvent.bind(this);
    this.handerSubmittingEvent = this.handerSubmittingEvent.bind(this);
    this.handleNetworkChange = this.handleNetworkChange.bind(this);
    this.handerProcessErrorEvent = this.handerProcessErrorEvent.bind(this);
    this.doTryConnectInternet = this.doTryConnectInternet.bind(this);
    this.displayEmptyDataSource = this.displayEmptyDataSource.bind(this);

    this.doOpenApp = this.doOpenApp.bind(this);
    this.doRefresh = this.doRefresh.bind(this);

    this.state = {
      user: null,
      processingCount: false,
      submitting: null,
      justCreatedBitmarkAccount: false,
      networkStatus: true,
      emptyDataSource: false,
    };
    this.appState = AppState.currentState;
  }

  componentDidMount() {

    EventEmitterService.on(EventEmitterService.events.APP_PROCESSING, this.handerProcessingEvent);
    EventEmitterService.on(EventEmitterService.events.APP_SUBMITTING, this.handerSubmittingEvent);
    EventEmitterService.on(EventEmitterService.events.APP_PROCESS_ERROR, this.handerProcessErrorEvent);

    EventEmitterService.on(EventEmitterService.events.CHECK_DATA_SOURCE_HEALTH_KIT_EMPTY, this.displayEmptyDataSource);
    EventEmitterService.on(EventEmitterService.events.APP_NEED_REFRESH, this.doRefresh);

    Linking.addEventListener('url', this.handleDeppLink);
    AppState.addEventListener('change', this.handleAppStateChange);
    NetInfo.isConnected.fetch().then().done(() => {
      NetInfo.isConnected.addEventListener('connectionChange', this.handleNetworkChange);
    });

    // Handle Crashes
    this.checkAndShowCrashLog();
    this.registerCrashHandler();
  }
  componentWillUnmount() {
    EventEmitterService.remove(EventEmitterService.events.APP_PROCESSING, this.handerProcessingEvent);
    EventEmitterService.remove(EventEmitterService.events.APP_SUBMITTING, this.handerSubmittingEvent);
    EventEmitterService.remove(EventEmitterService.events.APP_PROCESS_ERROR, this.handerProcessErrorEvent);
    EventEmitterService.remove(EventEmitterService.events.CHECK_DATA_SOURCE_HEALTH_KIT_EMPTY, this.displayEmptyDataSource);
    EventEmitterService.on(EventEmitterService.events.APP_NEED_REFRESH, this.doRefresh);
    Linking.addEventListener('url', this.handleDeppLink);
    AppState.removeEventListener('change', this.handleAppStateChange);
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleNetworkChange);
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
  displayEmptyDataSource() {
    this.setState({ emptyDataSource: true });
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

  handleDeppLink(event) {
    const route = event.url.replace(/.*?:\/\//g, '');
    const params = route.split('/');
    switch (params[0]) {
      // case 'login': {
      //   break;
      // }
      default: {
        // TODO
        break;
      }
    }
  }

  handleAppStateChange = (nextAppState) => {
    if (this.appState.match(/background/) && nextAppState === 'active') {
      this.doTryConnectInternet();
    }
    this.appState = nextAppState;
  }

  handleNetworkChange(networkStatus) {
    this.setState({ networkStatus });
    if (networkStatus) {
      this.doOpenApp();
    }
  }

  doTryConnectInternet() {
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleNetworkChange);
    NetInfo.isConnected.fetch().then().done(() => {
      NetInfo.isConnected.addEventListener('connectionChange', this.handleNetworkChange);
    });
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
      this.doRefresh();
    }).catch(error => {
      console.log('doOpenApp error:', error);
    });
  }
  doRefresh(justCreatedBitmarkAccount) {
    this.setState({ user: null });

    return DataProcessor.doOpenApp().then(user => {
      console.log('doOpenApp user:', user);
      this.setState({ user });
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
        {!this.state.networkStatus && <BitmarkInternetOffComponent tryConnectInternet={this.doTryConnectInternet} />}
        {this.state.processingCount > 0 && <DefaultIndicatorComponent />}
        {!!this.state.submitting && !this.state.submitting.title && !this.state.submitting.message && <DefaultIndicatorComponent />}
        {!!this.state.submitting && (this.state.submitting.title || this.state.submitting.message) && <BitmarkIndicatorComponent
          indicator={!!this.state.submitting.indicator} title={this.state.submitting.title} message={this.state.submitting.message} />}

        <DisplayComponent />
      </View>
    );
  }
}
