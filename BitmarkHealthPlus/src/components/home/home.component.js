import React, { Component } from 'react';
import {
  StyleSheet,
  Alert,
  Linking,
  Image, View, SafeAreaView, TouchableOpacity, Text,
} from 'react-native';

import { convertWidth } from './../../utils';
import { config } from './../../configs';

export class HomeComponent extends Component {
  constructor(props) {
    super(props);

  }

  createNewAccount() {
    Alert.alert('Accept Terms', 'By creating an account, you agree to the Bitmark Health Terms of Service and Privacy Policy.', [{
      text: 'Read Terms', onPress: () => Linking.openURL(config.bitmark_web_site + '/terms')
    }, {
      text: 'Cancel',
    }, {
      text: 'Agree', style: 'cancel', onPress: () => {
        //TODO
      }
    }]);
  }

  render() {
    return (
      <SafeAreaView style={styles.body}>
        <View style={styles.bodyContent}>
          <Image style={styles.loadingLogo} source={require('./../../../assets/imgs/loading.png')} />
          <View style={styles.bottomButtonsArea}>
            <TouchableOpacity style={styles.button} onPress={this.createNewAccount.bind(this)}>
              <Text style={styles.buttonText}>CREATE NEW ACCOUNT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: 'white' }]}>
              <Text style={[styles.buttonText, { color: '#FF4444' }]}>ACCESS EXISTING ACCOUNT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    width: convertWidth(191),
    height: 49 * convertWidth(191) / 191,
    resizeMode: 'contain',
  },
  bottomButtonsArea: {
    position: "absolute",
    bottom: 0,

    width: '100%',
  },
  button: {
    height: 49,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4444',
  },
  buttonText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    color: 'white',
  },
});
