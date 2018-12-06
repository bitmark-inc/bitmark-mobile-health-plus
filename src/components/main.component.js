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
import DeviceInfo from 'react-native-device-info';

import KeepAwake from 'react-native-keep-awake';
import Mailer from 'react-native-mail';
import RNExitApp from 'react-native-exit-app';
import { setJSExceptionHandler, setNativeExceptionHandler } from "react-native-exception-handler";

import { LoadingComponent, BitmarkInternetOffComponent, DefaultIndicatorComponent, BitmarkIndicatorComponent, BitmarkDialogComponent, } from '../commons'
import { HomeRouterComponent } from './home';
import { UserRouterComponent, } from './user';
import { EventEmitterService } from '../services';
import { UserModel, CommonModel, BitmarkSDK } from '../models';
import { FileUtil, convertWidth, runPromiseWithoutError } from '../utils';
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
    this.handleDeepLink = this.handleDeepLink.bind(this);
    this.displayEmptyDataSource = this.displayEmptyDataSource.bind(this);
    this.doRefresh = this.doRefresh.bind(this);

    this.state = {
      processingCount: false,
      submitting: null,
      networkStatus: true,
      emptyDataSource: false,
      passTouchFaceId: true,
    };
    this.appState = AppState.currentState;
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    Linking.addEventListener('url', this.handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) {
        this.handleDeepLink({ url });
      }
    })
    NetInfo.isConnected.fetch().then().done(() => {
      NetInfo.isConnected.addEventListener('connectionChange', this.handleNetworkChange);
    });
    EventEmitterService.on(EventEmitterService.events.APP_NEED_REFRESH, this.doRefresh);
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
    Linking.removeListener('url', this.handleDeepLink);
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleNetworkChange);
    EventEmitterService.remove(EventEmitterService.events.APP_NEED_REFRESH, this.doRefresh);
    EventEmitterService.remove(EventEmitterService.events.APP_PROCESSING, this.handerProcessingEvent);
    EventEmitterService.remove(EventEmitterService.events.APP_SUBMITTING, this.handerSubmittingEvent);
    EventEmitterService.remove(EventEmitterService.events.APP_PROCESS_ERROR, this.handerProcessErrorEvent);
    EventEmitterService.remove(EventEmitterService.events.CHECK_DATA_SOURCE_HEALTH_KIT_EMPTY, this.displayEmptyDataSource);
  }

  async doRefresh(justCreatedBitmarkAccount) {
    if (DataProcessor.getUserInformation() && DataProcessor.getUserInformation().bitmarkAccountNumber) {
      // TODO authenticate touch face id
      let result = await runPromiseWithoutError(BitmarkSDK.requestSession(i18n.t('FaceTouchId_doOpenApp')));
      let passTouchFaceId = !result || !result.error;
      this.setState({ passTouchFaceId });
      if (passTouchFaceId && this.state.networkStatus) {
        EventEmitterService.emit(EventEmitterService.events.APP_NETWORK_CHANGED, { networkStatus: this.state.networkStatus, justCreatedBitmarkAccount });
      }
    } else if (this.state.networkStatus) {
      EventEmitterService.emit(EventEmitterService.events.APP_NETWORK_CHANGED, { networkStatus: this.state.networkStatus, justCreatedBitmarkAccount });
    }
  }

  handleDeepLink(event) {
    const route = event.url.replace(/.*?:\/\//g, '');
    const params = route.split('/');
    switch (params[0]) {
      default: {
        // TODO
        break;
      }
    }
  }

  handleNetworkChange(networkStatus) {
    this.setState({ networkStatus });
    if (networkStatus) {
      UserModel.doTryGetCurrentUser().then(async (userInformation) => {
        if (userInformation && userInformation.bitmarkAccountNumber) {
          let result = await runPromiseWithoutError(BitmarkSDK.requestSession(i18n.t('FaceTouchId_doOpenApp')));
          let passTouchFaceId = !result || !result.error;
          this.setState({ passTouchFaceId });
          if (passTouchFaceId) {
            EventEmitterService.emit(EventEmitterService.events.APP_NETWORK_CHANGED, { networkStatus });
          }
        } else {
          EventEmitterService.emit(EventEmitterService.events.APP_NETWORK_CHANGED, { networkStatus });
        }
      });
    }
  }

  handleAppStateChange = (nextAppState) => {
    if (this.appState.match(/background/) && nextAppState === 'active') {
      this.doTryConnectInternet();
      runPromiseWithoutError(DataProcessor.doMetricOnScreen(true));
    }
    if (nextAppState.match(/background/)) {
      runPromiseWithoutError(DataProcessor.doMetricOnScreen(false));
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
      console.log(await runPromiseWithoutError(FileUtil.readFile(CRASH_LOG_FILE_PATH)));

      let title = i18n.t('MainComponent_alertTitle4');
      let message = i18n.t('MainComponent_alertMessage4');

      Alert.alert(title, message, [{
        text: i18n.t('MainComponent_alertButton41'),
        style: 'cancel',
        onPress: () => {
          FileUtil.removeSafe(CRASH_LOG_FILE_PATH);
        }
      }, {
        text: i18n.t('MainComponent_alertButton42'),
        onPress: () => {
          this.sendReport(CRASH_LOG_FILE_PATH, CRASH_LOG_FILE_NAME);
        }
      }]);
    }
  }

  sendReport(logFilePath, attachmentName) {
    Mailer.mail({
      subject: (attachmentName == CRASH_LOG_FILE_NAME) ? i18n.t('MainComponent_subject1') : i18n.t('MainComponent_subject2'),
      recipients: ['support@bitmark.com'],
      body: `App version: ${DataProcessor.getApplicationVersion()} (${DataProcessor.getApplicationBuildNumber()})`,
      attachment: {
        path: logFilePath,
        type: 'doc',
        name: attachmentName,
      }
    }, (error) => {
      if (error) {
        Alert.alert(i18n.t('MainComponent_alertTitle5'), i18n.t('MainComponent_alertMessage5'));
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
      text: i18n.t('MainComponent_alertButton6'),
      style: 'cancel',
      onPress: () => {
        if (processError && processError.onClose) {
          processError.onClose();
        }
      }
    }]);
  }

  handleUnexpectedJSError(processError) {
    let title = i18n.t('MainComponent_alertTitle7');
    let message = i18n.t('MainComponent_alertMessage7');

    Alert.alert(title, message, [{
      text: i18n.t('MainComponent_alertButton71'),
      style: 'cancel',
      onPress: () => {
        if (processError && processError.onClose) {
          processError.onClose();
        }
      }
    }, {
      text: i18n.t('MainComponent_alertButton72'),
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
    if (!this.state.networkStatus || this.state.processingCount || this.state.emptyDataSource || !this.state.passTouchFaceId ||
      (!!this.state.submitting && !this.state.submitting.title && !this.state.submitting.message) ||
      (!!this.state.submitting && (this.state.submitting.title || this.state.submitting.message))) {
      styles.height = '100%';
    }
    return (
      <View style={[{ position: 'absolute', width: '100%', top: 0, left: 0, zIndex: constants.zIndex.dialog }, styles]}>
        {!this.state.networkStatus && <BitmarkInternetOffComponent tryConnectInternet={this.doTryConnectInternet} />}
        {!this.state.passTouchFaceId && <BitmarkDialogComponent dialogStyle={{
          minHeight: 0, backgroundColor: 'rgba(256,256,256, 0.7)', flex: 1, width: '100%',

        }}>
          <TouchableOpacity style={{ flex: 1, justifyContent: 'center', }} onPress={this.doRefresh}>
            <Text style={{
              width: convertWidth(300),
              color: 'white', fontWeight: '900', fontSize: 16,
              backgroundColor: '#FF4444', padding: 10,
              textAlign: 'center',
            }}>{i18n.t('MainComponent_pleaseAuthorizeText​')}</Text>
          </TouchableOpacity>
        </BitmarkDialogComponent>}
        {this.state.processingCount > 0 && <DefaultIndicatorComponent />}
        {!!this.state.submitting && !this.state.submitting.title && !this.state.submitting.message && <DefaultIndicatorComponent />}
        {!!this.state.submitting && (this.state.submitting.title || this.state.submitting.message) && <BitmarkIndicatorComponent
          indicator={!!this.state.submitting.indicator} title={this.state.submitting.title} message={this.state.submitting.message} />}
        {this.state.emptyDataSource && <BitmarkDialogComponent dialogStyle={mainStyle.emptyDataSourceDialog}>
          <View style={mainStyle.emptyDataSourceDialogContent}>
            <Text style={mainStyle.emptyDataSourceTitle}>{i18n.t('MainComponent_emptyDataSourceTitle')}</Text>
            <Text style={mainStyle.emptyDataSourceDescription}>{i18n.t('MainComponent_emptyDataSourceDescription1')}</Text>
            <Text style={[mainStyle.emptyDataSourceDescription, { marginTop: 20 }]}>{i18n.t('MainComponent_emptyDataSourceDescription2')} <Text style={{ fontWeight: '600' }}>{i18n.t('MainComponent_emptyDataSourceDescription3')}</Text>.</Text>
            <TouchableOpacity style={mainStyle.emptyDataSourceOKButton} onPress={() => this.setState({ emptyDataSource: false })}>
              <Text style={mainStyle.emptyDataSourceOKButtonText}>{i18n.t('MainComponent_emptyDataSourceOKButtonText').toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={mainStyle.emptyDataSourceLaterButton} onPress={() => this.setState({ emptyDataSource: false })}>
              <Text style={mainStyle.emptyDataSourceLaterButtonText}>{i18n.t('MainComponent_emptyDataSourceLaterButtonText').toUpperCase()}</Text>
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
    paddingTop: 28, paddingBottom: 19, width: convertWidth(308), flexDirection: 'column', alignItems: 'center'
  },
  emptyDataSourceTitle: {
    width: convertWidth(256),
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Light', fontSize: 16, fontWeight: '800', lineHeight: 20,
  },
  emptyDataSourceDescription: {
    width: convertWidth(256),
    marginTop: 20,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Heavy', fontSize: 16, fontWeight: '300', lineHeight: 20,
  },
  emptyDataSourceOKButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    width: convertWidth(260), minHeight: 52, marginTop: 30,
    backgroundColor: '#FF4444',
  },
  emptyDataSourceOKButtonText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir black', fontSize: 16, fontWeight: '900', lineHeight: 20, color: 'white',
  },
  emptyDataSourceLaterButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    width: convertWidth(260), marginTop: 10,
  },
  emptyDataSourceLaterButtonText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Light', fontSize: 14, fontWeight: '500', color: '#FF4444',
  },
});

export class MainComponent extends Component {
  static propTypes = {
    message: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.doOpenApp = this.doOpenApp.bind(this);
    this.doAppRefresh = this.doAppRefresh.bind(this);

    this.state = {
      user: null,
      networkStatus: true,
    };
  }

  componentDidMount() {

    EventEmitterService.on(EventEmitterService.events.APP_NETWORK_CHANGED, this.doOpenApp);
  }
  componentWillUnmount() {

    EventEmitterService.remove(EventEmitterService.events.APP_NETWORK_CHANGED, this.doOpenApp);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!this.state.user || this.state.user.bitmarkAccountNumber !== nextState.user.bitmarkAccountNumber) {
      return true;
    }
    return false;
  }

  doOpenApp({ networkStatus, justCreatedBitmarkAccount }) {
    if (!networkStatus) {
      return;
    }
    AppProcessor.doCheckNoLongerSupportVersion().then((newAppLink) => {
      if (newAppLink) {
        let title = i18n.t('MainComponent_alertTitle1');
        let message = i18n.t('MainComponent_alertMessage1');
        let buttons = [{
          text: i18n.t('MainComponent_alertButton1'),
          onPress: () => Linking.openURL(newAppLink)
        }];
        if (DeviceInfo.getBundleId() === 'com.bitmark.healthplus.beta' ||
          DeviceInfo.getBundleId() === 'com.bitmark.healthplus.inhouse') {
          title = i18n.t('AlphaAppUpdate_title');
          message = i18n.t('AlphaAppUpdate_message');
          buttons = [{
            text: i18n.t('AlphaAppUpdate_button'),
            onPress: () => Linking.openURL(newAppLink)
          }];

          if (DeviceInfo.getBundleId() === 'com.bitmark.healthplus.inhouse') {
            buttons.push({
              text: 'Cancel', style: 'cancel',
              onPress: () => this.doAppRefresh(justCreatedBitmarkAccount)
            });
          }
        }
        Alert.alert(title, message, buttons);
      } else {
        this.doAppRefresh(justCreatedBitmarkAccount);
      }
    }).catch(error => {
      console.log('doOpenApp error:', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }
  doAppRefresh(justCreatedBitmarkAccount) {
    DataProcessor.doCheckHaveCodePushUpdate().then(updated => {
      if (updated) {
        return DataProcessor.doOpenApp(justCreatedBitmarkAccount).then(user => {
          user = user || {};
          console.log('doOpenApp user:', user);
          if (!this.state.user || this.state.user.bitmarkAccountNumber !== user.bitmarkAccountNumber) {
            this.setState({ user });
          }
          if (user && user.bitmarkAccountNumber) {
            CommonModel.doCheckPasscodeAndFaceTouchId().then(ok => {
              if (ok) {
                AppProcessor.doStartBackgroundProcess();
              } else {
                if (!this.requiringTouchId) {
                  this.requiringTouchId = true;
                  Alert.alert(i18n.t('MainComponent_alertTitle2'), '', [{
                    text: i18n.t('MainComponent_alertButton2'),
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
          console.log('doAppRefresh error:', error);
          EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
        });
      }
    })
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
