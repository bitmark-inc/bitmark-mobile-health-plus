import React, { Component } from 'react';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, SafeAreaView, FlatList,
} from 'react-native';

import { convertWidth, runPromiseWithoutError } from './../../utils';
import { config } from './../../configs';
import { Actions } from 'react-native-router-flux';
import { constants } from '../../constants';
import { DataProcessor, AppProcessor } from '../../processors';
import { EventEmitterService } from '../../services';

export class OtherAccountsComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      accessAccounts: [],
    }
    runPromiseWithoutError(DataProcessor.doGetAccountAccesses('granted_from')).then(accessAccounts => {
      this.setState({ accessAccounts: accessAccounts || [] });
    });
  }

  selectAccount(accountNumber) {
    console.log('selectAccount :', accountNumber);
    AppProcessor.doSelectAccountAccess(accountNumber).then(result => {
      if (result) {
        Actions.reset('user');
      }
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  render() {
    console.log('accessAccounts ;', this.state.accessAccounts);
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.bodyContent} >
            <View style={styles.titleRow}>
              <Text style={styles.title}>View other accounts</Text>
              <TouchableOpacity onPress={Actions.pop} >
                <Image style={styles.closeIcon} source={require('./../../../assets/imgs/close_icon_red.png')} />
              </TouchableOpacity>
            </View>
            <View style={styles.content}>
              {this.state.accessAccounts && this.state.accessAccounts.length > 0 && <FlatList
                keyExtractor={(item, index) => index + ''}
                data={this.state.accessAccounts}
                extraData={this.state}
                renderItem={({ item }) => {
                  return (<TouchableOpacity style={styles.accountRow} onPress={() => this.selectAccount.bind(this)(item.grantor)}>
                    <Text style={styles.accountNumber}>
                      {'[' + item.grantor.substring(0, 4) + '...' + item.grantor.substring(item.grantor.length - 5, item.grantor.length) + ']'}
                    </Text>
                    <Image style={styles.accountRowIcon} source={require('./../../../assets/imgs/arrow_left_icon_red.png')} />
                  </TouchableOpacity>);
                }}
              />}
              {(!this.state.accessAccounts || this.state.accessAccounts.length === 0) && <View style={{ flex: 1, paddingTop: 50, }}>
                <Text style={{ fontFamily: 'Avenir Heavy', fontWeight: '800', fontSize: 16 }}>
                  NO ACCOUNTS AVAILABLE TO VIEW.
                </Text>
                <Text style={{ fontFamily: 'Avenir Heavy', fontWeight: '300', fontSize: 16, marginTop: 20, }}>
                  When someone grants access to their account, it will appear here for viewing.
                </Text>
              </View>}
            </View>
            <View style={styles.bottomButtonArea} >
              <TouchableOpacity style={styles.bottomButton} onPress={Actions.scanAccessQRCode} >
                <Text style={styles.bottomButtonText}>{'scan qr code'.toUpperCase()}</Text>
              </TouchableOpacity>
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
    borderColor: '#FF4444',
    width: "100%",
  },
  content: {
    padding: convertWidth(20),
    paddingTop: convertWidth(15),
    flexDirection: 'column',
    flex: 1,
  },
  title: {
    flex: 1,
    fontFamily: 'Avenir Light',
    fontWeight: '900',
    fontSize: 36,
    color: 'black',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: convertWidth(20),
    paddingTop: convertWidth(15),
    paddingBottom: 0,
  },
  closeIcon: {
    width: convertWidth(23),
    height: convertWidth(23),
    resizeMode: 'contain',
  },

  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountNumber: {
    fontFamily: 'Avenir Book',
    fontSize: 16,
    fontWeight: '300',
    color: '#464646',
  },
  accountRowIcon: {
    width: convertWidth(8),
    height: 14 * convertWidth(8) / 8,
    resizeMode: 'contain',
  },

  bottomButtonArea: {
    paddingLeft: convertWidth(20),
    paddingRight: convertWidth(20),
    paddingBottom: convertWidth(20),
  },
  bottomButton: {
    backgroundColor: '#FF4444',
    height: constants.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButtonText: {
    fontFamily: 'Avenir Light',
    fontWeight: '600',
    fontSize: 16,
    color: 'white'
  }


});
