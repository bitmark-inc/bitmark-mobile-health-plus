import React, { Component } from 'react';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, SafeAreaView, ScrollView,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { BitmarkLegalComponent } from 'src/views/commons';
import { convertWidth } from 'src/utils';
import { config, } from 'src/configs';

export class SupportComponent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.bodyContent} >
            <View style={styles.titleRow}>
              <Text style={styles.title}>{i18n.t('SupportComponent_title')}</Text>
              <TouchableOpacity onPress={Actions.pop}>
                <Image style={styles.closeIcon} source={require('assets/imgs/back_icon_red.png')} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
              <TouchableOpacity style={styles.rowButton} onPress={() => Actions.legal({ displayedContentName: BitmarkLegalComponent.Contents.TermOfService.name })}>
                <Text style={styles.rowButtonText}>{i18n.t('SupportComponent_rowButtonText1')}</Text>
                <Image style={styles.rowButtonIcon} source={require('assets/imgs/arrow_left_icon_red.png')} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.rowButton} onPress={() => Actions.legal({ displayedContentName: BitmarkLegalComponent.Contents.PrivacyPolicy.name })}>
                <Text style={styles.rowButtonText}>{i18n.t('SupportComponent_rowButtonText2')}</Text>
                <Image style={styles.rowButtonIcon} source={require('assets/imgs/arrow_left_icon_red.png')} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.rowButton} onPress={() => Actions.legal({ displayedContentName: BitmarkLegalComponent.Contents.KnowYourRights.name })}>
                <Text style={styles.rowButtonText}>{i18n.t('SupportComponent_rowButtonText3')}</Text>
                <Image style={styles.rowButtonIcon} source={require('assets/imgs/arrow_left_icon_red.png')} />
              </TouchableOpacity>
            </ScrollView>
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
    paddingTop: convertWidth(16),
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
    flexDirection: 'column',
    flex: 1,
  },
  title: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Light',
    fontWeight: '900',
    fontSize: 34,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: convertWidth(20),
    paddingBottom: 0,
  },
  closeIcon: {
    width: convertWidth(21),
    height: convertWidth(21),
    resizeMode: 'contain',
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
    width: convertWidth(8),
    height: 14 * convertWidth(8) / 8,
    resizeMode: 'contain',
  },
  rowButtonText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Light',
    fontWeight: '300',
    fontSize: 16,
  }


});
