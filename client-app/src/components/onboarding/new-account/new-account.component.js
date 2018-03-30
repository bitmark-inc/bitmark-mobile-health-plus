import React from 'react';
import PropTypes from 'prop-types';
import Swiper from 'react-native-swiper';
import { StackNavigator, } from 'react-navigation';
import {
  View, Text, TouchableOpacity, Image,
  StatusBar,
  AppState,
  Platform,
} from 'react-native'
import Video from 'react-native-video';

import {
  BitmarkWebsiteComponent,
  BitmarkPrivacyComponent,
  BitmarkTermsComponent,
  FullComponent
} from './../../../commons/components';
import { androidDefaultStyle, iosDefaultStyle } from './../../../commons/styles';

import newAccountStyle from './new-account.component.style';

import { AppController } from '../../../managers';


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
      <FullComponent
        backgroundColor='white'
        ref={(ref) => this.fullRef = ref}
        header={(<View style={[defaultStyle.header, { backgroundColor: 'white' }]}></View>)}
        content={(
          <View style={newAccountStyle.swipePage}>
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
                this.props.screenProps.newAccountNavigation.navigate('FaceTouchId', { doContinue: this.props.screenProps.createBitmarkAccount });
              }}>
                <Text style={[newAccountStyle.letDoItButtonText]}>LET’S DO IT!</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    );
  }
}
PropertyPrivateYourDataComponent.propTypes = {
  screenProps: PropTypes.shape({
    newAccountNavigation: PropTypes.shape({
      navigate: PropTypes.func,
    }),
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
      <FullComponent
        backgroundColor='white'
        ref={(ref) => this.fullRef = ref}
        header={(<View style={[defaultStyle.header, { backgroundColor: 'white' }]}></View>)}
        content={(
          <View style={newAccountStyle.swipePage}>
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
        )}
      />
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
    return (
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
              console.log('index :', index);
              this.setState({
                index: index,
              });
              if (this['player' + index] && this['player' + index].seek) {
                this['player' + index].seek(0);
              }
            }}
            // width={'100%'}
            // height={'100%'}
            dot={
              <View style={newAccountStyle.swipeDotButton} />
            }>

            <FullComponent
              ref={(ref) => this.fullRef = ref}
              header={(<View style={[defaultStyle.header, { backgroundColor: 'white' }]}>
                <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => { this.props.navigation.goBack() }}>
                  <Image style={defaultStyle.headerLeftIcon} source={require('../../../../assets/imgs/header_blue_icon.png')} />
                </TouchableOpacity>
                <Text style={defaultStyle.headerTitle}></Text>
                <TouchableOpacity style={defaultStyle.headerRight}>
                </TouchableOpacity>
              </View>)}
              content={(
                <View style={newAccountStyle.swipePage}>
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
                </View>
              )}
            />

            <FullComponent
              ref={(ref) => this.fullRef = ref}
              header={(<View style={[defaultStyle.header, { backgroundColor: 'white' }]}></View>)}
              content={(
                <View style={newAccountStyle.swipePage}>
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
              )}
            />

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
              newAccountNavigation: this.props.navigation,
              createBitmarkAccount: AppController.doCreateNewAccount,
              setShowPagination: (show) => {
                this.setState({
                  showPagination: show,
                  scrollEnabled: show,
                })
              },
            }} />
          </Swiper>

          {this.state.index === 0 && <View style={[newAccountStyle.skipButtonArea]}>
            <TouchableOpacity style={[newAccountStyle.skipButton, { backgroundColor: 'white' }]} onPress={() => { this.swiper.scrollBy(3) }}>
              <Text style={[newAccountStyle.skipButtonText, { color: '#0060F2', fontSize: 14, fontWeight: '400' }]}>SKIP</Text>
            </TouchableOpacity>
          </View>}
        </View>
      </View>
    );
  }
}

NewAccountComponent.propTypes = {
  screenProps: PropTypes.shape({
    enableJustCreatedBitmarkAccount: PropTypes.func,
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