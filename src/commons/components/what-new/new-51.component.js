import React, { Component } from 'react';
import {
  StyleSheet,
  View, TouchableOpacity, Text, SafeAreaView, ScrollView, Image,
} from 'react-native';

import Swiper from 'react-native-swiper';

import { config } from '../../../configs';
import { convertWidth } from '../../../utils';
import { constants } from '../../../constants';
import moment from 'moment';
import { DataProcessor } from '../../../processors';
import { Actions } from 'react-native-router-flux';


export class WhatNew_S51_Component extends Component {
  constructor(props) {
    super(props);
    // let releaseDate = moment('', 'DD-MM-YYYY');
    let releaseDate = moment('01-11-2018', 'DD-MM-YYYY');
    let diffDay = moment().diff(releaseDate, 'days');
    this.state = {
      step: 1,
      index: 0,
      diffDay,
    };
  }

  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          {this.state.step === 1 && <View style={styles.bodyContent}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{i18n.t('WhatNew_S51_Component_headerTitle1')}</Text>
            </View>
            <View style={styles.newContent}>
              <Swiper
                activeDotColor='#FF4444'
                showsPagination={true}
                showsButtons={false}
                buttonWrapperStyle={{ color: 'black' }}
                loop={false}
                paginationStyle={styles.swipePagination}
                onIndexChanged={(index) => {
                  this.setState({
                    index: index,
                  });
                }}
              >
                <View style={styles.newContentSwipePage}>
                  <Image style={styles.newSwipeImage} source={require('./../../../../assets/imgs/s51_new_1.png')} />
                  <View style={styles.newSwipeInformationArea}>
                    <Text style={styles.s51New1Description}>{i18n.t('WhatNew_S51_Component_s51New1Description1')}</Text>
                  </View>
                </View>

                <View style={styles.newContentSwipePage}>
                  <Image style={styles.newSwipeImage} source={require('./../../../../assets/imgs/s51_new_2.png')} />
                  <View style={styles.newSwipeInformationArea}>
                    <Text style={styles.s51New1Description}>{i18n.t('WhatNew_S51_Component_s51New1Description2')}</Text>
                  </View>
                </View>

                <View style={styles.newContentSwipePage}>
                  <Image style={styles.newSwipeImage} source={require('./../../../../assets/imgs/s51_new_3.png')} />
                  <View style={styles.newSwipeInformationArea}>
                    <Text style={styles.s51New1Description}>{i18n.t('WhatNew_S51_Component_s51New1Description2')}</Text>
                  </View>
                </View>
              </Swiper>
              {this.state.index < 2 && <TouchableOpacity style={styles.skipButton} onPress={() => this.setState({ step: 2 })}>
                <Text style={styles.skipButtonText}>{i18n.t('WhatNew_S51_Component_skipButtonText')}</Text>
              </TouchableOpacity>}
              {this.state.index === 2 && <TouchableOpacity style={styles.doneButton} onPress={() => this.setState({ step: 2 })}>
                <Text style={styles.doneButtonText}>{i18n.t('WhatNew_S51_Component_doneButtonText')}</Text>
              </TouchableOpacity>}
            </View>
          </View>}
          {this.state.step === 2 && <View style={styles.bodyContent}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={Actions.pop}>
                <Text style={styles.closeButtonText}>{i18n.t('WhatNew_S51_Component_closeButtonText')}</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{i18n.t('WhatNew_S51_Component_headerTitle2')}</Text>
            </View>
            <View style={styles.newContent}>
              <ScrollView style={{ width: '100%', }} contentContainerStyle={{ flexGrow: 1, flexDirection: 'column', width: '100%', }}>
                <View style={styles.versionInformation}>
                  <Text style={styles.versionInformationText} >{i18n.t('WhatNew_S51_Component_versionInformationText', { version: DataProcessor.getApplicationVersion() })}</Text>
                  <Text style={styles.versionInformationReleaseDiff}>
                    {this.state.diffDay === 0 ? i18n.t('WhatNew_S51_Component_versionInformationReleaseDiff1') : i18n.t('WhatNew_S51_Component_versionInformationReleaseDiff2', { day: this.state.diffDay })}
                  </Text>
                </View>

                <Text style={styles.releaseNoteText}>
                  {i18n.t('WhatNew_S51_Component_releaseNoteText')}
                </Text>
              </ScrollView>
            </View>
          </View>}
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
    paddingTop: (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
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
    textAlign: 'center', fontFamily: 'Avenir Black', fontStyle: 'italic', fontWeight: '600', fontSize: 18,
  },
  newContent: {
    flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    width: '100%',
  },
  newContentSwipePage: {
    flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    paddingTop: config.isIPhoneX ? 45 : 25, paddingBottom: config.isIPhoneX ? 45 : 25,
  },
  newSwipeImage: {
    width: convertWidth(271), height: 371 * convertWidth(271) / 271, resizeMode: 'contain'
  },
  newSwipeInformationArea: {
    marginTop: config.isIPhoneX ? 60 : 25,
    flex: 1, flexDirection: 'column', justifyContent: 'flex-start',
  },
  s51New1Description: {
    width: convertWidth(305),
    fontFamily: 'Avenir Light', fontWeight: '300', fontSize: 16, textAlign: 'center',
  },
  swipePagination: {
    position: 'absolute', bottom: config.isIPhoneX ? 0 : 15,
  },
  skipButton: {
    position: 'absolute', bottom: config.isIPhoneX ? 0 : 15, left: 27, zIndex: 1,
  },
  skipButtonText: {
    color: '#FF4444', fontFamily: 'Avenir Light', fontSize: 16,
  },
  doneButton: {
    position: 'absolute', bottom: config.isIPhoneX ? 0 : 15, right: 27, zIndex: 1,
  },
  doneButtonText: {
    color: '#FF4444', fontFamily: 'Avenir Light', fontSize: 16, fontWeight: 'bold'
  },

  closeButton: {
    alignItems: 'center', justifyContent: 'center',
    position: 'absolute', paddingLeft: convertWidth(27), paddingRight: convertWidth(27), zIndex: 1,
    height: '100%',
  },
  closeButtonText: {
    fontFamily: 'Avenir Light', color: '#FF4444', textAlign: 'center', textAlignVertical: 'center', fontSize: 16,
  },

  versionInformation: {
    width: '100%',
    paddingLeft: convertWidth(20), paddingRight: convertWidth(20),
    marginTop: 28, marginBottom: 17,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  versionInformationText: {
    fontFamily: 'Avenir Heavy', fontSize: 17, fontWeight: 'bold',

  },
  versionInformationReleaseDiff: {
    fontFamily: 'Avenir Light', fontSize: 14, fontWeight: '300', color: '#999999',
  },
  releaseNoteText: {
    width: '100%',
    paddingLeft: convertWidth(20), paddingRight: convertWidth(20),
    fontFamily: 'Avenir Light', fontSize: 16, fontWeight: '300'
  },

});
