
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StackNavigator } from 'react-navigation';
import ReactNative from 'react-native';
import KeepAwake from "react-native-keep-awake";

// import PushNotification from 'react-native-push-notification';

const {
  Linking,
  Alert,
  AppState,
  NetInfo,
  // PushNotificationIOS,
  StyleSheet,
  View, Text,
} = ReactNative;

import {
  LoadingComponent,
  DefaultIndicatorComponent,
  BitmarkIndicatorComponent,
  BitmarkInternetOffComponent,
  BitmarkDialogComponent,
} from './../commons/components';
import { HomeComponent } from './../components/home';
import { OnBoardingComponent } from './onboarding';
import { EventEmitterService } from './../services';
import { AppProcessor, DataProcessor } from '../processors';
import { CommonModel, UserModel } from '../models';
import { setJSExceptionHandler, setNativeExceptionHandler } from "react-native-exception-handler";
import RNExitApp from 'react-native-exit-app';
import Mailer from "react-native-mail";
import { FileUtil, convertWidth } from "../utils";
import { config } from '../configs';
import { BitmarkOneTabButtonComponent } from '../commons/components/bitmark-button';

const CRASH_LOG_FILE_NAME = 'crash_log.txt';
const CRASH_LOG_FILE_PATH = FileUtil.CacheDirectory + '/' + CRASH_LOG_FILE_NAME;
const ERROR_LOG_FILE_NAME = 'error_log.txt';
const ERROR_LOG_FILE_PATH = FileUtil.CacheDirectory + '/' + ERROR_LOG_FILE_NAME;

class MainComponent extends Component {
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

    this.state = {
      user: null,
      processingCount: false,
      submitting: null,
      justCreatedBitmarkAccount: false,
      networkStatus: true,
      emptyDataSource: false,
    };
    this.appState = AppState.currentState;

    // setTimeout(() => {
    //   console.log('send notification');
    //   PushNotification.localNotification({
    //     title: 'Donate data',
    //     message: 'Your daily data donation for <date range> has been sent to the <institution> <study name>. Thanks for donating!',
    //     userInfo: {
    //       event: 'transfer_required',
    //       bitmark_id: '6a2617f125303e25a8bd78de0b16c94f34c281fde4f934babbb4a29dcae1540b',
    //     }
    //   });
    // }, 4000);

    // setTimeout(() => {
    //   console.log('send notification');
    //   PushNotification.localNotification({
    //     title: 'Donate data',
    //     message: 'Your daily data donation for <date range> has been sent to the <institution> <study name>. Thanks for donating!',
    //     userInfo: {
    //       event: 'transfer_rejected',
    //       bitmark_id: 'e683dc72c6b20f1e4c4e8c70b4139bca6e08ed646ac55a51478f5c0ede1a04b1',
    //     }
    //   });
    // }, 4000);

  }

  componentDidMount() {
    let justCreatedBitmarkAccount = false;
    if (this.props.navigation.state && this.props.navigation.state.params) {
      justCreatedBitmarkAccount = !!this.props.navigation.state.params.justCreatedBitmarkAccount;
      this.setState({ justCreatedBitmarkAccount });
    }

    EventEmitterService.on(EventEmitterService.events.APP_PROCESSING, this.handerProcessingEvent);
    EventEmitterService.on(EventEmitterService.events.APP_SUBMITTING, this.handerSubmittingEvent);
    EventEmitterService.on(EventEmitterService.events.APP_PROCESS_ERROR, this.handerProcessErrorEvent);

    EventEmitterService.on(EventEmitterService.events.CHECK_DATA_SOURCE_HEALTH_KIT_EMPTY, this.displayEmptyDataSource);

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
    const jsErrorHandler = async (error, isFatal) => {
      if (error && isFatal) {
        let userInformation = await UserModel.doGetCurrentUser();
        let crashLog = `JS error: ${error.name} : ${error.message}\r\n${error.stack ? error.stack : ''}`;
        crashLog = `${userInformation.bitmarkAccountNumber ? 'Bitmark account number:' + userInformation.bitmarkAccountNumber + '\r\n' : ''}${crashLog}`;

        console.log('Unexpected JS error:', crashLog);

        await FileUtil.create(CRASH_LOG_FILE_PATH, crashLog);
        RNExitApp.exitApp();
      }
    };
    setJSExceptionHandler(jsErrorHandler, false);

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
      return DataProcessor.doOpenApp();
    }).then(user => {
      this.setState({ user });
      if (user && user.bitmarkAccountNumber) {
        CommonModel.doCheckPasscodeAndFaceTouchId().then(ok => {
          if (ok) {
            AppProcessor.doStartBackgroundProcess(this.state.justCreatedBitmarkAccount);
            setTimeout(() => {
              this.setState({ justCreatedBitmarkAccount: false });
            }, 5000);
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
      console.log('doOpenApp error:', error);
    });
  }

  render() {
    let DisplayedComponent = LoadingComponent;
    if (this.state.user) {
      DisplayedComponent = this.state.user.bitmarkAccountNumber ? HomeComponent : OnBoardingComponent;
    }
    return (
      <View style={{ flex: 1 }}>
        {!this.state.networkStatus && <BitmarkInternetOffComponent tryConnectInternet={this.doTryConnectInternet} />}
        {this.state.processingCount > 0 && <DefaultIndicatorComponent />}

        {!!this.state.submitting && !this.state.submitting.title && !this.state.submitting.message && <DefaultIndicatorComponent />}
        {!!this.state.submitting && (this.state.submitting.title || this.state.submitting.message) && <BitmarkIndicatorComponent
          indicator={!!this.state.submitting.indicator} title={this.state.submitting.title} message={this.state.submitting.message} />}
        <View style={{ flex: 1, }}>
          {this.state.emptyDataSource && <BitmarkDialogComponent dialogStyle={mainStyle.emptyDataSourceDialog}>
            <View style={mainStyle.emptyDataSourceDialogContent}>
              <Text style={mainStyle.emptyDataSourceTitle}>Bitmark Health cannot access your HealthKit data.</Text>
              <Text style={mainStyle.emptyDataSourceDescription}>{'To register ownership of your health data, allow Bitmark Health to access specific (or all) categories of data from within the Apple Health App.\n\nGo to Health App -> Sources.'}</Text>
              <BitmarkOneTabButtonComponent style={mainStyle.emptyDataSourceOKButton} onPress={() => this.setState({ emptyDataSource: false })}>
                <Text style={mainStyle.emptyDataSourceOKButtonText}>{'OK, I’ve ALLOWED access!'.toUpperCase()}</Text>
              </BitmarkOneTabButtonComponent>
              <BitmarkOneTabButtonComponent style={mainStyle.emptyDataSourceLaterButton} onPress={() => this.setState({ emptyDataSource: false })}>
                <Text style={mainStyle.emptyDataSourceLaterButtonText}>I will do it later.</Text>
              </BitmarkOneTabButtonComponent>
            </View>
          </BitmarkDialogComponent>}
          <DisplayedComponent screenProps={{ rootNavigation: this.props.navigation, }} />
        </View>
      </View>
    )
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
    borderWidth: 1, borderColor: '#0060F2', backgroundColor: '#0060F2',
  },
  emptyDataSourceOKButtonText: {
    fontFamily: 'Avenir black', fontSize: 16, fontWeight: '900', lineHeight: 20, color: 'white',
  },
  emptyDataSourceLaterButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    width: convertWidth(277), minHeight: 52, marginTop: 10,
  },
  emptyDataSourceLaterButtonText: {
    fontFamily: 'Avenir Light', fontSize: 14, fontWeight: '300', color: '#0060F2',
  },
});

MainComponent.propTypes = {
  navigation: PropTypes.shape({
    dispatch: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        justCreatedBitmarkAccount: PropTypes.bool,
      }),
    }),
  })
}

let BitmarkAppComponent = StackNavigator({
  Main: { screen: MainComponent, },
}, {
    headerMode: 'none',
    navigationOptions: {
      gesturesEnabled: false,
    }, cardStyle: {
      shadowOpacity: 0,
    }
  }
);
export { BitmarkAppComponent };
export * from './code-push/code-push.component';