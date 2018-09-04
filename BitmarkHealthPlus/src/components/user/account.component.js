import React, { Component } from 'react';
import {
  StyleSheet,
  Linking,
  Image, View, TouchableOpacity, Text, SafeAreaView, ScrollView,
} from 'react-native';

import HyperLink from 'react-native-hyperlink';

import { convertWidth } from './../../utils';
import { config } from './../../configs';
import { Actions } from 'react-native-router-flux';
import { constants } from '../../constants';
import { DataProcessor } from '../../processors';

export class AccountComponent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <ScrollView style={styles.bodyContent}>
            <View style={styles.accountNumberArea}>
              <Text style={styles.accountNumberTitle} >Account number</Text>
              <Text style={styles.accountNumberValue}>{DataProcessor.getUserInformation().bitmarkAccountNumber}</Text>
              <View style={styles.accountNumberValueBar}></View>
              <HyperLink
                onPress={(url) => Linking.openURL(url)}
                linkStyle={{ color: '#0060F2', }}
                linkText={() => 'This number is public'} >
                <Text style={styles.accountNumberDescription}>To protect your privacy, you are identified in the Bitmark system by a pseudonymous account number. {config.registry_server_url}. You can safely share it with others without compromising your security.</Text>
              </HyperLink>
            </View>

            <View style={styles.securityArea}>
              <Text style={styles.securityTitle} >Security</Text>
              <TouchableOpacity style={styles.rowButton} onPress={() => Actions.accountPhrase()}>
                <Text style={styles.rowButtonText}>Write Down Recovery Phrase</Text>
                <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_black.png')} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.rowButton} onPress={() => Actions.accountPhrase({ isLogout: true })}>
                <Text style={styles.rowButtonText}>Remove Access</Text>
                <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_black.png')} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.rowButton}>
                <Text style={styles.rowButtonText}>Delete your account</Text>
                <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_black.png')} />
              </TouchableOpacity>
            </View>

            <View style={styles.accessArea}>
              <Text style={styles.accessTitle}>Access list</Text>
            </View>
            <View style={styles.aboutArea}>
              <Text style={styles.aboutTitle}>About</Text>
              <TouchableOpacity style={styles.rowButton} disabled={true}>
                <Text style={styles.rowButtonText}>Version</Text>
                <Text style={styles.rowButtonText}>{DataProcessor.getApplicationVersion()} ({DataProcessor.getApplicationBuildNumber() + (config.network !== config.NETWORKS.livenet ? '-' + config.network : '')})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rowButton} onPress={Actions.support}>
                <Text style={styles.rowButtonText}>Support</Text>
                <Image style={styles.rowButtonIcon} source={require('../../../assets/imgs/arrow_left_icon_black.png')} />
              </TouchableOpacity>
            </View>

          </ScrollView>
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
    width: "100%",
  },
  accountNumberArea: {
    flexDirection: 'column',
    padding: convertWidth(20),
    paddingBottom: 30,
  },
  accountNumberTitle: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 36,
    color: '#464646',
  },
  accountNumberValue: {
    fontFamily: 'Andale Mono',
    fontSize: 10,
    marginTop: 20,
  },
  accountNumberValueBar: {
    marginTop: 4,
    borderBottomWidth: 1,
    width: '100%',
  },
  accountNumberDescription: {
    marginTop: 24,
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 16,
  },

  securityArea: {
    borderTopWidth: 1,
    padding: convertWidth(20),
    paddingBottom: 30,
  },
  securityTitle: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 36,
    color: '#464646',
  },


  accessArea: {
    borderTopWidth: 1,
    padding: convertWidth(20),
    paddingBottom: 30,
  },
  accessTitle: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 36,
    color: '#464646',
  },

  aboutArea: {
    borderTopWidth: 1,
    padding: convertWidth(20),
    paddingBottom: 30,
  },
  aboutTitle: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 36,
    color: '#464646',
  },
  rowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12.5,
    minHeight: 24.5,
  },
  rowButtonIcon: {
    width: convertWidth(14),
    height: 8 * convertWidth(14) / 14,
    resizeMode: 'contain',
  },
  rowButtonText: {
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 16,
  }

});
