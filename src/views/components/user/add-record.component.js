import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, SafeAreaView, TouchableOpacity, Text, Image,
} from 'react-native';
import Hyperlink from 'react-native-hyperlink';
import { Actions } from 'react-native-router-flux';
import { convertWidth } from 'src/utils';
import { config, constants } from 'src/configs';

export class AddRecordComponent extends Component {
  static propTypes = {
    addRecord: PropTypes.func.isRequired,
  };
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>{i18n.t('AddRecordComponent_titleText')}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={Actions.pop}>
                <Image style={styles.closeIcon} source={require('./../../../assets/imgs/close_icon_red.png')} />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, padding: 20 }}>
              <Hyperlink>
                <Text style={styles.message}>
                  {i18n.t('AddRecordComponent_message')}
                </Text>
              </Hyperlink>
              <View style={{ flex: 1, padding: 30 }}>
                <Image style={{ width: '100%', height: '100%', resizeMode: 'contain' }} source={require('./../../../assets/imgs/add-record.png')} />
              </View>
            </View>
            <View style={styles.bottomButtonArea}>
              <TouchableOpacity style={[styles.bottomButton]} onPress={this.props.addRecord}>
                <Text style={[styles.bottomButtonText]}>{i18n.t('AddRecordComponent_bottomButtonText').toUpperCase()}</Text>
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
    borderWidth: 1, borderColor: '#FF4444',
    width: '100%'
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
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Black',
    fontWeight: '900',
    fontSize: 24,
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

  message: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Light',
    fontWeight: '300',
    fontSize: 16,
  },


  bottomButtonArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: convertWidth(20),
  },

  bottomButton: {
    borderWidth: 1, borderColor: '#FF4444',
    backgroundColor: '#FF4444',
    height: constants.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',

  },
  bottomButtonText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Light',
    fontWeight: '900',
    fontSize: 16,
    color: 'white'
  }



});