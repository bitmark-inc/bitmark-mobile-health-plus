import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image,
  StatusBar,
  Alert,
} from 'react-native';

import Swiper from 'react-native-swiper';

import welcomeComponentStyle from './welcome.component.style';
import { ios } from './../../../configs';
import { BitmarkComponent } from '../../../commons/components';

export class WelcomeComponent extends React.Component {
  constructor(props) {
    super(props);
    this.createNewAccount = this.createNewAccount.bind(this);
  }

  createNewAccount() {
    Alert.alert('Accept Terms', 'By creating an account, you agree to the Bitmark Health Terms of Service and Privacy Policy.', [{
      text: 'Read Terms',
      onPress: () => {
        // TODO
      }
    }, {
      text: 'Cancel',
    }, {
      text: 'Agree',
      style: 'cancel',
      onPress: () => {
        this.props.navigation.navigate('GetStart');
      }
    }]);
  }

  render() {
    return (
      <View style={welcomeComponentStyle.body}>
        <StatusBar hidden={true} />
        <Swiper activeDotColor='#0060F2'
          scrollEnabled={true}
          showsPagination={true}
          style={welcomeComponentStyle.swipeArea}
          showsButtons={false}
          buttonWrapperStyle={{ color: 'black' }}
          loop={false}
          paginationStyle={welcomeComponentStyle.swipePagination}
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
            <View style={welcomeComponentStyle.swipeDotButton} />
          }>

          <View style={[welcomeComponentStyle.swipePage, { justifyContent: 'center', }]}>
            <Image style={welcomeComponentStyle.welcomeLogo} source={require('./../../../../assets/imgs/loading-logo.png')} />
          </View>

          <BitmarkComponent
            backgroundColor='white'
            ref={(ref) => this.fullRef = ref}
            contentInScroll={true}
            content={(
              <View style={welcomeComponentStyle.swipePage}>
                <View style={welcomeComponentStyle.introductionArea}>
                  <Text style={[welcomeComponentStyle.introductionTitle]}>{'Own your HEALTH DATA'.toUpperCase()}</Text>
                  <Text style={[welcomeComponentStyle.introductionDescription]}>
                    You are the sole owner of your data.{'\n\n'}
                    Bitmark is a safe, easy way to aggregate health data from your devices, as well as traditional medical sources.
                    </Text>
                </View>

                <View style={welcomeComponentStyle.introductionImageArea}>
                  <Image style={welcomeComponentStyle.onBoardingImage} source={require('../../../../assets/imgs/card-berkeley.png')} />
                </View>
              </View>
            )} />

          <BitmarkComponent
            backgroundColor='white'
            ref={(ref) => this.fullRef = ref}
            contentInScroll={true}
            content={(
              <View style={welcomeComponentStyle.swipePage}>
                <View style={welcomeComponentStyle.introductionArea}>
                  <Text style={[welcomeComponentStyle.introductionTitle]}>CONTROL ACCESS</Text>
                  <Text style={[welcomeComponentStyle.introductionDescription]}>
                    Your health data is an asset that will grow more valuable over time.{'\n\n'}
                    Bitmark allows you to set rules for sharing and exchanging your data using  blockchain technology.
                    </Text>
                </View>

                <View style={welcomeComponentStyle.introductionImageArea}>
                  <Image style={welcomeComponentStyle.onBoardingImage} source={require('../../../../assets/imgs/card-berkeley.png')} />
                </View>
              </View>
            )} />

          <BitmarkComponent
            backgroundColor='white'
            ref={(ref) => this.fullRef = ref}
            contentInScroll={true}
            content={(
              <View style={welcomeComponentStyle.swipePage}>
                <View style={welcomeComponentStyle.introductionArea}>
                  <Text style={[welcomeComponentStyle.introductionTitle]}>HELP RESEARCH</Text>
                  <Text style={[welcomeComponentStyle.introductionDescription]}>
                    Your health data can be shared with researchers, to the benefit of the society.{'\n\n'}
                    Bitmark protects your privacy and shows you how your data is used.
                    </Text>
                </View>

                <View style={welcomeComponentStyle.introductionImageArea}>
                  <Image style={welcomeComponentStyle.onBoardingImage} source={require('../../../../assets/imgs/card-berkeley.png')} />
                </View>
              </View>
            )} />
        </Swiper>

        <View style={[welcomeComponentStyle.welcomeButtonArea]}>
          <TouchableOpacity style={[welcomeComponentStyle.welcomeButton,]} onPress={this.createNewAccount}>
            <Text style={[welcomeComponentStyle.welcomeButtonText,]}>{'CREATE NEW ACCOUNT'.toUpperCase()}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[welcomeComponentStyle.welcomeButton, {
            backgroundColor: '#F2FAFF',
            height: 45 + ios.constant.blankFooter / 2,
            paddingBottom: Math.max(10, ios.constant.blankFooter)
          }]} onPress={() => {
            this.props.navigation.navigate('SignIn');
          }}>
            <Text style={[welcomeComponentStyle.welcomeButtonText, { color: '#0060F2' }]}>{'ACCESS EXISTING ACCOUNT'.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

WelcomeComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }),
};