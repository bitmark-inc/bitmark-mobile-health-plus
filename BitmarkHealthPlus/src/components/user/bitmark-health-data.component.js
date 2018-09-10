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
    console.log('props :', this.props);
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            <View style={styles.content}>
              <Text style={styles.title}>{(this.props.list && this.props.list.length > 1) ? `Register the last ${this.props.list.length} weeks of your  data` : 'Register your weekly data'}</Text>
              <Text style={styles.message}>
                Once health data is registered as your property, you will be able to donate, share, or transfer it to another party (medical professional, family member, etc.) at your complete discretion.
              </Text>
            </View>

            <View style={styles.signButtonArea}>
              <TouchableOpacity style={styles.signButton} onPress={() => {
                AppProcessor.doBitmarkHealthData(this.props.list, {
                  indicator: true, title: 'Processing your health data...', message: ''
                }).then(result => {
                  if (result) {
                    Actions.pop();
                  }
                }).catch(error => {
                  console.log('doBitmarkHealthData error:', error);
                  EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
                });
              }} >
                <Text style={styles.signButtonText}>REGISTER</Text>
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
    fontSize: 16,
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
    fontWeight: '800',
    fontSize: 16,
    color: 'white'
  },


});
