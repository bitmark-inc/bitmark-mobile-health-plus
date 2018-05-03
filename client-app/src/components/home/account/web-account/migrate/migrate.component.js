import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity, Image,
} from 'react-native';
import Camera from 'react-native-camera';

import componentStyle from './migrate.component.style';

import defaultStyles from '../../../../../commons/styles';
// import { config } from '../../../../../configs/index';
import { DataController } from '../../../../../managers';

// import {
//   ios,
//   android // TODO
// } from '../../../../configs';
// let constant = Platform.select({
//   ios: ios.constant,
//   android: android.constant
// });

const STEPS = {
  scan: 0,
  confirm: 1,
  done: 2
}

export class WebAccountMigrateComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      step: STEPS.scan,
      userInformation: DataController.getUserInformation(),
    };
  }

  goBack() {
    if (this.state.step === STEPS.scan || this.state.step === STEPS.done) {
      this.props.navigation.goBack();
    } else {
      this.setState({ step: this.state.step - 1 });
    }
  }
  onBarCodeRead(scanData) {
    console.log('scanData :', scanData);
    this.setState({ step: STEPS.confirm });
  }

  render() {
    return (<View style={componentStyle.body}>
      <View style={componentStyle.header}>
        <TouchableOpacity style={defaultStyles.headerLeft} onPress={this.goBack.bind(this)} >
          <Image style={defaultStyles.headerLeftIcon} source={require('./../../../../../../assets/imgs/header_blue_icon.png')} />
        </TouchableOpacity>
        {this.state.step === STEPS.scan && <Text style={defaultStyles.headerTitle}>{'Migrate Web Account'.toUpperCase()}</Text>}
        {this.state.step === STEPS.confirm && <Text style={defaultStyles.headerTitle}>CONFIRM MIGRATION</Text>}
        {this.state.step === STEPS.done && <Text style={defaultStyles.headerTitle}>CHECK YOUR EMAIL</Text>}
        <TouchableOpacity style={defaultStyles.headerRight} />
      </View>
      {this.state.step === STEPS.scan && <View style={componentStyle.bodyContent}>
        <Text style={componentStyle.scanMessage}>Visit https://a.bitmark.com and sign in your web account. Click ”Migrate web account” and then scan the QR code.</Text>
        <Camera style={componentStyle.scanCamera} aspect={Camera.constants.Aspect.fill} onBarCodeRead={this.onBarCodeRead.bind(this)} />
      </View>}

      {this.state.step === STEPS.confirm && <View style={componentStyle.bodyContent}>
        <View style={componentStyle.confirmMessageArea}>
          <Text style={componentStyle.comfirmMessageText}>All the properties in this account will be transferred to the account:</Text>
          <Text style={componentStyle.comfirmAccountNumber}>{this.state.userInformation.bitmarkAccountNumber}</Text>
          <Text style={componentStyle.comfirmMessageText}>on your mobile device.</Text>
        </View>
        <TouchableOpacity style={componentStyle.comfirmButton} onPress={() => {
          this.setState({ step: STEPS.done });
        }}>
          <Text style={componentStyle.comfirmButtonText}>CONFIRM</Text>
        </TouchableOpacity>
      </View>}

      {this.state.step === STEPS.done && <View style={componentStyle.bodyContent}>
        <View style={componentStyle.confirmMessageArea}>
          <Text style={componentStyle.comfirmMessageText}>We’ve sent an email to: </Text>
          <Text style={componentStyle.comfirmAccountNumber}>{this.state.email || 'your@email.com'}</Text>
          <Text style={componentStyle.comfirmMessageText}>Follow the link in that email to authorize this migration.</Text>
        </View>
      </View>}

    </View>);
  }
}

WebAccountMigrateComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  })
};