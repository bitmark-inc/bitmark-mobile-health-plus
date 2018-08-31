import React, { Component } from 'react';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, SafeAreaView,
} from 'react-native';

import { convertWidth } from './../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';

export class UserComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numberHealthDataRecords: 0,
      numberHealthRecords: 0,
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            <View style={styles.dataArea}>
              <Text style={styles.dataTitle}><Text style={{ color: '#FF1829' }}>{this.state.numberHealthDataRecords}</Text> Weeks of Health Data{this.state.numberHealthDataRecords > 1 ? 's' : ''}</Text>
            </View>
            <View style={[styles.dataArea, { borderTopColor: '#FF1829', borderTopWidth: 1 }]}>
              <Text style={styles.dataTitle}><Text style={{ color: '#FF1829' }}>{this.state.numberHealthRecords}</Text> Health Record{this.state.numberHealthRecords > 1 ? 's' : ''}</Text>
              <TouchableOpacity style={styles.addHealthRecordButton}>
                <Image style={styles.addHealthRecordButtonIcon} source={require('./../../../assets/imgs/plus_icon_red.png')} />
                <Text style={styles.addHealthRecordButtonText} > {'Add records'.toUpperCase()}</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.accountArea]}>
              <TouchableOpacity style={styles.accountButton}>
                <Text style={styles.accountButtonText}>[3xi3...4u83i]</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF4444',
  },

  dataArea: {
    flex: 1,
    width: '100%',
    padding: convertWidth(20),
  },
  dataTitle: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 36,
    color: '#464626'
  },
  addHealthRecordButton: {
    position: 'absolute',
    left: convertWidth(16), bottom: convertWidth(22),
    padding: convertWidth(4),
    flexDirection: 'row',
    alignItems: 'center',
  },
  addHealthRecordButtonIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
  },
  addHealthRecordButtonText: {
    marginLeft: convertWidth(6),
    fontFamily: 'Avenir Medium',
    fontWeight: '300',
    fontSize: 16,
  },
  accountArea: {
    width: '100%', height: 38,
    borderTopColor: '#FF1829', borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: convertWidth(305),
  },
  accountButtonText: {
    fontFamily: 'Avenir Medium',
    fontWeight: '300',
    fontSize: 16,
    color: '#FF1F1F'
  }
});
