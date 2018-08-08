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
                <View style={welcomeComponentStyle.introductionImageArea}>
                  <Image style={welcomeComponentStyle.onBoardingImage} source={require('../../../../assets/imgs/welcome1.png')} />
                </View>
                <View style={welcomeComponentStyle.introductionArea}>
                  <Text style={[welcomeComponentStyle.introductionTitle]}>{'Create Property Around Your Health Data'.toUpperCase()}</Text>
                  <Text style={[welcomeComponentStyle.introductionDescription]}>
                    Bitmark Health protects the rights to your health data by registering it on a global public registry so that no other party can legally access it without your explicit permission.
                    </Text>
                </View>
              </View>
            )}
            footerHeight={115 + ios.constant.blankFooter}
            footer={(<View />)}
          />

          <BitmarkComponent
            backgroundColor='white'
            ref={(ref) => this.fullRef = ref}
            contentInScroll={true}
            content={(
              <View style={welcomeComponentStyle.swipePage}>
                <View style={welcomeComponentStyle.introductionImageArea}>
                  <Image style={welcomeComponentStyle.onBoardingImage} source={require('../../../../assets/imgs/welcome2.png')} />
                </View>
                <View style={welcomeComponentStyle.introductionArea}>
                  <Text style={[welcomeComponentStyle.introductionTitle]}>{'Registration is Private and Secure'.toUpperCase()}</Text>
                  <Text style={[welcomeComponentStyle.introductionDescription]}>
                    Registration is anonymous and your identity is completely protected. Only you hold the keys to link your identity to these records; Bitmark cannot view your encrypted data.
                    </Text>
                </View>
              </View>
            )}
            footerHeight={115 + ios.constant.blankFooter}
            footer={(<View />)}
          />

          <BitmarkComponent
            backgroundColor='white'
            ref={(ref) => this.fullRef = ref}
            contentInScroll={true}
            content={(
              <View style={welcomeComponentStyle.swipePage}>
                <View style={welcomeComponentStyle.introductionImageArea}>
                  <Image style={welcomeComponentStyle.onBoardingImage} source={require('../../../../assets/imgs/welcome3.png')} />
                </View>
                <View style={welcomeComponentStyle.introductionArea}>
                  <Text style={[welcomeComponentStyle.introductionTitle]}>{'Complete Control over Your Property'.toUpperCase()}</Text>
                  <Text style={[welcomeComponentStyle.introductionDescription]}>
                    Once health data is registered as your property, you will be able to donate, sell, or transfer it to another party (family member, university researcher, etc.) at your complete discretion.
                    </Text>
                </View>
              </View>
            )}
            footerHeight={115 + ios.constant.blankFooter}
            footer={(<View />)}
          />
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