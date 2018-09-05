import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, TouchableOpacity, SafeAreaView,
  StyleSheet,
} from 'react-native'

import { AppProcessor } from '../../processors';
import { EventEmitterService } from '../../services';
import { Actions } from 'react-native-router-flux';
import { convertWidth } from '../../utils';
import { constants } from '../../constants';
import { config } from '../../configs';

export class GetStartComponent extends React.Component {
  static propTypes = {
    passPhrase24Words: PropTypes.arrayOf(PropTypes.string),
  };
  constructor(props) {
    super(props);
  }
  render() {

    let requestHealthKitPermission = () => {
      AppProcessor.doRequireHealthKitPermission().then(() => {
        Actions.touchFaceId({ passPhrase24Words: this.props.passPhrase24Words });
      }).catch(error => {
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
        console.log('doRequireHealthKitPermission error :', error);
      });
    }
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <View style={[styles.body]}>
          <View style={styles.swipePageContent}>
            <View style={styles.accessIconArea}>
              <Image style={styles.accessIcon} source={require('../../../assets/imgs/icon_health.png')} />
              <Image style={styles.accessIconPlus} source={require('../../../assets/imgs/plus-icon.png')} />
              <Image style={styles.accessIcon} source={require('../../../assets/imgs/bitmark-logo.png')} />
            </View>
            <Text style={[styles.getStartTitle]}>GET STARTED NOW</Text>
            <Text style={[styles.getStartDescription,]}>To register ownership of your health data, allow Bitmark Health to access specific (or all) categories of data.</Text>
          </View>
        </View>
        <View style={styles.enableButtonArea}>
          <TouchableOpacity style={[styles.enableButton]} onPress={requestHealthKitPermission}>
            <Text style={styles.enableButtonText}>ALLOW ACCESS</Text>
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
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    paddingLeft: convertWidth(50),
    paddingRight: convertWidth(50),
    paddingTop: (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
  },

  swipePageContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // getStart
  getStartTitle: {
    fontFamily: 'Avenir black',
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
    fontFamily: 'Avenir light',
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
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
  },
});