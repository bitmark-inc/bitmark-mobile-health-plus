import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image,
  StatusBar,
} from 'react-native';

import Swiper from 'react-native-swiper';

import welcomeComponentStyle from './welcome.component.style';
import { ios } from './../../../configs';
import { BitmarkComponent } from '../../../commons/components';
import defaultStyle from "../../../commons/styles";
import {BitmarkOneTabButtonComponent} from "../../../commons/components/bitmark-button";

export class WelcomeComponent extends React.Component {
  constructor(props) {
    super(props);
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

          {/*ONBOARDING SCREEN 1*/}
          <BitmarkComponent
            backgroundColor='white'
            ref={(ref) => this.fullRef = ref}
            header={(<View style={[defaultStyle.header, { backgroundColor: 'white' }]}>
              <BitmarkOneTabButtonComponent style={defaultStyle.headerLeft} />
              <BitmarkOneTabButtonComponent style={defaultStyle.headerRight} onPress={() => this.swiper.scrollBy(this.swiper.props.children.length - 1)}>
                <Text style={defaultStyle.headerRightText}>SKIP</Text>
              </BitmarkOneTabButtonComponent>
            </View>)}
            content={(
              <View style={welcomeComponentStyle.swipePage}>
                <View style={welcomeComponentStyle.swipePageContent}>
                  <View style={welcomeComponentStyle.swipePageMainContent}>
                    <View style={welcomeComponentStyle.introductionArea}>
                      <Text style={[welcomeComponentStyle.introductionTitle]}>CREATE PROPERTY AROUND YOUR HEALTH DATA</Text>
                      <Text style={[welcomeComponentStyle.introductionDescription]}>
                        Bitmark Health protects the rights to your health data by registering it on a global public registry so that no other party can legally access it without your explicit permission.
                      </Text>
                    </View>

                    <View style={welcomeComponentStyle.introductionImageArea}>
                      <Image style={welcomeComponentStyle.onBoardingImage} source={require('../../../../assets/imgs/welcome1.png')} />
                    </View>
                  </View>
                </View>
              </View>
            )}
            footerHeight={45 + ios.constant.blankFooter}
            footer={(<View />)}
          />

          {/*ONBOARDING SCREEN 2*/}
          <BitmarkComponent
            backgroundColor='white'
            ref={(ref) => this.fullRef = ref}
            header={(<View style={[defaultStyle.header, { backgroundColor: 'white' }]}></View>)}
            content={(
              <View style={welcomeComponentStyle.swipePage}>
                <View style={welcomeComponentStyle.swipePageContent}>
                  <View style={welcomeComponentStyle.swipePageMainContent}>
                    <View style={welcomeComponentStyle.introductionArea}>
                      <Text style={[welcomeComponentStyle.introductionTitle]}>REGISTRATION IS PRIVATE AND SECURE</Text>
                      <Text style={[welcomeComponentStyle.introductionDescription]}>
                        Registration is anonymous and your identity is completely protected. Only you hold the keys to link your identity to these records; Bitmark cannot view your encrypted data.
                      </Text>
                    </View>
                    <View style={welcomeComponentStyle.introductionImageArea}>
                      <Image style={welcomeComponentStyle.onBoardingImage} source={require('../../../../assets/imgs/welcome2.png')} />
                    </View>
                  </View>
                </View>
              </View>
            )}
            footerHeight={45 + ios.constant.blankFooter}
            footer={(<View />)}
          />

          {/*ONBOARDING SCREEN 3*/}
          <BitmarkComponent
            backgroundColor='white'
            ref={(ref) => this.fullRef = ref}
            header={(<View style={[defaultStyle.header, { backgroundColor: 'white' }]}></View>)}
            content={(
              <View style={welcomeComponentStyle.swipePage}>
                <View style={welcomeComponentStyle.swipePageContent}>
                  <View style={welcomeComponentStyle.swipePageMainContent}>
                    <View style={welcomeComponentStyle.introductionArea}>
                      <Text style={[welcomeComponentStyle.introductionTitle]}>COMPLETE CONTROL OVER YOUR PROPERTY</Text>
                      <Text style={[welcomeComponentStyle.introductionDescription]}>
                        Once health data is registered as your property, you will be able to donate, sell, or transfer it to another party (family member, university researcher, etc.) at your complete discretion.
                      </Text>
                    </View>
                    <View style={welcomeComponentStyle.introductionImageArea}>
                      <Image style={welcomeComponentStyle.onBoardingImage} source={require('../../../../assets/imgs/welcome3.png')} />
                    </View>
                  </View>
                </View>
              </View>
            )}
            footerHeight={45 + ios.constant.blankFooter}
            footer={(<View style={[welcomeComponentStyle.doneButtonArea]}>
              <BitmarkOneTabButtonComponent style={[welcomeComponentStyle.doneButton,]} onPress={() => this.props.navigation.navigate('NewAccount')}>
                <Text style={[welcomeComponentStyle.doneButtonText,]}>DONE</Text>
              </BitmarkOneTabButtonComponent>
            </View>)}
          />
        </Swiper>
      </View>
    );
  }
}

WelcomeComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }),
};