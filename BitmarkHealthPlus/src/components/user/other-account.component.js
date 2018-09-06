import React, { Component } from 'react';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, SafeAreaView, ScrollView,
} from 'react-native';

import { convertWidth } from './../../utils';
import { config } from './../../configs';
import { Actions } from 'react-native-router-flux';
import { constants } from '../../constants';

export class OtherAccountsComponent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.bodyContent} >
            <View style={styles.titleRow}>
              <Text style={styles.title}>View other accounts</Text>
              <TouchableOpacity onPress={Actions.pop}>
                <Image style={styles.closeIcon} source={require('./../../../assets/imgs/close_icon_red.png')} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.content}>

            </ScrollView>
            <View style={styles.bottomButtonArea} >
              <TouchableOpacity style={styles.bottomButton} >
                <Text style={styles.bottomButtonText}>{'scan qr code'.toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  bodySafeView: {
    flex: 1,
    backgroundColor: 'white',
  },
  body: {
    padding: convertWidth(16),
    paddingTop: convertWidth(16) + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
    flex: 1,
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#FF4444',
    width: "100%",
  },
  content: {
    padding: convertWidth(20),
    flexDirection: 'column',
    flex: 1,
  },
  title: {
    fontFamily: 'Avenir Light',
    fontWeight: '900',
    fontSize: 34,
    color: '#464646',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: convertWidth(20),
    paddingBottom: 0,
  },
  closeIcon: {
    width: convertWidth(40),
    height: convertWidth(40),
    resizeMode: 'contain',
  },

  bottomButtonArea: {
    paddingLeft: convertWidth(20),
    paddingRight: convertWidth(20),
    paddingBottom: convertWidth(20),
  },
  bottomButton: {
    backgroundColor: '#FF4444',
    height: constants.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButtonText: {
    fontFamily: 'Avenir Light',
    fontWeight: '600',
    fontSize: 16,
    color: 'white'
  }


});
