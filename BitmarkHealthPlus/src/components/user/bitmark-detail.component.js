import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from "moment";
import {
  StyleSheet,
  Alert,
  Image, View, SafeAreaView, TouchableOpacity, Text, ScrollView,
} from 'react-native';

import { convertWidth, runPromiseWithoutError, } from './../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
import { EventEmitterService } from '../../services';
import { AppProcessor, DataProcessor } from '../../processors';
import { Actions } from 'react-native-router-flux';

let ComponentName = 'BitmarkDetailComponent';
export class BitmarkDetailComponent extends Component {
  static propTypes = {
    bitmarkType: PropTypes.string,
    bitmark: PropTypes.any,
  };
  constructor(props) {
    super(props);
    this.state = {
      filePath: '',
      content: '',
    }

    this.handerChangeUserDataBitmarks = this.handerChangeUserDataBitmarks.bind(this);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_BITMARKS, null, ComponentName);
    if (this.props.bitmark) {
      let accountDisplayed = DataProcessor.getAccountAccessSelected() || DataProcessor.getUserInformation().bitmarkAccountNumber;
      if (this.props.bitmarkType === 'bitmark_health_data') {
        let id = this.props.bitmark.id;
        if (accountDisplayed !== DataProcessor.getUserInformation().bitmarkAccountNumber) {
          let grantedInfo = DataProcessor.getGrantedAccessAccountSelected();
          id = grantedInfo.ids[this.props.bitmark.asset_id];
        }
        runPromiseWithoutError(AppProcessor.doDownloadHealthDataBitmark(id, {
          indicator: true, title: 'Loading...'
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
        let id = this.props.bitmark.id;
        if (accountDisplayed !== DataProcessor.getUserInformation().bitmarkAccountNumber) {
          let grantedInfo = DataProcessor.getGrantedAccessAccountSelected();
          id = grantedInfo.ids[this.props.bitmark.asset_id];
        }
        runPromiseWithoutError(AppProcessor.doDownloadBitmark(id, {
          indicator: true, title: 'Loading...'
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
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_BITMARKS, this.handerChangeUserDataBitmarks, ComponentName);
  }

  handerChangeUserDataBitmarks({ healthDataBitmarks, healthAssetBitmarks, bitmarkAccountNumber }) {
    console.log('handerChangeUserDataBitmarks user data bitmarks :', healthDataBitmarks, healthAssetBitmarks, bitmarkAccountNumber);
  }

  render() {
    console.log('this.state :', this.state, this.props)
    return (
      <SafeAreaView style={[styles.bodySafeView]}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            <View style={styles.titleRow}>
              {this.props.bitmarkType === 'bitmark_health_data' && <Text style={[styles.titleText]}>{moment(this.props.bitmark.asset.created_at).format('YYYY MMM DD').toUpperCase()}</Text>}
              {this.props.bitmarkType === 'bitmark_health_issuance' && <Text style={styles.titleText}>{moment(this.props.bitmark.asset.created_at).format('YYYY MMM DD').toUpperCase()}</Text>}
              <TouchableOpacity onPress={Actions.pop}>
                <Image style={styles.closeIcon} source={require('./../../../assets/imgs/back_icon_red.png')} />
              </TouchableOpacity>
            </View>
            <View style={styles.content}>
              <ScrollView style={styles.contentScroll} contentContainerStyle={{ flex: 1, }}>
                <Text style={styles.metadataTitle}>PUBLIC METADATA</Text>
                <Text style={styles.metadataMessage}>Visible to everyone</Text>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>{'Saved Time:   '.toUpperCase()}</Text>
                  <Text style={styles.metadataValue}>{this.props.bitmark.asset.metadata['Saved Time']}</Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>{'Source:   '.toUpperCase()}</Text>
                  <Text style={styles.metadataValue}>{this.props.bitmark.asset.metadata['Source']}</Text>
                </View>
                <Text style={styles.metadataTitle}>PRIVATE DATA:</Text>
                {this.props.bitmarkType === 'bitmark_health_issuance' && !!this.state.filePath &&
                  <TouchableOpacity style={styles.bitmarkImageArea} onPress={() => Actions.fullViewCaptureAsset({ filePath: this.state.filePath, bitmark: this.props.bitmark })}>
                    <Image style={styles.bitmarkImage} source={{ uri: this.state.filePath }} /></TouchableOpacity>}
                {this.props.bitmarkType === 'bitmark_health_data' && <ScrollView style={styles.bitmarkContent}>
                  <Text >{this.state.content}</Text>
                </ScrollView>}
              </ScrollView>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  bodySafeView: {
    flex: 1,
  },
  body: {
    padding: convertWidth(16),
    paddingTop: convertWidth(16) + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
    flex: 1,
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: "#FF4444",
    width: "100%",
    padding: convertWidth(20),
    paddingTop: convertWidth(15),
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 18,
    color: 'black',
  },
  closeIcon: {
    width: convertWidth(21),
    height: convertWidth(21),
    resizeMode: 'contain',
  },

  content: {
    flex: 1,
  },
  contentScroll: {
    flexDirection: 'column',
  },
  metadataTitle: {
    fontFamily: 'Avenir Medium',
    fontWeight: '700',
    fontSize: 16,
    marginTop: 21,
  },
  metadataMessage: {
    fontFamily: 'Avenir Medium',
    fontWeight: '300',
    fontSize: 14,
    color: '#999999',
    marginTop: 4,
    marginBottom: 24,
  },

  metadataRow: {
    flexDirection: 'row',
  },
  metadataLabel: {
    fontFamily: 'Avenir Medium',
    fontWeight: '300',
    fontSize: 14,
    color: '#999999'
  },
  metadataValue: {
    fontFamily: 'Avenir Medium',
    fontWeight: '300',
    fontSize: 14,
    color: '#999999'
  },

  bitmarkImageArea: {
    flex: 1,
  },
  bitmarkImage: {
    height: '100%',
    resizeMode: 'contain',
  },
  bitmarkContent: {
    padding: convertWidth(20),
    flex: 1,
  },

});