import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider, connect } from 'react-redux';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, SafeAreaView, ScrollView, FlatList, Share,
} from 'react-native';

import { convertWidth, isFileRecord, isImageFile, isPdfFile } from '../../utils';
import { constants } from '../../constants';
import { config } from '../../configs';
// import { EventEmitterService } from '../../services';
// import { DataProcessor, AppProcessor } from '../../processors';
import { Actions } from 'react-native-router-flux';
import { UserBitmarksStore, UserBitmarksActions } from '../../stores/user-bitmarks.store';
import { MaterialIndicator } from 'react-native-indicators';
import moment from 'moment';

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

  // backToUserAccount() {
  //   AppProcessor.doSelectAccountAccess(DataProcessor.getUserInformation().bitmarkAccountNumber).then(result => {
  //     if (result) {
  //       Actions.reset('user');
  //     }
  //   }).catch(error => {
  //     EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
  //   });
  // }


  downloadBitmark(asset) {
    if (asset.filePath) {
      Share.share({ title: i18n.t('BitmarkListComponent_shareTitle'), url: asset.filePath }).then(() => {
      }).catch(error => {
        console.log('Share error:', error);
      })
    }
  }

  render() {
    // let accountNumberDisplay = DataProcessor.getAccountAccessSelected() || DataProcessor.getUserInformation().bitmarkAccountNumber;
    // let isCurrentUser = accountNumberDisplay === DataProcessor.getUserInformation().bitmarkAccountNumber;

    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {/* {!isCurrentUser && <TouchableOpacity style={styles.accountNumberDisplayArea} onPress={this.backToUserAccount.bind(this)}>
          <Text style={styles.accountNumberDisplayText}>
            {i18n.t('BitmarkListComponent_accountNumberDisplayText', { accountNumber: accountNumberDisplay.substring(0, 4) + '...' + accountNumberDisplay.substring(accountNumberDisplay.length - 4, accountNumberDisplay.length) })}
          </Text>
        </TouchableOpacity>} */}
        <SafeAreaView style={styles.bodySafeView}>
          <View style={styles.body}>
            <View style={styles.bodyContent}>
              <View style={styles.titleRow}>
                <TouchableOpacity style={styles.closeButton} onPress={() => Actions.reset('user')}>
                  <Image style={styles.closeIcon} source={require('./../../../assets/imgs/back_icon_red.png')} />
                </TouchableOpacity>
                {this.props.bitmarkType === 'bitmark_health_data' &&
                  <Text style={styles.titleText}>{i18n.t('BitmarkListComponent_titleText1')}</Text>}
                {this.props.bitmarkType === 'bitmark_health_issuance' &&
                  <Text style={styles.titleText}>{i18n.t('BitmarkListComponent_titleText2')}</Text>}
              </View>

              {(this.props.bitmarkType === 'bitmark_health_data') ? (
                // HEALTH DATA RECORDS
                <ScrollView style={styles.bitmarkHealthList}>
                  <FlatList
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    data={this.props.healthDataBitmarks || []}
                    extraData={this.props}
                    renderItem={({ item }) => {
                      return (
                        <TouchableOpacity style={styles.bitmarkHealthRow} onPress={() => {
                          this.goToDetailScreen.bind(this)(item, this.props.bitmarkType);
                        }}>
                          <Text style={styles.bitmarkHealthRowText}>{item.asset.name + (item.asset.created_at ? (' - ' + moment(item.asset.created_at).format('YYYY MMM DD').toUpperCase()) : '')}</Text>
                          {item.status === 'confirmed' && <Image style={styles.bitmarkHealthRowIcon} source={require('./../../../assets/imgs/arrow_left_icon_red.png')} />}
                          {item.status === 'pending' && <Text style={styles.bitmarkHealthPending}>{i18n.t('BitmarkListComponent_bitmarkPending')}</Text>}
                        </TouchableOpacity>
                      );
                    }}
                  />
                </ScrollView>
              ) : (
                  // ASSET RECORDS
                  <ScrollView style={styles.bitmarkList}>
                    <FlatList
                      contentContainerStyle={[styles.bitmarksContainer]}
                      keyExtractor={(item) => item.id}
                      scrollEnabled={false}
                      data={this.props.healthAssetBitmarks || []}
                      extraData={this.props}
                      renderItem={({ item }) => {
                        return (
                          <TouchableOpacity style={styles.bitmarkItem} onPress={() => {
                            if (isFileRecord(item.asset) && !isImageFile(item.asset.filePath) && !isPdfFile(item.asset.filePath)) {
                              this.downloadBitmark.bind(this)(item.asset)
                            } else {
                              this.goToDetailScreen.bind(this)(item, this.props.bitmarkType);
                            }
                          }}>
                            {item && item.thumbnail && item.thumbnail.exists ?
                              <View>
                                <Image style={styles.bitmarkThumbnail} source={{ uri: `${item.thumbnail.path}` }} />
                                {item.thumbnail.multiple &&
                                  <Image style={styles.multipleFilesIcon} source={require('./../../../assets/imgs/multiple_files_icon.png')} />
                                }
                              </View>
                              :
                              <Image style={styles.bitmarkThumbnail} source={require('./../../../assets/imgs/unknown_file_type_icon.png')} />
                            }

                            {item.status === 'pending' && <View style={[styles.bitmarkThumbnail, styles.thumbnailPendingCover]} />}
                            {item.status === 'pending' && <MaterialIndicator style={styles.indicator} color={'white'} size={32} />}
                            {item.status === 'pending' && <Text style={styles.bitmarkPending}>{i18n.t('BitmarkListComponent_bitmarkPending')}</Text>}
                          </TouchableOpacity>
                        );
                      }}
                    />
                  </ScrollView>
                )
              }
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  // accountNumberDisplayArea: {
  //   position: 'absolute',
  //   top: 0,
  //   width: '100%',
  //   height: convertWidth(32) + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
  //   paddingTop: (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
  //   backgroundColor: '#E6FF00',
  //   zIndex: 10,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  // accountNumberDisplayText: {
  //   fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Heavy',
  //   fontWeight: '800',
  //   fontSize: 14,
  // },
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
    height: 54,
    width: '100%',
    borderBottomColor: '#FF4444', borderBottomWidth: 1,
  },
  titleText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Black',
    fontWeight: '900',
    fontSize: 24,
    marginTop: 6,
    flex: 1,
  },
  closeButton: {
    height: '100%',
    paddingRight: convertWidth(8),
    paddingLeft: convertWidth(15),
    alignItems: 'center', justifyContent: 'center',
  },
  closeIcon: {
    width: convertWidth(21),
    height: convertWidth(21),
    resizeMode: 'contain',
  },

  bitmarkList: {
    padding: 3
  },
  bitmarkPending: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Medium',
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '300',
    color: 'white',
    position: 'absolute',
    top: 67,
    zIndex: 2,
  },
  bitmarksContainer: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  bitmarkItem: {
    flex: 1,
    padding: 4,
    alignItems: 'center'
  },
  bitmarkThumbnail: {
    width: convertWidth(103),
    height: convertWidth(103),
    resizeMode: 'stretch'
  },
  thumbnailPendingCover: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    position: 'absolute',
    top: 4,
    zIndex: 1,
  },
  multipleFilesIcon: {
    width: 14,
    height: 17,
    resizeMode: 'contain',
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 2,
  },
  indicator: {
    position: 'absolute',
    top: convertWidth(35),
    left: convertWidth(35),
    zIndex: 2,
  },

  bitmarkHealthList: {
    padding: convertWidth(20),
    paddingTop: 10,
  },

  bitmarkHealthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  bitmarkHealthRowText: {
    fontFamily: 'Avenir Book',
    fontSize: 16,
    fontWeight: '300',
    paddingRight: 5,
    flex: 1
  },
  bitmarkHealthRowIcon: {
    width: convertWidth(8),
    height: 14 * convertWidth(8) / 8,
    resizeMode: 'contain',
  },
  bitmarkHealthPending: {
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
