import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, SafeAreaView, ScrollView, FlatList,
} from 'react-native';
import moment from "moment";

import { convertWidth, runPromiseWithoutError } from '../../utils';
import { constants } from '../../constants';
import { config } from '../../configs';
import { EventEmitterService } from '../../services';
import { DataProcessor, AppProcessor } from '../../processors';
import { Actions } from 'react-native-router-flux';

let ComponentName = 'BitmarkListComponent';
export class BitmarkListComponent extends Component {
  static propTypes = {
    bitmarkType: PropTypes.string
  };
  constructor(props) {
    super(props);

    this.handerChangeUserDataBitmarks = this.handerChangeUserDataBitmarks.bind(this);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_BITMARKS, null, ComponentName);
    this.state = {
      bitmarkList: [],
    };
    runPromiseWithoutError(DataProcessor.doGetUserDataBitmarks(DataProcessor.getAccountAccessSelected())).then(({ healthDataBitmarks, healthAssetBitmarks }) => {
      let bitmarkList = this.props.bitmarkType === 'bitmark_health_data' ? healthDataBitmarks :
        (this.props.bitmarkType === 'bitmark_health_issuance' ? healthAssetBitmarks : [])
      this.setState({ bitmarkList });
    });
  }

  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_BITMARKS, this.handerChangeUserDataBitmarks, ComponentName);
  }

  handerChangeUserDataBitmarks({ healthDataBitmarks, healthAssetBitmarks, bitmarkAccountNumber }) {
    console.log('handerChangeUserDataBitmarks user data bitmarks :', healthDataBitmarks, healthAssetBitmarks, bitmarkAccountNumber);
    let accountNumberDisplay = DataProcessor.getAccountAccessSelected() || DataProcessor.getUserInformation().bitmarkAccountNumber;
    if (accountNumberDisplay === bitmarkAccountNumber) {
      let bitmarkList = this.props.bitmarkType === 'bitmark_health_data' ? healthDataBitmarks :
        (this.props.bitmarkType === 'bitmark_health_issuance' ? healthAssetBitmarks : [])
      this.setState({ bitmarkList });
    }
  }

  goToDetailScreen(bitmark, bitmarkType) {
    Actions.bitmarkDetail({ bitmark, bitmarkType });
  }

  backToUserAccount() {
    AppProcessor.doSelectAccountAccess(DataProcessor.getUserInformation().bitmarkAccountNumber).then(result => {
      if (result) {
        Actions.reset('user');
      }
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  render() {
    let accountNumberDisplay = DataProcessor.getAccountAccessSelected() || DataProcessor.getUserInformation().bitmarkAccountNumber;
    let isCurrentUser = accountNumberDisplay === DataProcessor.getUserInformation().bitmarkAccountNumber;
    return (
      <View style={{ flex: 1, }}>
        {!isCurrentUser && <TouchableOpacity style={styles.accountNumberDisplayArea} onPress={this.backToUserAccount.bind(this)}>
          <Text style={styles.accountNumberDisplayText}>Viewing {'[' + accountNumberDisplay.substring(0, 4) + '...' + accountNumberDisplay.substring(accountNumberDisplay.length - 4, accountNumberDisplay.length) + ']'}, tap here to cancel.</Text>
        </TouchableOpacity>}
        <SafeAreaView style={styles.bodySafeView}>
          <View style={styles.body}>
            <View style={styles.bodyContent}>
              <View style={styles.titleRow}>
                {this.props.bitmarkType === 'bitmark_health_data' && <Text style={styles.titleText}>Health data</Text>}
                {this.props.bitmarkType === 'bitmark_health_issuance' && <Text style={styles.titleText}>Health records</Text>}
                <TouchableOpacity onPress={Actions.pop}>
                  <Image style={styles.closeIcon} source={require('./../../../assets/imgs/close_icon_red.png')} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.bitmarkList}>
                <FlatList
                  keyExtractor={(item, index) => index}
                  scrollEnabled={false}
                  data={this.state.bitmarkList}
                  extraData={this.state}
                  renderItem={({ item }) => {
                    return (<TouchableOpacity style={styles.bitmarkRow} onPress={() => this.goToDetailScreen.bind(this)(item, this.props.bitmarkType)} disabled={item.status === 'pending'}>
                      <Text style={styles.bitmarkRowText}>{item.asset.name + (item.asset.created_at ? (' - ' + moment(item.asset.created_at).format('YYYY MMM DD').toUpperCase()) : '')}</Text>
                      {item.status === 'confirmed' && <Image style={styles.bitmarkRowIcon} source={require('./../../../assets/imgs/arrow_left_icon_red.png')} />}
                      {item.status === 'pending' && <Text style={styles.bitmarkPending}>Registering ownership...</Text>}
                    </TouchableOpacity>);
                  }}
                />
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  accountNumberDisplayArea: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: convertWidth(32) + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
    paddingTop: (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
    backgroundColor: '#E6FF00',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountNumberDisplayText: {
    fontFamily: 'Avenir Heavy',
    fontWeight: '800',
    fontSize: 14,
  },
  bodySafeView: {
    flex: 1,
    backgroundColor: 'white',
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
    fontSize: 36,
  },
  closeIcon: {
    width: convertWidth(20),
    height: convertWidth(20),
    resizeMode: 'contain',
  },

  bitmarkList: {
    padding: convertWidth(6),
    marginTop: 30,
  },
  bitmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  bitmarkRowText: {
    fontFamily: 'Avenir Book',
    fontSize: 16,
    fontWeight: '300',
  },
  bitmarkRowIcon: {
    width: convertWidth(8),
    height: 14 * convertWidth(8) / 8,
    resizeMode: 'contain',
  },
  bitmarkPending: {
    fontFamily: 'Avenir Medium',
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '300',
    color: '#C1C1C1',
  }

});