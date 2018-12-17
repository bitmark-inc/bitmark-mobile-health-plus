import React from 'react';
import {
  View, Text, Image, TouchableOpacity, SafeAreaView, ScrollView,
  Clipboard,
  StyleSheet,
  Linking,
} from 'react-native'

import { DataProcessor } from '../../processors';
import { Actions } from 'react-native-router-flux';
import { convertWidth } from '../../utils';
import { constants } from '../../constants';
import { config } from '../../configs';

export class AccountNumberComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = { copied: false };
  }
  render() {

    return (<View style={{ flex: 1, }}>
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.body}>
          <View style={[styles.bodyContent]} >
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>{i18n.t('AccountNumberComponent_titleText')}</Text>
              {/* <Text style={styles.titleText}>Account{'\n'}number</Text> */}
              <TouchableOpacity onPress={Actions.pop}>
                <Image style={styles.closeIcon} source={require('./../../../assets/imgs/back_icon_red.png')} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

              <Text style={styles.description}>{i18n.t('AccountNumberComponent_description')}</Text>
              <Text style={styles.fullAccountNumberLabel}>{i18n.t('AccountNumberComponent_fullAccountNumberLabel')}</Text>
              <TouchableOpacity style={styles.barLine} onPress={() => {
                Clipboard.setString(DataProcessor.getUserInformation().bitmarkAccountNumber);
                this.setState({ copied: true });
                setTimeout(() => this.setState({ copied: false }), 1000);
              }}>
                <Text style={styles.fullAccountNumberValue}>{DataProcessor.getUserInformation().bitmarkAccountNumber}</Text>
              </TouchableOpacity>
              <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end', marginTop: 9, minHeight: 20, }}>
                {this.state.copied && <Text style={{ color: '#0064FC', fontFamily: 'Avenir Medium', fontSize: 14, fontWeight: '600', }}>{i18n.t('AccountNumberComponent_accountCopiedText')}</Text>}
              </View>
              <Text style={styles.shortAccountNumberLabel}>{i18n.t('AccountNumberComponent_shortAccountNumberLabel')}</Text>
              <View style={styles.barLine}>
                <Text style={styles.shortAccountNumberValue}>{'[' + DataProcessor.getUserInformation().bitmarkAccountNumber.substring(0, 4) + '...' + DataProcessor.getUserInformation().bitmarkAccountNumber.substring(DataProcessor.getUserInformation().bitmarkAccountNumber.length - 4, DataProcessor.getUserInformation().bitmarkAccountNumber.length) + ']'}</Text>
              </View>

              <TouchableOpacity style={styles.viewOnRegistryButton} onPress={() => {
                Linking.openURL(`${config.registry_server_url}/account/${DataProcessor.getUserInformation().bitmarkAccountNumber}`)
              }}>
                <Text style={styles.viewOnRegistryButtonText}>{i18n.t('AccountNumberComponent_viewOnRegistryButtonText')}</Text>
                <Image style={styles.viewOnRegistryButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_red.png')} />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
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
    padding: convertWidth(20),
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Black',
    fontWeight: '900',
    fontSize: 36,
  },
  closeIcon: {
    width: convertWidth(20),
    height: convertWidth(20),
    resizeMode: 'contain',
    marginTop: 14,
  },
  content: {
    flexGrow: 1,

  },
  description: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Light',
    fontSize: 16,
    marginTop: 30,
  },
  fullAccountNumberLabel: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Book',
    fontSize: 16,
    marginTop: 25,
  },
  fullAccountNumberValue: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Andale Mono',
    fontSize: 12,
    color: '#FF4444',
    marginTop: 10,
  },
  barLine: {
    paddingBottom: 3,
    borderBottomColor: '#FF4444',
    borderBottomWidth: 1,
    flex: 0,
    width: 'auto',
    alignSelf: 'flex-start',
  },
  shortAccountNumberLabel: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Book',
    fontSize: 16,
    marginTop: 15,
  },
  shortAccountNumberValue: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Andale Mono',
    fontSize: 12,
    color: '#FF4444',
    marginTop: 10,
  },

  viewOnRegistryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 40,
    minHeight: 22,
  },
  viewOnRegistryButtonIcon: {
    width: convertWidth(8),
    height: 14 * convertWidth(8) / 8,
    resizeMode: 'contain',
  },
  viewOnRegistryButtonText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Medium',
    fontWeight: '400',
    fontSize: 16,
    color: 'black'
  }

});