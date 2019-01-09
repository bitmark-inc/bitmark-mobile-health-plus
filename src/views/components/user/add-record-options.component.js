import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet,
} from 'react-native'

import { convertWidth } from 'src/utils';
import { config, constants } from 'src/configs';

export class AddRecordOptionsComponent extends React.Component {
  static propTypes = {
    close: PropTypes.func,
    takePhoto: PropTypes.func,
    importRecord: PropTypes.func,
  };

  render() {
    return (
      <TouchableOpacity style={[dialogStyles.dialogBody]} onPress={this.props.close}>
        <View style={[dialogStyles.content]}>
          <TouchableOpacity style={[dialogStyles.optionContainer]} onPress={this.props.takePhoto}>
            <Image style={dialogStyles.optionIcon} source={require('assets/imgs/take-photo-icon.png')} />
            <View style={[dialogStyles.textArea]}>
              <Text style={[dialogStyles.title]}>Take photo of records</Text>
              <Text style={[dialogStyles.desc]}>Keep a copy of your records from hospitals or clinics for your own use.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[dialogStyles.optionContainer, { paddingTop: 0 }]} onPress={this.props.importRecord}>
            <Image style={dialogStyles.optionIcon} source={require('assets/imgs/import-records-icon.png')} />
            <View style={[dialogStyles.textArea]}>
              <Text style={[dialogStyles.title]}>Import records</Text>
              <Text style={[dialogStyles.desc]}>Import existing files from your phone or cloud storage services.</Text>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }
}

const dialogStyles = StyleSheet.create({
  dialogBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'column',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: constants.zIndex.dialog,
    bottom: 0,
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
  },
  content: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    marginBottom: config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 16,
    borderRadius: 3,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: convertWidth(32),
    paddingRight: convertWidth(45),
  },
  optionIcon: {
    width: 31,
    height: 33,
    resizeMode: 'contain'
  },
  textArea: {
    marginLeft: 16,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  title: {
    fontFamily: 'AvenirNextW1G-Bold',
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 18,
    lineHeight: 20,
  },
  desc: {
    fontFamily: 'AvenirNextW1G-Regular',
    letterSpacing: 0.25,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(0, 0, 0, 0.6)',
    width: convertWidth(250)
  },
});