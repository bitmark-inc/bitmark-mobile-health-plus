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
import { AppProcessor, DataProcessor } from './../../processors';
import { EventEmitterService } from './../../services';
import { insertHealthDataToIndexedDB } from "../../utils";

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
              <Text style={styles.title}>{(this.props.list && this.props.list.length > 1) ?
                i18n.t('BitmarkHealthDataComponent_title1', { length: this.props.list.length }) :
                i18n.t('BitmarkHealthDataComponent_title2')}</Text>
              <Text style={styles.message}>
                {i18n.t('BitmarkHealthDataComponent_message')}
              </Text>
            </View>

            <View style={styles.signButtonArea}>
              <TouchableOpacity style={styles.signButton} onPress={() => {
                AppProcessor.doBitmarkHealthData(this.props.list, {
                  indicator: true, title: i18n.t('BitmarkHealthDataComponent_alertTitle'), message: ''
                }).then(results => {
                  if (results) {
                    console.log('health-data-results:', results);
                    results.forEach(item => {
                      insertHealthDataToIndexedDB(item.id, item.healthData);
                    });
                    Actions.pop();
                    DataProcessor.doMarkDoneBitmarkHealthData();
                  }
                }).catch(error => {
                  console.log('doBitmarkHealthData error:', error);
                  EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
                });
              }} >
                <Text style={styles.signButtonText}>{i18n.t('BitmarkHealthDataComponent_signButtonText')}</Text>
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
    paddingTop: convertWidth(15),
    flexDirection: 'column',
    flex: 1,
  },
  title: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Light',
    fontWeight: '900',
    fontSize: 36,
    color: '#464646',
  },
  message: {
    marginTop: 24,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Light',
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
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Medium',
    fontWeight: '800',
    fontSize: 16,
    color: 'white'
  },


});
