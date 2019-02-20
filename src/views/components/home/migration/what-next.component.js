import React, { Component } from 'react';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, SafeAreaView
} from 'react-native';
import { Actions } from 'react-native-router-flux';

import { convertWidth } from 'src/utils';
import { ShadowTopComponent } from "../../../commons";
import PropTypes from 'prop-types';

export class WhatNextComponent extends Component {
  static propTypes = {
    twelveWords: PropTypes.any
  };

  constructor(props) {
    super(props);
    this.twelveWords = props.twelveWords;
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            {/*TOP AREA*/}
            <ShadowTopComponent style={{ height: 40 }} contentStyle={[styles.topArea, styles.paddingContent]}>
              <Text style={[styles.title]}>WHAT’S NEXT?</Text>
              <Image style={styles.logo} source={require('assets/imgs/info-icon.png')} />
            </ShadowTopComponent>

            {/*CONTENT*/}
            <View style={[styles.contentArea, styles.paddingContent]}>
              {/*DESC*/}
              <View style={styles.introductionTextArea}>
                <Text style={[styles.introductionDescription]}>
                  {
                  `Your account will be upgraded during a 5 minute process.\n\nPlease do not switch to another app during this time.\n\nAfter you create a new passphrase and log into your vault, your existing properties will be updated. No data or information will be lost in the process.`
                  }
                </Text>
              </View>
            </View>

            {/*BOTTOM AREA*/}
            <View style={[styles.bottomArea, styles.paddingContent]}>
              <Image style={styles.sliderIcon} source={require('assets/imgs/slider-icon-step-4.png')} />
              <TouchableOpacity style={[styles.buttonNext]} onPress={() => Actions.upgrade({twelveWords: this.twelveWords})}>
                <Text style={[styles.buttonText, { color: '#FF003C' }]}>BEGIN UPGRADE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: 'white',
    padding: convertWidth(16),
    paddingTop: convertWidth(16),
  },

  bodyContent: {
    flex: 1,
    backgroundColor: '#F4F2EE',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  paddingContent: {
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16)
  },

  topArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  contentArea: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  bottomArea: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'AvenirNextW1G-Light',
    fontSize: 10,
    letterSpacing: 1.5,
    color: 'rgba(0, 0, 0, 0.87)'
  },
  logo: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  introductionTextArea: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
  },
  introductionDescription: {
    marginTop: 56,
    fontFamily: 'AvenirNextW1G-Regular',
    fontSize: 17,
    lineHeight: 20,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'left',
    letterSpacing: 0.25,
  },
  buttonNext: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 16,
    color: '#FF003C',
  },
  buttonText: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 16,
    letterSpacing: 0.75,
  },
  sliderIcon: {
    width: 56,
    height: 8,
    resizeMode: 'contain',
    marginBottom: 4,
  },
});
