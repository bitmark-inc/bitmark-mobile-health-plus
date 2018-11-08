import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, TouchableOpacity, SafeAreaView,
  StyleSheet,
} from 'react-native'

import { AppProcessor, DataProcessor } from '../../processors';
import { EventEmitterService } from '../../services';
import { Actions } from 'react-native-router-flux';
import { convertWidth } from '../../utils';
import { constants } from '../../constants';
import { config } from '../../configs';

export class GetStartComponent extends React.Component {
  static propTypes = {
    phraseWords: PropTypes.arrayOf(PropTypes.string),
  };

  constructor(props) {
    super(props);
  }
  render() {

    let requestHealthKitPermission = () => {
      Actions.pop();
      AppProcessor.doRequireHealthKitPermission().then(() => {
        DataProcessor.doReloadUserData();
      }).catch(error => {
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
        console.log('doRequireHealthKitPermission error :', error);
      });
    }
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={Actions.pop}>
            <Image style={styles.closeIcon} source={require('./../../../assets/imgs/close_icon_red.png')} />
          </TouchableOpacity>
        </View>
        <View style={[styles.body]}>
          <View style={styles.swipePageContent}>
            <View style={styles.accessIconArea}>
              <Image style={styles.accessIcon} source={require('../../../assets/imgs/icon_health.png')} />
              <Image style={styles.accessIconPlus} source={require('../../../assets/imgs/plus-icon.png')} />
              <Image style={styles.accessIcon} source={require('../../../assets/imgs/bitmark-logo.png')} />
            </View>
            <Text style={[styles.getStartTitle]}>{i18n.t('GetStartComponent_getStartTitle')}</Text>
            <Text style={[styles.getStartDescription,]}>{i18n.t('GetStartComponent_getStartDescription')}</Text>
          </View>
        </View>
        <View style={styles.enableButtonArea}>
          <TouchableOpacity style={[styles.enableButton]} onPress={requestHealthKitPermission}>
            <Text style={styles.enableButtonText}>{i18n.t('GetStartComponent_enableButtonText')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: 'white',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: convertWidth(36),
    paddingTop: (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0) + 20,
  },
  closeIcon: {
    width: convertWidth(20),
    height: convertWidth(20),
    resizeMode: 'contain',
  },

  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    paddingLeft: convertWidth(50),
    paddingRight: convertWidth(50),
  },

  swipePageContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // getStart
  getStartTitle: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir black',
    color: '#FF4444',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 57,
  },

  accessIconArea: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  accessIcon: {
    height: 90,
    width: 90,
    resizeMode: 'contain'
  },
  accessIconPlus: {
    height: 24,
    width: 24,
    resizeMode: 'contain',
    marginLeft: 10,
    marginRight: 10,
  },

  getStartDescription: {
    marginTop: 25,
    width: convertWidth(296),
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir light',
    fontWeight: '300',
    fontSize: 16,
    textAlign: 'center',
  },

  enableButtonArea: {
    flexDirection: 'column',
    width: '100%',
    paddingLeft: convertWidth(20),
    paddingRight: convertWidth(20),
    paddingBottom: convertWidth(20),
  },
  enableButton: {
    height: constants.buttonHeight,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4444',
  },
  enableButtonText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
  },
});