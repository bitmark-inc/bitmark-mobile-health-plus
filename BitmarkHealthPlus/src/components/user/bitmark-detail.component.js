import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from "moment";
import {
  StyleSheet,
  Alert,
  Image, View, SafeAreaView, TouchableOpacity, Text,
} from 'react-native';

import { convertWidth, runPromiseWithoutError, FileUtil, } from './../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
import { EventEmitterService } from '../../services';
import { AppProcessor, DataProcessor } from '../../processors';
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
      content: '',
    }

    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, null, ComponentName);
    if (this.props.bitmarkId) {
      if (this.props.bitmarkType === 'bitmark_health_data') {
        runPromiseWithoutError(AppProcessor.doDownloadHealthDataBitmark(this.props.bitmarkId, {
          indicator: true, title: 'Encrypting and protecting your health data...'
        })).then(result => {
          console.log('result :', result);
          if (result && result.error) {
            Alert.alert('This record can not be accessed.', 'Once you delete your account, you wll not able to access the record again.', [{
              text: 'OK', onPress: Actions.pop
            }]);
            return;
          }
          this.setState({ content: JSON.stringify(JSON.parse(result), null, 2) });
          // this.setState({ content: JSON.stringify(DataProcessor.getUserInformation(), null, 2) });
        });
      } else if (this.props.bitmarkType === 'bitmark_health_issuance') {
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
        Actions.pop();
      }
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
      <SafeAreaView style={[styles.bodySafeView, { backgroundColor: this.props.bitmarkType === 'bitmark_health_data' ? 'white' : 'black' }]}>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            {this.props.bitmarkType === 'bitmark_health_data' && <Text style={[styles.titleText, { color: 'black' }]}>{moment(this.props.issuedAt).format('YYYY MMM DD').toUpperCase()}</Text>}
            {this.props.bitmarkType === 'bitmark_health_issuance' && <Text style={styles.titleText}>{moment(this.props.issuedAt).format('YYYY MMM DD').toUpperCase()}</Text>}
            <TouchableOpacity onPress={Actions.pop}>
              {this.props.bitmarkType === 'bitmark_health_data' && <Image style={styles.closeIcon} source={require('./../../../assets/imgs/close_icon_red.png')} />}
              {this.props.bitmarkType === 'bitmark_health_issuance' && <Image style={styles.closeIcon} source={require('./../../../assets/imgs/close_icon_white.png')} />}
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {this.props.bitmarkType === 'bitmark_health_issuance' && !!this.state.filePath &&
              <Image style={styles.bitmarkImage} source={{ uri: this.state.filePath }} />}
            {this.props.bitmarkType === 'bitmark_health_data' && <View style={styles.bitmarkContent}>
              <Text >{this.state.content}</Text>
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
    width: convertWidth(30),
    height: convertWidth(30),
    resizeMode: 'contain',
  },

  content: {
    flex: 1,
  },
  bitmarkImage: {
    height: '100%',
    resizeMode: 'contain',
  },
  bitmarkContent: {
    padding: convertWidth(20),
  },

});