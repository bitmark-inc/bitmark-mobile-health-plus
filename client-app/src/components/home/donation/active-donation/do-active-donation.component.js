import React from 'react';
import PropTypes from 'prop-types';
import Swiper from 'react-native-swiper';
import {
  View, Image, Text, TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';

import { convertWidth } from './../../../../utils';
import {
  ios,
  android // TODO
} from './../../../../configs';
let constant = Platform.select({
  ios: ios.constant,
  android: android.constant
});
import { androidDefaultStyle, iosDefaultStyle } from './../../../../commons/styles';
let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});
import activeDonationStyle from './do-active-donation.component.style';

import { DataController } from '../../../../managers';

let currentSize = Dimensions.get('window');

export class DoActiveDonationComponent extends React.Component {
  constructor(props) {
    super(props);
    this.doActiveDonation = this.doActiveDonation.bind(this);
    this.state = {
      user: DataController.getUserInformation(),
    }
  }

  doActiveDonation() {

  }

  render() {
    return (<View style={activeDonationStyle.body}>
      <Swiper activeDotColor='#0060F2'
        ref={swiper => this.swiper = swiper}
        showsButtons={false}
        loop={false}
        scrollEnabled={false}
        paginationStyle={activeDonationStyle.swipePagination}
        width={convertWidth(375)}
        height={currentSize.height - constant.headerSize.paddingTop - constant.bottomTabsHeight}
        dot={
          <View style={activeDonationStyle.swipeDotButton} />
        }>
        <View style={activeDonationStyle.swipePage}>
          <View style={activeDonationStyle.content}>
            <Text style={activeDonationStyle.title}>{'your bitmark account number'.toUpperCase()}</Text>
            <Text style={activeDonationStyle.description}>
              To protect your privacy, you are identified in the Bitmark system by an anonymous public account number. You can safely share this public account number with others without compromising your account security. You can always view this in your account settings.
            </Text>
            <View style={activeDonationStyle.bitmarkAccountArea}>
              <Text style={activeDonationStyle.bitmarkAccountText}>{this.state.user.bitmarkAccountNumber}</Text>
            </View>
            <View style={activeDonationStyle.bottomButtonArea}>
              <TouchableOpacity style={activeDonationStyle.bottomButton} onPress={() => { this.swiper.scrollBy(1) }}>
                <Text style={activeDonationStyle.bottomButtonText}>CONTINUE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={activeDonationStyle.swipePage}>
          <View style={[defaultStyle.header, { backgroundColor: 'white' }]}>
            <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.swiper.scrollBy(-1)}>
              <Image style={defaultStyle.headerLeftIcon} source={require('./../../../../../assets/imgs/header_blue_icon.png')} />
            </TouchableOpacity>
            <Text style={defaultStyle.headerTitle} />
            <TouchableOpacity style={defaultStyle.headerRight} />
          </View>

          <View style={activeDonationStyle.content}>
            <Text style={[activeDonationStyle.title, { marginTop: 31 }]}>{'bitmark your health data'.toUpperCase()}</Text>
            <Text style={activeDonationStyle.description}>Please allow Bitmark to access your Health app data. We recommend selecting “Turn All Categories On” so that you can claim full ownership of all your health data. We cannot read or record your data. This process will be encrypted and only available on your device and your Bitmark account.</Text>

            <View style={activeDonationStyle.accessIconArea}>
              <Image style={activeDonationStyle.accessIcon} source={require('./../../../../../assets/imgs/icon_health.png')} />
              <Image style={activeDonationStyle.accessIconPlus} source={require('./../../../../../assets/imgs/+.png')} />
              <Image style={activeDonationStyle.accessIcon} source={require('./../../../../../assets/imgs/bitmark-logo.png')} />
            </View>

            <View style={activeDonationStyle.bottomButtonArea}>
              <TouchableOpacity style={[activeDonationStyle.bottomButton, {
                backgroundColor: 'white', borderColor: '#0060F2', borderWidth: 1,
              }]} onPress={() => this.props.navigation.goBack()}>
                <Text style={[activeDonationStyle.bottomButtonText, { color: '#0060F2' }]}>I WILL DO IT LATER.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={activeDonationStyle.bottomButton} onPress={this.doActiveDonation}>
                <Text style={activeDonationStyle.bottomButtonText}>GOT IT. LET’S BITMARK!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Swiper>
    </View>);
  }
}

DoActiveDonationComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
}