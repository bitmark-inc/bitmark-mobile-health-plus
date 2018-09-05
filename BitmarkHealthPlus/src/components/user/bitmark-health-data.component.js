import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, TouchableOpacity, Text, SafeAreaView,
} from 'react-native';


import { convertWidth } from './../../utils';
import { config } from './../../configs';
import { Actions } from 'react-native-router-flux';
import { constants } from '../../constants';
import { AppProcessor } from './../../processors';
import { EventEmitterService } from './../../services';

export class BitmarkHealthDataComponent extends Component {
  static propTypes = {
    list: PropTypes.array,
  };
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            <View style={styles.content}>
              <Text style={styles.title}>{(this.props.list && this.props.list.length > 1) ? `Sign Your ${this.props.list.length} Weeks Weekly Data` : 'Sign Your Weekly Data'}</Text>
              <Text style={styles.message}>
                To protect your privacy, you are identified in the Bitmark system by a pseudonymous account number. This number is public. You can safely share it with others without compromising your security.
              </Text>
            </View>

            <View style={styles.signButtonArea}>
              <TouchableOpacity style={styles.signButton} onPress={() => {
                AppProcessor.doBitmarkHealthData(this.props.list, {
                  indicator: true, title: 'Encrypting and protecting your health data...', message: ''
                }).then(result => {
                  if (result) {
                    Actions.pop();
                  }
                }).catch(error => {
                  console.log('doBitmarkHealthData error:', error);
                  EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
                });
              }} >
                <Text style={styles.signButtonText}>SIGN</Text>
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
    flexDirection: 'column',
    flex: 1,
  },
  title: {
    fontFamily: 'Avenir Light',
    fontWeight: '900',
    fontSize: 36,
    color: '#464646',
  },
  message: {
    marginTop: 24,
    fontFamily: 'Avenir Light',
    fontWeight: '300',
    fontSize: 12,
  },

  signButtonArea: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    paddingLeft: convertWidth(20),
    paddingRight: convertWidth(20),
  },
  signButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: constants.buttonHeight,
    width: '100%',
    backgroundColor: '#FF4444'
  },
  signButtonText: {
    fontFamily: 'Avenir Medium',
    fontWeight: '300',
    fontSize: 16,
    color: 'white'
  },


});
