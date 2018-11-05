import React, { Component } from 'react';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, SafeAreaView,
} from 'react-native';

import Swiper from 'react-native-swiper';

import { convertWidth } from './../../utils';
import { config } from './../../configs';
import { Actions } from 'react-native-router-flux';
import { constants } from '../../constants';

export class HomeComponent extends Component {
  constructor(props) {
    super(props);
  }

  createNewAccount() {
    Actions.legal();
  }

  render() {
    return (
      <View style={styles.body}>
        <Swiper activeDotColor='#FF4444'
          scrollEnabled={true}
          showsPagination={true}
          showsButtons={false}
          buttonWrapperStyle={{ color: 'black' }}
          loop={false}
          paginationStyle={styles.swipePagination}
          ref={swiper => this.swiper = swiper}
          onIndexChanged={(index) => {
            this.setState({
              index: index,
            });
            if (this['player' + index] && this['player' + index].seek) {
              this['player' + index].seek(0);
            }
          }}
          dot={
            <View style={styles.swipeDotButton} />
          }>
          <View style={[styles.swipePage, { paddingBottom: 0 }]}>
            <Image style={styles.loadingLogo} source={require('./../../../assets/imgs/loading.png')} />
          </View>

          <View style={styles.swipePage}>
            <View style={styles.introductionImageArea}>
              <Image style={styles.onBoardingImage} source={require('./../../../assets/imgs/welcome1.png')} />
            </View>
            <View style={styles.introductionArea}>
              <Text style={[styles.introductionTitle]}>{i18n.t('HomeComponent_introductionTitle1').toUpperCase()}</Text>
              <Text style={[styles.introductionDescription]}>
                {i18n.t('HomeComponent_introductionDescription1')}
              </Text>
            </View>
          </View>

          <View style={styles.swipePage}>
            <View style={styles.introductionImageArea}>
              <Image style={styles.onBoardingImage} source={require('./../../../assets/imgs/welcome2.png')} />
            </View>
            <View style={styles.introductionArea}>
              <Text style={[styles.introductionTitle]}>{i18n.t('HomeComponent_introductionTitle2').toUpperCase()}</Text>
              <Text style={[styles.introductionDescription]}>
                {i18n.t('HomeComponent_introductionDescription2')}
              </Text>
            </View>
          </View>
          <View style={styles.swipePage}>
            <View style={styles.introductionImageArea}>
              <Image style={styles.onBoardingImage} source={require('./../../../assets/imgs/welcome3.png')} />
            </View>
            <View style={styles.introductionArea}>
              <Text style={[styles.introductionTitle]}>{i18n.t('HomeComponent_introductionTitle3').toUpperCase()}</Text>
              <Text style={[styles.introductionDescription]}>
                {i18n.t('HomeComponent_introductionDescription3')}
              </Text>
            </View>
          </View>

        </Swiper>

        <SafeAreaView style={styles.bottomButtonsAreaSafeView}>
          <View style={styles.bottomButtonsArea}>
            <TouchableOpacity style={[styles.button, { backgroundColor: 'white', borderWidth: 1, borderColor: '#FF4444', marginBottom: 15 }]} onPress={Actions.login}>
              <Text style={[styles.buttonText, { color: '#FF4444' }]}>{i18n.t('HomeComponent_buttonText1')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={this.createNewAccount.bind(this)}>
              <Text style={[styles.buttonText, { color: 'white' }]}>{i18n.t('HomeComponent_buttonText2')}</Text>
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
    backgroundColor: 'white',
  },
  swipeDotButton: {
    backgroundColor: '#C4C4C4',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  swipePagination: {
    position: 'absolute',
    bottom: 142 + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
  },

  swipePage: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    paddingBottom: 142 + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
  },
  onBoardingImage: {
    resizeMode: 'contain',
    width: convertWidth(145),
    height: 180 * convertWidth(145) / 145,
  },

  introductionArea: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    paddingLeft: convertWidth(49),
    paddingRight: convertWidth(49),
  },
  introductionTitle: {
    marginTop: 25,
    fontFamily: config.localization === 'vi-US' ? null : 'Avenir black',
    color: '#FF4444',
    fontSize: 17,
    fontWeight: '900',
    width: 275,
    textAlign: 'center',
  },
  introductionDescription: {
    marginTop: 15,
    fontFamily: config.localization === 'vi-US' ? null : 'Avenir light',
    fontWeight: '300',
    fontSize: 16,
    textAlign: 'center',
  },

  loadingLogo: {
    width: convertWidth(213),
    height: 45 * convertWidth(213) / 213,
    resizeMode: 'contain',
  },
  bottomButtonsAreaSafeView: {
    position: "absolute",
    bottom: 0,
    width: '100%',
  },
  bottomButtonsArea: {
    width: '100%',
    paddingLeft: convertWidth(20),
    paddingRight: convertWidth(20),
    paddingBottom: convertWidth(20),
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
    fontFamily: config.localization === 'vi-US' ? null : 'Avenir Black',
    fontWeight: '900',
    color: 'white',
  },
});
