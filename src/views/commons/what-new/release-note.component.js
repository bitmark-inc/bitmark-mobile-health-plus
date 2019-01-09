import React, { Component } from 'react';
import {
  StyleSheet,
  View, TouchableOpacity, Text, SafeAreaView, ScrollView,
} from 'react-native';

import moment from 'moment';
import { Actions } from 'react-native-router-flux';
import { runPromiseWithoutError, convertWidth } from 'src/utils';
import { DataProcessor } from 'src/processors';


export class ReleaseNoteComponent extends Component {

  viewAllWhatNew() {
    runPromiseWithoutError(DataProcessor.doMarkDisplayedWhatNewInformation());
    Actions.pop();
  }

  render() {
    let releaseDate = moment('24-12-2018', 'DD-MM-YYYY');
    let diffDay = moment().diff(releaseDate, 'days');
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={this.viewAllWhatNew.bind(this)}>
                <Text style={styles.closeButtonText}>{i18n.t('ReleaseNoteComponent_closeButtonText')}</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{i18n.t('ReleaseNoteComponent_headerTitle2')}</Text>
            </View>
            <View style={styles.newContent}>
              <ScrollView style={{ width: '100%', }} contentContainerStyle={{ flexGrow: 1, flexDirection: 'column', width: '100%', }}>
                <View style={styles.versionInformation}>
                  <Text style={styles.versionInformationText} >{i18n.t('ReleaseNoteComponent_versionInformationText', { version: DataProcessor.getApplicationVersion() })}</Text>
                  <Text style={styles.versionInformationReleaseDiff}>
                    {diffDay === 0 ? i18n.t('ReleaseNoteComponent_versionInformationReleaseDiff1') : i18n.t('ReleaseNoteComponent_versionInformationReleaseDiff2', { day: diffDay })}
                  </Text>
                </View>

                <Text style={styles.releaseNoteText}>
                  {i18n.t('ReleaseNoteComponent_releaseNoteText')}
                </Text>
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
    backgroundColor: 'white',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    width: "100%",
  },
  header: {
    width: '100%', height: 44,
    borderBottomColor: '#FF4444', borderBottomWidth: 1,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center', fontFamily: 'AvenirNextW1G-Bold', fontStyle: 'italic', fontSize: 18,
  },
  newContent: {
    flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    width: '100%',
  },
  closeButton: {
    alignItems: 'center', justifyContent: 'center',
    position: 'absolute', paddingLeft: convertWidth(27), paddingRight: convertWidth(27), zIndex: 1,
    height: '100%',
  },
  closeButtonText: {
    fontFamily: 'AvenirNextW1G-Light', color: '#FF4444', textAlign: 'center', textAlignVertical: 'center', fontSize: 16,
  },

  versionInformation: {
    width: '100%',
    paddingLeft: convertWidth(20), paddingRight: convertWidth(20),
    marginTop: 28, marginBottom: 17,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  versionInformationText: {
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 17,
    letterSpacing: 1.5,
  },
  versionInformationReleaseDiff: {
    fontFamily: 'AvenirNextW1G-Light', fontSize: 14, color: '#999999',
    letterSpacing: 0.4,
  },
  releaseNoteText: {
    width: '100%',
    paddingLeft: convertWidth(20), paddingRight: convertWidth(20),
    fontFamily: 'AvenirNextW1G-Light', fontSize: 16,
    letterSpacing: 0.25,
  },

});
