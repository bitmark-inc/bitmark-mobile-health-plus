import React from 'react';
import {
  View, Text, Image, TouchableOpacity, SafeAreaView, ScrollView,
  Clipboard,
  StyleSheet,
  Linking,
} from 'react-native'

import { Actions } from 'react-native-router-flux';
import { config, } from 'src/configs';
import { convertWidth } from 'src/utils';
import { CacheData } from 'src/processors';
import { ShadowComponent, ShadowTopComponent } from 'src/views/commons';

export class AccountNumberComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = { copied: false };
  }
  render() {

    return (<View style={{ flex: 1, }}>
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerLeft} onPress={() => Actions.reset('user')}>
            <Image style={styles.headerLeftBackIcon} source={require('assets/imgs2/back_icon_black.png')} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <ShadowComponent style={styles.cardBody}>
            <ShadowTopComponent contentStyle={styles.cardHeader}>
              <Text style={styles.cardTitle}>ACCOUNT NUMBER</Text>
            </ShadowTopComponent>
            <Text style={styles.description}>{i18n.t('AccountNumberComponent_description')}</Text>
            <Text style={styles.fullAccountNumberLabel}>{i18n.t('AccountNumberComponent_fullAccountNumberLabel')}</Text>
            <TouchableOpacity style={styles.barLine} onPress={() => {
              Clipboard.setString(CacheData.userInformation.bitmarkAccountNumber);
              this.setState({ copied: true });
              setTimeout(() => this.setState({ copied: false }), 1000);
            }}>
              <Text style={styles.fullAccountNumberValue}>{CacheData.userInformation.bitmarkAccountNumber}</Text>
            </TouchableOpacity>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end', marginTop: 2, minHeight: 20, }}>
              {this.state.copied && <Text style={{ color: '#0064FC', fontFamily: 'Avenir Medium', fontSize: 14, fontWeight: '600', }}>{i18n.t('AccountNumberComponent_accountCopiedText')}</Text>}
            </View>
            <Text style={styles.shortAccountNumberLabel}>{i18n.t('AccountNumberComponent_shortAccountNumberLabel')}</Text>
            <View style={styles.barLine}>
              <Text style={styles.shortAccountNumberValue}>{'[' + CacheData.userInformation.bitmarkAccountNumber.substring(0, 4) + '...' + CacheData.userInformation.bitmarkAccountNumber.substring(CacheData.userInformation.bitmarkAccountNumber.length - 4, CacheData.userInformation.bitmarkAccountNumber.length) + ']'}</Text>
            </View>
          </ShadowComponent>
          <ShadowComponent style={styles.cardBody}>
            <TouchableOpacity style={styles.viewOnRegistryButton} onPress={() => {
              Linking.openURL(`${config.registry_server_url}/account/${CacheData.userInformation.bitmarkAccountNumber}`)
            }}>
              <Text style={styles.viewOnRegistryButtonText}>{i18n.t('AccountNumberComponent_viewOnRegistryButtonText')}</Text>
              <Image style={styles.viewOnRegistryButtonIcon} source={require('assets/imgs2/arrow_left_icon_black.png')} />
            </TouchableOpacity>
          </ShadowComponent>
        </ScrollView>
      </SafeAreaView>
    </View>
    );
  }
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    height: 56, width: '100%',
    flexDirection: 'row', alignItems: 'center',
  },
  headerLeft: {
    paddingLeft: convertWidth(19),
    width: convertWidth(35),
  },

  headerLeftBackIcon: {
    width: 16, height: '100%', resizeMode: 'contain',
  },
  content: {
    flexGrow: 1,
    padding: convertWidth(16),
    paddingTop: convertWidth(16),
  },
  cardBody: {
    flexDirection: 'column',
    marginTop: 16,
    width: convertWidth(344),
  },
  cardHeader: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',
    height: 40,
    paddingLeft: convertWidth(16), paddingRight: convertWidth(16),
  },
  cardTitle: {
    fontFamily: 'Avenir Light', fontSize: 10, fontWeight: '300',
  },

  description: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Light', color: 'rgba(0, 0, 0, 0.6)', fontSize: 14, fontWeight: '300',
    marginTop: 30,
    paddingLeft: convertWidth(16), paddingRight: convertWidth(16),
  },
  fullAccountNumberLabel: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Book', fontSize: 18, fontWeight: '700',
    marginTop: 25,
    paddingLeft: convertWidth(16), paddingRight: convertWidth(16),
  },
  fullAccountNumberValue: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Andale Mono',
    fontSize: 12,
    color: '#FF4444',
    marginTop: 10,
    paddingLeft: convertWidth(16), paddingRight: convertWidth(16),
  },
  barLine: {
    paddingBottom: 3,
    flex: 0,
    width: 'auto',
    alignSelf: 'flex-start',
  },
  shortAccountNumberLabel: {
    marginTop: 10,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Book', fontSize: 18, fontWeight: '700',
    paddingLeft: convertWidth(16), paddingRight: convertWidth(16),
  },
  shortAccountNumberValue: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Andale Mono', fontSize: 12,
    color: '#FF4444',
    marginTop: 10,
    height: 43,
    paddingLeft: convertWidth(16), paddingRight: convertWidth(16),
  },

  viewOnRegistryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minHeight: 43,
    paddingLeft: convertWidth(16), paddingRight: convertWidth(16), paddingTop: 9, paddingBottom: 9,
  },
  viewOnRegistryButtonIcon: {
    width: 12,
    height: 20,
    resizeMode: 'contain',
  },
  viewOnRegistryButtonText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Medium', color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: '700',
    fontSize: 18,
  }

});