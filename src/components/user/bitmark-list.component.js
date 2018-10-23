import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, SafeAreaView, ScrollView, FlatList, Share,
} from 'react-native';
import moment from "moment";

import { convertWidth } from '../../utils';
import { constants } from '../../constants';
import { config } from '../../configs';
import { EventEmitterService } from '../../services';
import { DataProcessor, AppProcessor } from '../../processors';
import { Actions } from 'react-native-router-flux';
import { UserBitmarksStore, UserBitmarksActions } from '../../stores/user-bitmarks.store';

class PrivateBitmarkListComponent extends Component {
  static propTypes = {
    bitmarkType: PropTypes.string,
    healthDataBitmarks: PropTypes.array,
    healthAssetBitmarks: PropTypes.array,
  };
  constructor(props) {
    super(props);
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


  downloadBitmark(bitmarkId, assetId, fileName) {
    let id = bitmarkId;
    let accountDisplayed = DataProcessor.getAccountAccessSelected() || DataProcessor.getUserInformation().bitmarkAccountNumber;
    if (accountDisplayed !== DataProcessor.getUserInformation().bitmarkAccountNumber) {
      let grantedInfo = DataProcessor.getGrantedAccessAccountSelected();
      id = grantedInfo.ids[assetId];
    }

    AppProcessor.doDownloadBitmark(id, {
      indicator: true, title: i18n.t('BitmarkListComponent_downloadTitle'), message: i18n.t('BitmarkListComponent_downloadMessage', { fileName })
    }).then((filePath) => {
      Share.share({ title: i18n.t('BitmarkListComponent_shareTitle'), url: filePath }).then(() => {
      }).catch(error => {
        console.log('Share error:', error);
      })
    }).catch(error => {
      console.log('Download bitmark error:', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  render() {
    let accountNumberDisplay = DataProcessor.getAccountAccessSelected() || DataProcessor.getUserInformation().bitmarkAccountNumber;
    let isCurrentUser = accountNumberDisplay === DataProcessor.getUserInformation().bitmarkAccountNumber;
    let isFileRecord = (bitmark) => { return bitmark.asset.metadata.Source === 'Medical Records' };

    return (
      <View style={{ flex: 1, }}>
        {!isCurrentUser && <TouchableOpacity style={styles.accountNumberDisplayArea} onPress={this.backToUserAccount.bind(this)}>
          <Text style={styles.accountNumberDisplayText}>
            {i18n.t('BitmarkListComponent_accountNumberDisplayText', { accountNumber: accountNumberDisplay.substring(0, 4) + '...' + accountNumberDisplay.substring(accountNumberDisplay.length - 4, accountNumberDisplay.length) })}
          </Text>
        </TouchableOpacity>}
        <SafeAreaView style={styles.bodySafeView}>
          <View style={styles.body}>
            <View style={styles.bodyContent}>
              <View style={styles.titleRow}>
                {this.props.bitmarkType === 'bitmark_health_data' && <Text style={styles.titleText}>{i18n.t('BitmarkListComponent_titleText1')}</Text>}
                {this.props.bitmarkType === 'bitmark_health_issuance' && <Text style={styles.titleText}>{i18n.t('BitmarkListComponent_titleText2')}</Text>}
                <TouchableOpacity style={styles.closeButton} onPress={Actions.pop}>
                  <Image style={styles.closeIcon} source={require('./../../../assets/imgs/close_icon_red.png')} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.bitmarkList}>
                <FlatList
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  data={this.props.bitmarkType === 'bitmark_health_data' ? this.props.healthDataBitmarks :
                    (this.props.bitmarkType === 'bitmark_health_issuance' ? this.props.healthAssetBitmarks : [])}
                  extraData={this.props}
                  renderItem={({ item, index }) => {
                    return (<TouchableOpacity style={[styles.bitmarkRow, { marginTop: index === 0 ? 5 : 15 }]} onPress={() => isFileRecord(item) ? this.downloadBitmark.bind(this)(item.id, item.asset.id, item.asset.name) : this.goToDetailScreen.bind(this)(item, this.props.bitmarkType)} disabled={item.status === 'pending'}>
                      <Text style={styles.bitmarkRowText}>{item.asset.name + (item.asset.created_at ? (' - ' + moment(item.asset.created_at).format('YYYY MMM DD').toUpperCase()) : '')}</Text>
                      {item.status === 'confirmed' && <Image style={styles.bitmarkRowIcon} source={require('./../../../assets/imgs/arrow_left_icon_red.png')} />}
                      {item.status === 'pending' && <Text style={styles.bitmarkPending}>{i18n.t('BitmarkListComponent_bitmarkPending')}</Text>}
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
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: convertWidth(20),
    paddingTop: 0,
    paddingRight: 0,
    width: '100%',
  },
  titleText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 36,
    flex: 1,
  },
  closeButton: {
    paddingTop: convertWidth(26),
    paddingBottom: convertWidth(26),
    paddingRight: convertWidth(24),
    paddingLeft: convertWidth(50),
  },
  closeIcon: {
    width: convertWidth(21),
    height: convertWidth(21),
    resizeMode: 'contain',
  },

  bitmarkList: {
    padding: convertWidth(26),
    paddingTop: 0,
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
    paddingRight: 5,
    flex: 1
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

const StoreBitmarkListComponent = connect(
  (state) => state.data,
)(PrivateBitmarkListComponent);

export class BitmarkListComponent extends Component {
  static propTypes = {
    bitmarkType: PropTypes.string
  };

  constructor(props) {
    super(props);
    UserBitmarksStore.dispatch(UserBitmarksActions.updateBitmarkType(this.props.bitmarkType));
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Provider store={UserBitmarksStore}>
          <StoreBitmarkListComponent />
        </Provider>
      </View>
    );
  }
}
