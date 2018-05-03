import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity, Image,
} from 'react-native';
import Camera from 'react-native-camera';

import componentStyle from './sign-in.component.style';

import defaultStyles from '../../../../../commons/styles';
import { DataController, AppController } from '../../../../../managers';
import { EventEmiterService } from '../../../../../services';

export class WebAccountSignInComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userInformation: DataController.getUserInformation(),
    };
  }

  onBarCodeRead(scanData) {
    AppController.doSignInOnWebApp(scanData.data).catch(error => {
      console.log('doSignInOnWebApp error:', error);
      EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR, { message: 'Cannot sign in this Bitmark account. Please try again later.' });
    });
  }

  render() {
    return (<View style={componentStyle.body}>
      <View style={componentStyle.header}>
        <TouchableOpacity style={defaultStyles.headerLeft} onPress={() => this.props.navigation.goBack()} >
          <Image style={defaultStyles.headerLeftIcon} source={require('./../../../../../../assets/imgs/header_blue_icon.png')} />
        </TouchableOpacity>
        <Text style={defaultStyles.headerTitle}>{'Web account sign in'.toUpperCase()}</Text>
        <TouchableOpacity style={defaultStyles.headerRight} />
      </View>
      <View style={componentStyle.bodyContent}>
        <Text style={componentStyle.scanMessage}>Visit https://a.bitmark.com. Click ”SIGN IN WITH MOBILE APP” and then scan the QR code.</Text>
        <Camera style={componentStyle.scanCamera} aspect={Camera.constants.Aspect.fill} onBarCodeRead={this.onBarCodeRead.bind(this)} />
      </View>
    </View>);
  }
}

WebAccountSignInComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  })
};