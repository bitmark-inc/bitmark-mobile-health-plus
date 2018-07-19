import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, TouchableOpacity, Image,
} from 'react-native';
import Hyperlink from 'react-native-hyperlink';
import Camera from 'react-native-camera';

import componentStyle from './migrate.component.style';

import defaultStyles from '../../../../../commons/styles';
// import { config } from '../../../../../configs/index';
import { DataProcessor, AppProcessor } from '../../../../../processors';
import { EventEmitterService } from '../../../../../services';

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
      userInformation: DataProcessor.getUserInformation(),
      token: '',
    };
    this.scanned = false;
  }

  goBack() {
    if (this.state.step === STEPS.scan || this.state.step === STEPS.done) {
      this.props.navigation.goBack();
    } else {
      this.setState({ step: this.state.step - 1 });
    }
  }
  onBarCodeRead(scanData) {
    if (this.scanned) {
      return;
    }
    this.scanned = true;
    let tempArray = scanData.data.split('|');
    if (tempArray && tempArray.length === 2 && tempArray[0] === 'qr_account_migration') {
      this.setState({ step: STEPS.confirm, token: scanData.data });
    } else {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {
        message: 'QR code is invalid! ',
        onClose: this.props.navigation.goBack
      });
    }
  }

  onConfirmMigration() {
    AppProcessor.doMigrateWebAccount(this.state.token).then(result => {
      if (result) {
        this.setState({ step: STEPS.done, email: result.email });
      }
    }).catch(error => {
      console.log('doMigrateWebAccount error:', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { message: 'This account cannot be migrated now. Try again later.' });
    });
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
        <Hyperlink
          linkStyle={{ color: '#0060F2', }}
          linkText={url => url}
        >
          <Text style={componentStyle.scanMessage}>Visit https://a.bitmark.com and sign in your web account. Click ”Migrate web account” and then scan the QR code.</Text>
        </Hyperlink>
        <Camera style={componentStyle.scanCamera} aspect={Camera.constants.Aspect.fill} onBarCodeRead={this.onBarCodeRead.bind(this)} />
      </View>}

      {this.state.step === STEPS.confirm && <View style={componentStyle.bodyContent}>
        <View style={componentStyle.confirmMessageArea}>
          <Text style={componentStyle.confirmMessageText}>All the properties in this account will be transferred to the account:</Text>
          <Text style={componentStyle.confirmAccountNumber}>{this.state.userInformation.bitmarkAccountNumber}</Text>
          <Text style={componentStyle.confirmMessageText}>on your mobile device.</Text>
        </View>
        <TouchableOpacity style={componentStyle.confirmButton} onPress={this.onConfirmMigration.bind(this)}>
          <Text style={componentStyle.confirmButtonText}>CONFIRM</Text>
        </TouchableOpacity>
      </View>}

      {this.state.step === STEPS.done && <View style={componentStyle.bodyContent}>
        <View style={componentStyle.confirmMessageArea}>
          <Text style={componentStyle.confirmMessageText}>We’ve sent an email to: </Text>
          <Text style={componentStyle.confirmAccountNumber}>{this.state.email || 'your@email.com'}</Text>
          <Text style={componentStyle.confirmMessageText}>Follow the link in that email to authorize this migration.</Text>
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