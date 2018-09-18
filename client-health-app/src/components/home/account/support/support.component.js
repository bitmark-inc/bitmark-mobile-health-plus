import React from 'react';
import PropTypes from 'prop-types';
import Intercom from 'react-native-intercom';
import {
  View, Text, Image,
  Share,
  Alert,
  Linking
} from 'react-native';

// import Mailer from 'react-native-mail';
import { BitmarkComponent, BitmarkLegalComponent } from '../../../../commons/components';

import defaultStyle from '../../../../commons/styles';
import style from './support.component.style';
import { config } from "../../../../configs";
import { BitmarkOneTabButtonComponent } from '../../../../commons/components/bitmark-button';
// import { DataProcessor } from "../../../../processors";

export class SupportComponent extends React.Component {
  render() {
    return (
      <BitmarkComponent
        backgroundColor='#F5F5F5'
        header={(<View style={defaultStyle.header}>
          <BitmarkOneTabButtonComponent style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('./../../../../../assets/imgs/header_blue_icon.png')} />
          </BitmarkOneTabButtonComponent>
          <Text style={defaultStyle.headerTitle}>SUPPORT</Text>
          <BitmarkOneTabButtonComponent style={defaultStyle.headerRight} />
        </View>)}

        content={(<View style={style.body}>
          {/*LEGAL*/}
          <View style={[defaultStyle.itemContainer, style.headerItem]}>
            <Text style={defaultStyle.headerText}>LEGAL</Text>
          </View>

          <View style={defaultStyle.itemContainer}>
            <BitmarkOneTabButtonComponent onPress={() => {
              this.props.navigation.navigate('BitmarkLegal', {
                displayedContentName: BitmarkLegalComponent.Contents.TermOfService.name,
              })
            }}>
              <Text style={defaultStyle.text}>Terms of Service</Text>
            </BitmarkOneTabButtonComponent>
          </View>

          <View style={defaultStyle.itemContainer}>
            <BitmarkOneTabButtonComponent onPress={() => {
              this.props.navigation.navigate('BitmarkLegal', {
                displayedContentName: BitmarkLegalComponent.Contents.PrivacyPolicy.name,
              })
            }}>
              <Text style={defaultStyle.text}>Privacy Policy</Text>
            </BitmarkOneTabButtonComponent>
          </View>
          <View style={defaultStyle.itemContainer}>
            <BitmarkOneTabButtonComponent onPress={() => {
              this.props.navigation.navigate('BitmarkLegal', {
                displayedContentName: BitmarkLegalComponent.Contents.KnowYourRights.name,
              })
            }}>
              <Text style={defaultStyle.text}>Know Your Rights</Text>
            </BitmarkOneTabButtonComponent>
          </View>

          {/*ABOUT*/}
          <View style={[defaultStyle.itemContainer, defaultStyle.sectionContainer, style.headerItem]}>
            <Text style={defaultStyle.headerText}>ABOUT</Text>
          </View>

          <View style={defaultStyle.itemContainer}>
            <BitmarkOneTabButtonComponent onPress={() => this.rateApp()}>
              <Text style={defaultStyle.text}>App Store Rating & Review</Text>
            </BitmarkOneTabButtonComponent>
          </View>

          <View style={defaultStyle.itemContainer}>
            <BitmarkOneTabButtonComponent onPress={() => this.shareApp()}>
              <Text style={defaultStyle.text}>Share This App</Text>
            </BitmarkOneTabButtonComponent>
          </View>

          <View style={defaultStyle.itemContainer}>
            <BitmarkOneTabButtonComponent onPress={() => this.sendFeedback()}>
              <Text style={defaultStyle.text}>Send Feedback</Text>
            </BitmarkOneTabButtonComponent>
          </View>

          {/*POWERED BY*/}
          <View style={[defaultStyle.itemContainer, defaultStyle.sectionContainer, style.headerItem]}>
            <Text style={defaultStyle.headerText}>POWERED BY</Text>
          </View>

          <View style={defaultStyle.itemContainer}>
            <BitmarkOneTabButtonComponent onPress={() => this.props.navigation.navigate('BitmarkWebView', {
              title: 'Bitmark',
              sourceUrl: config.bitmark_web_site + '?env=app',
              hideBottomController: true,
              isFullScreen: true,
              showDoneButton: true
            })}>
              <Text style={defaultStyle.text}>Bitmark Inc.</Text>
            </BitmarkOneTabButtonComponent>
          </View>
        </View >
        )}
      />
    );
  }

  shareApp() {
    Share.share({ title: 'Bitmark', message: '', url: config.appLink });
  }

  rateApp() {
    Alert.alert('App Store Review', 'Positive App Store ratings and reviews help support Bitmark. How would you rate us?', [{
      text: '5 Stars!',
      style: 'cancel',
      onPress: () => {
        Linking.openURL(config.appLink)
      }
    }, {
      text: '4 Stars or less', onPress: this.sendFeedback,
    }]);
  }

  sendFeedback() {
    Intercom.displayMessageComposer();
    // Mailer.mail({
    //   subject: 'Suggestion for Bitmark Health',
    //   recipients: ['support@bitmark.com'],
    //   body: 'App version: ' + DataProcessor.getApplicationVersion() + ' (' + DataProcessor.getApplicationBuildNumber() + ')',
    // }, (error) => {
    //   if (error) {
    //     Alert.alert('Error', 'Could not send mail. Please send a mail to support@bitmark.com');
    //   }
    // });
  }
}

SupportComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func
  }),
};