import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity, SafeAreaView,
  Alert,
  StyleSheet,
} from 'react-native';
import { constants } from '../../constants';
import { config } from '../../configs';
import { convertWidth } from '../../utils';

export class BitmarkInternetOffComponent extends React.Component {
  static propTypes = {
    tryConnectInternet: PropTypes.func,
  }

  render() {
    let showAlert = () => {
      Alert.alert('Network Error', 'Failed to connect to Bitmark. Please check your device’s network connection.', [{
        text: 'Cancel', style: 'cancel',
      }, {
        text: 'Retry',
        onPress: () => {
          if (this.props.tryConnectInternet) {
            this.props.tryConnectInternet();
          }
        }
      }]);
    }
    return (
      <View style={styles.body} activeOpacity={1} onPress={showAlert}>
        <SafeAreaView style={styles.safeAreaView}>
          <View style={styles.content}>
            <View style={{ flex: 1, }}>
              <Text style={[styles.titleText,]}>NO INTERNET CONNECTION</Text>
              <Text style={[styles.description,]}>You do not have internet connection now, try again when it is connected.</Text>
            </View>
            <TouchableOpacity style={styles.okButton} onPress={showAlert}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({

  body: {
    flex: 1,
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: constants.zIndex.internetOff,
    backgroundColor: 'white',
    padding: convertWidth(16),
    paddingTop: 16 + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
  },
  safeAreaView: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#FF4444',
    padding: convertWidth(20),
    paddingTop: convertWidth(15),
  },
  titleText: {
    fontFamily: config.localization.startsWith('vi') ? null : 'Avenir black',
    fontSize: 36,
    fontWeight: '900',
    color: 'white',
  },
  description: {
    fontFamily: config.localization.startsWith('vi') ? null : 'Avenir black',
    fontSize: 16,
    color: 'white',
    marginTop: 70,
  },
  okButton: {
    backgroundColor: 'white',
    minWidth: convertWidth(145),
    height: constants.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okButtonText: {
    fontFamily: config.localization.startsWith('vi') ? null : 'Avenir black',
    fontSize: 16,
    fontWeight: '900',
    color: '#FF4444',
    textAlign: 'center',
  }
});
