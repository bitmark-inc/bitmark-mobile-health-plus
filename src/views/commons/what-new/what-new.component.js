import React, { Component } from 'react';
import {
  StyleSheet,
  View, TouchableOpacity, Text, SafeAreaView, ScrollView, Image,
} from 'react-native';

import Swiper from 'react-native-swiper';
import moment from 'moment';
import { Actions } from 'react-native-router-flux';
import { runPromiseWithoutError, convertWidth } from 'src/utils';
import { DataProcessor } from 'src/processors';
import { config, constants } from 'src/configs';


export class WhatNewComponent extends Component {
  constructor(props) {
    super(props);
    // let releaseDate = moment('', 'DD-MM-YYYY');
    let releaseDate = moment('13-03-2019', 'DD-MM-YYYY');
    let diffDay = moment().diff(releaseDate, 'days');
    this.state = {
      step: 2,
      index: 0,
      diffDay,
    };
  }

  viewAllWhatNew() {
    runPromiseWithoutError(DataProcessor.doMarkDisplayedWhatNewInformation());
    Actions.pop();
  }

  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          {this.state.step === 1 && <View style={styles.bodyContent}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={this.viewAllWhatNew.bind(this)}>
                <Text style={styles.closeButtonText}>{i18n.t('WhatNewComponent_closeButtonText')}</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{i18n.t('WhatNewComponent_headerTitle1')}</Text>
            </View>
            <View style={styles.newContent}>
              <Swiper
                ref={(ref) => this.swipeRef = ref}
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
                  <Image style={styles.newSwipeImage} source={require('assets/imgs/new_1.png')} />
                  <View style={styles.newSwipeInformationArea}>
                    <Text style={styles.s51New1Description}>{i18n.t('WhatNewComponent_description1')}</Text>
                  </View>
                  <TouchableOpacity style={styles.nextButton} onPress={() => this.swipeRef.scrollBy(1)}>
                    <Text style={styles.nextButtonText}>{i18n.t('WhatNewComponent_nextButtonText')}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.newContentSwipePage}>
                  <Image style={styles.newSwipeImage} source={require('assets/imgs/new_2.png')} />
                  <View style={styles.newSwipeInformationArea}>
                    <Text style={styles.s51New1Description}>{i18n.t('WhatNewComponent_description2')}</Text>
                  </View>
                  <TouchableOpacity style={styles.doneButton} onPress={() => this.setState({ step: 2 })}>
                    <Text style={styles.doneButtonText}>{i18n.t('WhatNewComponent_doneButtonText')}</Text>
                  </TouchableOpacity>
                </View>

              </Swiper>
            </View>
          </View>}
          {this.state.step === 2 && <View style={styles.bodyContent}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={this.viewAllWhatNew.bind(this)}>
                <Text style={styles.closeButtonText}>{i18n.t('WhatNewComponent_closeButtonText')}</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{i18n.t('WhatNewComponent_headerTitle2')}</Text>
            </View>
            <View style={styles.newContent}>
              <ScrollView style={{ width: '100%', }} contentContainerStyle={{ flexGrow: 1, flexDirection: 'column', width: '100%', }}>
                <View style={styles.versionInformation}>
                  <Text style={styles.versionInformationText} >{i18n.t('WhatNewComponent_versionInformationText', { version: DataProcessor.getApplicationVersion() })}</Text>
                  <Text style={styles.versionInformationReleaseDiff}>
                    {this.state.diffDay === 0 ? i18n.t('WhatNewComponent_versionInformationReleaseDiff1') : i18n.t('WhatNewComponent_versionInformationReleaseDiff2', { day: this.state.diffDay })}
                  </Text>
                </View>

                <Text style={styles.releaseNoteText}>
                  {i18n.t('WhatNewComponent_releaseNoteText')}
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
  newContentSwipePage: {
    flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    paddingTop: config.isIPhoneX ? 40 : 45, paddingBottom: config.isIPhoneX ? 40 : 45,
  },
  newSwipeImage: {
    flex: 1,
    width: '100%', height: '100%', resizeMode: 'contain'
  },
  newSwipeInformationArea: {
    marginTop: config.isIPhoneX ? 60 : 25,
    marginBottom: config.isIPhoneX ? 30 : 15,
    flexDirection: 'column', justifyContent: 'flex-start',
  },
  s51New1Description: {
    width: convertWidth(305),
    fontFamily: 'AvenirNextW1G-Light', fontSize: 16, textAlign: 'center',
  },
  swipePagination: {
    position: 'absolute', bottom: config.isIPhoneX ? -5 : 18,
  },
  nextButton: {
    height: constants.buttonHeight, backgroundColor: '#FF4444', width: convertWidth(335),
    alignItems: 'center', justifyContent: 'center',
  },
  nextButtonText: {
    color: 'white', fontFamily: 'AvenirNextW1G-Heavy', fontSize: 16, fontWeight: '600',
  },
  doneButton: {
    height: constants.buttonHeight, backgroundColor: '#FF4444', width: convertWidth(335),
    alignItems: 'center', justifyContent: 'center',
  },
  doneButtonText: {
    color: 'white', fontFamily: 'AvenirNextW1G-Heavy', fontSize: 16, fontWeight: '600',
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

  },
  versionInformationReleaseDiff: {
    fontFamily: 'AvenirNextW1G-Light', fontSize: 14, color: '#999999',
  },
  releaseNoteText: {
    width: '100%',
    paddingLeft: convertWidth(20), paddingRight: convertWidth(20),
    fontFamily: 'AvenirNextW1G-Light', fontSize: 16,
  },

});
