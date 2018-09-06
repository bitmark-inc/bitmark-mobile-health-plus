import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from "moment";
import {
  StyleSheet,
  Alert,
  Image, View, SafeAreaView, TouchableOpacity, Text,
} from 'react-native';

import { convertWidth, runPromiseWithoutError, } from './../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
import { EventEmitterService } from '../../services';
import { AppProcessor } from '../../processors';
import { Actions } from 'react-native-router-flux';

let ComponentName = 'BitmarkDetailComponent';
export class BitmarkDetailComponent extends Component {
  static propTypes = {
    bitmarkType: PropTypes.string,
    bitmarkId: PropTypes.string,
    issuedAt: PropTypes.any,
  };
  constructor(props) {
    super(props);
    this.state = {
      filePath: '',
    }

    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, null, ComponentName);
    if (this.props.bitmarkId) {
      runPromiseWithoutError(AppProcessor.doDownloadBitmark(this.props.bitmarkId, {
        indicator: true, title: 'Encrypting and protecting your health data...'
      })).then(result => {
        console.log('result :', result);
        if (result && result.error) {
          Alert.alert('This record can not be accessed.', 'Once you delete your account, you wll not able to access the record again.', [{
            text: 'OK', onPress: Actions.pop
          }]);
          return;
        }
        this.setState({ filePath: result });
      });
    } else {
      Alert.alert('This record can not be accessed.', 'Once you delete your account, you wll not able to access the record again.', [{
        text: 'OK', onPress: Actions.pop
      }]);
    }
  }

  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange, ComponentName);
  }

  handerDonationInformationChange({ donationInformation }) {
    console.log('BitmarkDetailComponent handerDonationInformationChange donationInformation :', donationInformation)
  }


  render() {
    console.log('this.state :', this.state, this.props)
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            {this.props.bitmarkType === 'bitmark_health_data' && <Text style={styles.titleText}>Health data</Text>}
            {this.props.bitmarkType === 'bitmark_health_issuance' && <Text style={styles.titleText}>Issued on {moment(this.props.issuedAt).format('YYYY')}</Text>}
            <TouchableOpacity onPress={Actions.pop}>
              <Image style={styles.closeIcon} source={require('./../../../assets/imgs/close_icon_white.png')} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {this.props.bitmarkType === 'bitmark_health_issuance' && !!this.state.filePath &&
              <Image style={styles.bitmarkImageImage} source={{ uri: this.state.filePath }} />}
            {this.props.bitmarkType === 'bitmark_health_data' && <View>

            </View>}
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  bodySafeView: {
    flex: 1,
    backgroundColor: 'black',
  },
  body: {
    padding: convertWidth(16),
    paddingTop: convertWidth(16) + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 36,
    color: 'white',
  },
  closeIcon: {
    width: convertWidth(29),
    height: convertWidth(29),
    resizeMode: 'contain',
  },

  content: {
    flex: 1,
  },
  bitmarkImageImage: {
    height: '100%',
    resizeMode: 'contain',
  },


});