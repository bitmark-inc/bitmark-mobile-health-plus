import React from 'react';
import PropTypes from 'prop-types';
import Swiper from 'react-native-swiper';
import { StackNavigator, } from 'react-navigation';
import {
  View, Text, TouchableOpacity, Image,
  StatusBar,
  AppState,
  Platform,
  Dimensions,
} from 'react-native'
import Video from 'react-native-video';

import { AppScaleComponent } from './../../../commons/components';
import {
  BitmarkWebsiteComponent,
  BitmarkPrivacyComponent,
  BitmarkTermsComponent
} from './../../../commons/components';
import { androidDefaultStyle, iosDefaultStyle } from './../../../commons/styles';

import newAccountStyle from './new-account.component.style';
import {
  ios,
  // android // TODO
} from './../../../configs';

import { AppController } from '../../../managers';

let defaultWindowSize = Platform.select({
  ios: ios.constant.defaultWindowSize,
  android: Dimensions.get('window'), //TODO
});

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});

class PropertyPrivateYourDataComponent extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <View style={newAccountStyle.swipePage}>
        <View style={[defaultStyle.header, { backgroundColor: 'white' }]}></View>
        <Text style={[newAccountStyle.introductionTitle,]}>
          {'Property IS Privacy'.toUpperCase()}
        </Text>
        <Text style={[newAccountStyle.introductionDescription,]}>
          <Text style={[newAccountStyle.introductionDescription,]}>Bitmark gives you the power of privacy over your digital property. No third parties will have access to your data, including us. You choose who has access to your property.</Text>
        </Text>
        <View style={newAccountStyle.introductionTermPrivacy}>
          <Text style={newAccountStyle.bitmarkTermsPrivacyText}>By continuing, you agree to the Bitmark</Text>
          <View style={[newAccountStyle.termPrivacySecondLine]}>
            <TouchableOpacity onPress={() => {
              this.props.navigation.navigate('BitmarkTerms');
              this.props.screenProps.setShowPagination(false);
            }}>
              <Text style={[newAccountStyle.bitmarkTermsPrivacyButtonText]}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={newAccountStyle.bitmarkTermsPrivacyText}> and </Text>
            <TouchableOpacity onPress={() => {
              this.props.navigation.navigate('BitmarkPrivacy');
              this.props.screenProps.setShowPagination(false);
            }}>
              <Text style={[newAccountStyle.bitmarkTermsPrivacyButtonText]}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={newAccountStyle.bitmarkTermsPrivacyText}>.</Text>
          </View>
        </View>
        <View style={newAccountStyle.letDoItButtonArea}>
          <TouchableOpacity style={[newAccountStyle.letDoItButton]} onPress={() => {
            this.props.screenProps.createBitmarkAccount();
          }}>
            <Text style={[newAccountStyle.letDoItButtonText]}>LET’S DO IT!</Text>
          </TouchableOpacity>
        </View>
      </View >
    );
  }
}
PropertyPrivateYourDataComponent.propTypes = {
  screenProps: PropTypes.shape({
    createBitmarkAccount: PropTypes.func,
    setShowPagination: PropTypes.func,
  }),
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        justCreatedBitmarkAccount: PropTypes.bool,
      })
    })
  })
};

let FullPropertyPrivateYourDataComponent = StackNavigator({
  DonateYourData: { screen: PropertyPrivateYourDataComponent, },
  BitmarkTerms: { screen: BitmarkTermsComponent, },
  BitmarkPrivacy: { screen: BitmarkPrivacyComponent, },
}, {
    headerMode: 'none',
    mode: 'modal',
    navigationOptions: {
      gesturesEnabled: false,
    },
    cardStyle: {
      shadowOpacity: 0,
    }
  }
);


class BuildDigitalAssetComponent extends React.Component {
  constructor(props) {
    super(props)
  }

  componentWillReceiveProps(nexProps) {
    if (nexProps.screenProps && nexProps.screenProps.index === 2 && this.player2) {
      this.player2.seek(0);
    }
  }
  render() {
    return (
      <View style={newAccountStyle.swipePage}>
        <View style={[defaultStyle.header, { backgroundColor: 'white' }]}></View>
        <Text style={[newAccountStyle.introductionTitle]}>
          {'BUILD A DIGITAL ESTATE'.toUpperCase()}
        </Text>
        <Text style={[newAccountStyle.introductionDescription,]}>You can bitmark any type of data to build your digital estate: photos, music, videos, location data, documents, etc. If it’s digital, it can be bitmarked.</Text>
        <TouchableOpacity onPress={() => {
          this.props.screenProps.setShowPagination(false);
          this.props.navigation.navigate('BitmarkWebsite')
        }}
          style={newAccountStyle.introductionLinkButton}
        >
          <Text style={[newAccountStyle.introductionLink]}>LEARN MORE AT BITMARK.COM</Text>
        </TouchableOpacity>
        <View style={newAccountStyle.introductionImageArea}>
          <Video
            ref={(ref) => { this.player2 = ref }}
            rate={this.props.screenProps.index === 2 ? 1 : 0}
            source={require('./../../../../assets/videos/Digital-Estate.mp4')}
            resizeMode="contain"
            style={newAccountStyle.introductionImage}
          />
        </View>
      </View>
    );
  }
}

BuildDigitalAssetComponent.propTypes = {
  screenProps: PropTypes.shape({
    setShowPagination: PropTypes.func,
    index: PropTypes.number,
  }),
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        justCreatedBitmarkAccount: PropTypes.bool,
      })
    })
  })
};

let FullBuildDigitalAssetComponent = StackNavigator({
  BuildDigitalAsset: { screen: BuildDigitalAssetComponent, },
  BitmarkWebsite: { screen: BitmarkWebsiteComponent, },
}, {
    headerMode: 'none',
    mode: 'modal',
    navigationOptions: {
      gesturesEnabled: false,
    },
    cardStyle: {
      shadowOpacity: 0,
    }
  }
);

export class NewAccountComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.state = {
      showPagination: true,
      scrollEnabled: true,
      index: 0,
    };
  }
  componentDidMount() {
    if (this.appScaler) {
      this.appScaler.refreshScaling();
    }
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }
  handleAppStateChange(nextAppState) {
    if (nextAppState === 'active') {
      this.setState({
        index: this.state.index
      });
      if (this['player' + this.state.index] && this['player' + this.state.index].seek) {
        this['player' + this.state.index].seek(0);
      }
    }
  }

  render() {
    const createBitmarkAccount = () => {
      AppController.doCreateNewAccount().then((userInfo) => {
        if (userInfo) {
          this.props.navigation.navigate('Notification');
        }
      }).catch((error) => {
        console.log('createNewUser error :', error);
      });
    };
    return (
      <AppScaleComponent ref={(r) => { this.appScaler = r; }}>
        <View style={newAccountStyle.body}>
          <StatusBar hidden={false} />
          <View style={newAccountStyle.main}>
            <Swiper activeDotColor='#0060F2'
              scrollEnabled={this.state.scrollEnabled}
              showsPagination={this.state.showPagination} style={newAccountStyle.swipeArea} showsButtons={false}
              buttonWrapperStyle={{ color: 'black' }} loop={false}
              paginationStyle={newAccountStyle.swipePagination}
              ref={swiper => this.swiper = swiper}
              onIndexChanged={(index) => {
                this.setState({
                  index: index,
                });
                if (this['player' + index] && this['player' + index].seek) {
                  this['player' + index].seek(0);
                }
              }}
              width={defaultWindowSize.width}
              height={defaultWindowSize.height}
              dot={
                <View style={newAccountStyle.swipeDotButton} />
              }>

              <View style={newAccountStyle.swipePage}>
                <View style={[defaultStyle.header, { backgroundColor: 'white' }]}>
                  <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => { this.props.navigation.goBack() }}>
                    <Image style={defaultStyle.headerLeftIcon} source={require('../../../../assets/imgs/header_back_icon_study_setting.png')} />
                  </TouchableOpacity>
                  <Text style={defaultStyle.headerTitle}></Text>
                  <TouchableOpacity style={defaultStyle.headerRight}>
                  </TouchableOpacity>
                </View>

                <Text style={[newAccountStyle.introductionTitle]}>OWN YOUR DATA</Text>
                <Text style={[newAccountStyle.introductionDescription,]}>
                  Your personal data is a valuable digital asset. Bitmark makes it simple to take advantage of this value by giving you tools to claim ownership of your data.
              </Text>
                <View style={newAccountStyle.introductionImageArea}>
                  <Video
                    ref={(ref) => { this.player0 = ref }}
                    rate={this.state.index === 0 ? 1 : 0}
                    source={require('./../../../../assets/videos/Own-Your-Data.mp4')}
                    resizeMode="contain"
                    style={newAccountStyle.introductionImage}
                  />
                </View>
                <View style={[newAccountStyle.skipButtonArea]}>
                  <TouchableOpacity style={[newAccountStyle.skipButton, { backgroundColor: 'white' }]} onPress={() => { this.swiper.scrollBy(3) }}>
                    <Text style={[newAccountStyle.skipButtonText, { color: '#0060F2', fontSize: 14, fontWeight: '400' }]}>SKIP</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={newAccountStyle.swipePage}>
                <View style={[defaultStyle.header, { backgroundColor: 'white' }]}></View>
                <Text style={[newAccountStyle.introductionTitle]}>{'authenticate property'.toUpperCase()}</Text>
                <Text style={[newAccountStyle.introductionDescription,]}>
                  Your data is authenticated by ‘bitmarking’ and recording to the Bitmark blockchain. The blockchain holds secure and verifiable records of ownership of digital assets.
              </Text>
                <View style={newAccountStyle.introductionImageArea}>
                  <Video
                    ref={(ref) => { this.player1 = ref }}
                    rate={this.state.index === 1 ? 1 : 0}
                    source={require('./../../../../assets/videos/Verify-Ownership-2.mp4')}
                    resizeMode="contain"
                    style={newAccountStyle.introductionImage}
                  />
                </View>
              </View>

              <FullBuildDigitalAssetComponent ref={(ref) => { this.player2 = ref }}
                screenProps={{
                  index: this.state.index,
                  setShowPagination: (show) => {
                    this.setState({
                      showPagination: show,
                      scrollEnabled: show,
                    })
                  }
                }}
              />
              <FullPropertyPrivateYourDataComponent screenProps={{
                createBitmarkAccount: createBitmarkAccount,
                setShowPagination: (show) => {
                  this.setState({
                    showPagination: show,
                    scrollEnabled: show,
                  })
                },
              }} />
            </Swiper>
          </View>
        </View>
      </AppScaleComponent>
    );
  }
}

NewAccountComponent.propTypes = {
  screenProps: PropTypes.shape({
    enableJustCreatedBitmarkAccount: PropTypes.func,
    refreshScaling: PropTypes.func,
  }),
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        justCreatedBitmarkAccount: PropTypes.bool,
      })
    })
  })
};