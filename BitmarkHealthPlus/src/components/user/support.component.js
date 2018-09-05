import React, { Component } from 'react';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, SafeAreaView, ScrollView,
} from 'react-native';
import { BitmarkLegalComponent } from './../../commons';


import { convertWidth } from './../../utils';
import { config } from './../../configs';
import { Actions } from 'react-native-router-flux';
import { constants } from '../../constants';

export class SupportComponent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <ScrollView style={styles.bodyContent} contentContainerStyle={styles.content}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Legal</Text>
              <TouchableOpacity onPress={Actions.pop}>
                <Image style={styles.closeIcon} source={require('./../../../assets/imgs/back_icon_red.png')} />
              </TouchableOpacity>
            </View>


            <TouchableOpacity style={styles.rowButton} onPress={() => Actions.legal({ displayedContentName: BitmarkLegalComponent.Contents.TermOfService.name })}>
              <Text style={styles.rowButtonText}>Terms of Service</Text>
              <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_red.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.rowButton} onPress={() => Actions.legal({ displayedContentName: BitmarkLegalComponent.Contents.PrivacyPolicy.name })}>
              <Text style={styles.rowButtonText}>Privacy Policy</Text>
              <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_red.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.rowButton} onPress={() => Actions.legal({ displayedContentName: BitmarkLegalComponent.Contents.KnowYourRights.name })}>
              <Text style={styles.rowButtonText}>Knows your right</Text>
              <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_red.png')} />
            </TouchableOpacity>
          </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeIcon: {
    width: convertWidth(21),
    height: convertWidth(21),
    resizeMode: 'contain',
  },

  rowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12.5,
    minHeight: 24.5,
  },
  rowButtonIcon: {
    width: convertWidth(8),
    height: 14 * convertWidth(8) / 8,
    resizeMode: 'contain',
  },
  rowButtonText: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 16,
  }


});
