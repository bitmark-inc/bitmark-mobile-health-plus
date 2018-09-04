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
            <Text style={styles.title}>SUPPORT</Text>

            <Text style={styles.legalTitle}>SUPPORT</Text>

            <TouchableOpacity style={styles.rowButton} onPress={() => Actions.legal({ displayedContentName: BitmarkLegalComponent.Contents.TermOfService.name })}>
              <Text style={styles.rowButtonText}>Terms of Service</Text>
              <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_black.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.rowButton} onPress={() => Actions.legal({ displayedContentName: BitmarkLegalComponent.Contents.PrivacyPolicy.name })}>
              <Text style={styles.rowButtonText}>Privacy Policy</Text>
              <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_black.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.rowButton} onPress={() => Actions.legal({ displayedContentName: BitmarkLegalComponent.Contents.KnowYourRights.name })}>
              <Text style={styles.rowButtonText}>Knows your right</Text>
              <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_black.png')} />
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
  legalTitle: {
    fontFamily: 'Avenir Medium',
    fontWeight: '800',
    fontSize: 16,
    color: '#6D6D72',
    marginTop: 54,
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
    width: convertWidth(14),
    height: 8 * convertWidth(14) / 14,
    resizeMode: 'contain',
  },
  rowButtonText: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 16,
  }


});
