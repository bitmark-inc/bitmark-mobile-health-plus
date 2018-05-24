import React from 'react';
import PropTypes from 'prop-types';
import Swiper from 'react-native-swiper';
import { StackNavigator, } from 'react-navigation';
import Hyperlink from 'react-native-hyperlink'
import {
  View, Text, TouchableOpacity, Image,
  StatusBar,
  AppState,
} from 'react-native'
import Video from 'react-native-video';

import {
  BitmarkWebViewComponent,
  BitmarkComponent
} from './../../../commons/components';
import defaultStyle from './../../../commons/styles';

import newAccountStyle from './new-account.component.style';

import { AppProcessor } from '../../../processors';


class PropertyPrivateYourDataComponent extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <BitmarkComponent
        backgroundColor='white'
        ref={(ref) => this.fullRef = ref}
        header={(<View style={[defaultStyle.header, { backgroundColor: 'white' }]}></View>)}
        contentInScroll={true}
        content={(
          <View style={newAccountStyle.swipePage}>
            <View style={newAccountStyle.introductionArea}>
              <Text style={[newAccountStyle.introductionTitle,]}>
                {'Property IS Privacy'.toUpperCase()}
              </Text>
              <Text style={[newAccountStyle.introductionDescription,]}>
                <Text style={[newAccountStyle.introductionDescription,]}>
                  Bitmark gives you the power of privacy over your digital property. No third parties will have access to your data, including us. You choose who has access to your property.
                  </Text>
              </Text>
              <View style={newAccountStyle.introductionTermPrivacy}

              >
                <Hyperlink
                  onPress={(url, text) => {
                    if (url === 'https://bitmark.com/privacy') {
                      this.props.navigation.navigate('BitmarkWebView', { title: 'Privacy Policy', sourceUrl: 'https://bitmark.com/privacy', isFullScreen: true, });
                      this.props.screenProps.setShowPagination(false);
                    } else if (url === 'https://bitmark.com/term') {
                      this.props.navigation.navigate('BitmarkWebView', { title: 'Terms of Service', sourceUrl: 'https://bitmark.com/term', isFullScreen: true, });
                      this.props.screenProps.setShowPagination(false);
                    }

                  }}
                  linkStyle={newAccountStyle.bitmarkTermsPrivacyButtonText}
                  linkText={url => url === 'https://bitmark.com/term' ? 'Terms of Service' : (url === 'https://bitmark.com/privacy' ? 'Privacy Policy' : '')}>
                  <Text style={newAccountStyle.bitmarkTermsPrivacyText}>By continuing, you agree to the Bitmark https://bitmark.com/privacy and https://bitmark.com/term</Text>
                </Hyperlink>
              </View>
            </View>
          </View>
        )}
        footerHeight={45}
        footer={(<View style={newAccountStyle.letDoItButtonArea}>
          <TouchableOpacity style={[newAccountStyle.letDoItButton]} onPress={() => {
            this.props.screenProps.newAccountNavigation.navigate('FaceTouchId', { doContinue: this.props.screenProps.createBitmarkAccount });
          }}>
            <Text style={[newAccountStyle.letDoItButtonText]}>LET’S DO IT!</Text>
          </TouchableOpacity>
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
  BitmarkWebView: { screen: BitmarkWebViewComponent, },
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
      <BitmarkComponent
        backgroundColor='white'
        ref={(ref) => this.fullRef = ref}
        header={(<View style={[defaultStyle.header, { backgroundColor: 'white' }]}></View>)}
        contentInScroll={true}
        content={(
          <View style={newAccountStyle.swipePage}>
            <View style={newAccountStyle.introductionArea}>
              <Text style={[newAccountStyle.introductionTitle]}>
                {'BUILD A DIGITAL ESTATE'.toUpperCase()}
              </Text>
              <Text style={[newAccountStyle.introductionDescription,]}>You can bitmark any type of data to build your digital estate: photos, music, videos, location data, documents, etc. If it’s digital, it can be bitmarked.</Text>
              <TouchableOpacity onPress={() => {
                this.props.screenProps.setShowPagination(false);
                this.props.navigation.navigate('BitmarkWebView', { title: 'Bitmark', sourceUrl: 'https://bitmark.com', isFullScreen: true, })
              }}
                style={newAccountStyle.introductionLinkButton}
              >
                <Text style={[newAccountStyle.introductionLink]}>LEARN MORE AT BITMARK.COM</Text>
              </TouchableOpacity>
            </View>
            <View style={newAccountStyle.introductionImageArea}>
              <Video
                ref={(ref) => { this.player2 = ref }}
                rate={this.props.screenProps.index === 2 ? 1 : 0}
                source={require('./../../../../assets/videos/Digital-Estate.mp4')}
                resizeMode="contain"
                style={newAccountStyle.introductionImage}
                muted={true}
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
  BitmarkWebView: { screen: BitmarkWebViewComponent, },
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

            <BitmarkComponent
              backgroundColor='white'
              ref={(ref) => this.fullRef = ref}
              header={(<View style={[defaultStyle.header, { backgroundColor: 'white' }]}>
                <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => { this.props.navigation.goBack() }}>
                  <Image style={defaultStyle.headerLeftIcon} source={require('../../../../assets/imgs/header_blue_icon.png')} />
                </TouchableOpacity>
                <Text style={defaultStyle.headerTitle}></Text>
                <TouchableOpacity style={defaultStyle.headerRight}>
                </TouchableOpacity>
              </View>)}
              contentInScroll={true}
              content={(
                <View style={newAccountStyle.swipePage}>
                  <View style={newAccountStyle.introductionArea}>
                    <Text style={[newAccountStyle.introductionTitle]}>OWN YOUR DATA</Text>
                    <Text style={[newAccountStyle.introductionDescription,]}>
                      Your personal data is a valuable asset. Bitmark is a set of tools that allows you to record property rights for your digital assets and to later transfer those property rights.
                    </Text>
                  </View>
                  <View style={newAccountStyle.introductionImageArea}>
                    <Video
                      ref={(ref) => { this.player0 = ref }}
                      rate={this.state.index === 0 ? 1 : 0}
                      source={require('./../../../../assets/videos/Own-Your-Data.mp4')}
                      resizeMode="contain"
                      style={newAccountStyle.introductionImage}
                      muted={true}
                    />
                  </View>
                </View>
              )}
            />

            <BitmarkComponent
              backgroundColor='white'
              ref={(ref) => this.fullRef = ref}
              header={(<View style={[defaultStyle.header, { backgroundColor: 'white' }]}></View>)}
              contentInScroll={true}
              content={(
                <View style={newAccountStyle.swipePage}>
                  <View style={newAccountStyle.introductionArea}>
                    <Text style={[newAccountStyle.introductionTitle]}>{'REGISTER PROPERTY RIGHTS'.toUpperCase()}</Text>
                    <Text style={[newAccountStyle.introductionDescription,]}>
                      Property rights are registered through a process known as “bitmarking“. The Bitmark blockchain records these rights and their availability (or lack thereof).
                  </Text>
                  </View>
                  <View style={newAccountStyle.introductionImageArea}>
                    <Video
                      ref={(ref) => { this.player1 = ref }}
                      rate={this.state.index === 1 ? 1 : 0}
                      source={require('./../../../../assets/videos/Verify-Ownership-2.mp4')}
                      resizeMode="contain"
                      style={newAccountStyle.introductionImage}
                      muted={true}
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
                },
                isFullScreen: true
              }}
            />
            <FullPropertyPrivateYourDataComponent screenProps={{
              newAccountNavigation: this.props.navigation,
              createBitmarkAccount: AppProcessor.doCreateNewAccount,
              setShowPagination: (show) => {
                this.setState({
                  showPagination: show,
                  scrollEnabled: show,
                })
              },
              isFullScreen: true
            }} />
          </Swiper>

          {this.state.index === 0 && <View style={[newAccountStyle.skipButtonArea]}>
            <TouchableOpacity style={[newAccountStyle.skipButton]} onPress={() => { this.swiper.scrollBy(3) }}>
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