import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { constants } from '../../constants';
import { config } from '../../configs';

export class BitmarkInternetOffComponent extends React.Component {
  static propTypes = {
    tryConnectInternet: PropTypes.func,
  }

  render() {
    return (
      <View style={styles.body}>
        <TouchableOpacity style={styles.content} activeOpacity={1}
          onPress={() => {
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
          }}>
          <View style={[styles.title, config.isIPhoneX ? { paddingTop: constants.iPhoneXStatusBarHeight } : {}]}>
            <Text style={[styles.titleText,]}>NO INTERNET CONNECTION!</Text>
          </View>
        </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  content: {
    alignItems: 'center',
    alignContent: 'center',
    flexDirection: 'column',
    flex: 1,
  },
  title: {
    width: '100%',
    height: constants.buttonHeight + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
    backgroundColor: '#FF003C',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  titleText: {
    fontFamily: 'Avenir black',
    fontSize: 18,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
  },
});
