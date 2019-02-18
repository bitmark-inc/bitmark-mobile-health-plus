import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, Alert, ScrollView,
  View, TouchableOpacity, Text, SafeAreaView, FlatList, Image,
} from 'react-native';

import KeepAwake from 'react-native-keep-awake';
import { Actions } from 'react-native-router-flux';
import { AppProcessor, DataProcessor, EventEmitterService, CacheData } from 'src/processors';
import { isImageFile, convertWidth } from 'src/utils';

export class EmailRecordComponent extends Component {
  static propTypes = {
    mapEmailRecords: PropTypes.object,
  };
  static STEPS = {
    authorization: 'authorization',
    view: 'view',
  };

  constructor(props) {
    super(props);
    this.processEmailRecordsFromAnEmail = this.processEmailRecordsFromAnEmail.bind(this);

    let emailAddress = Object.keys(this.props.mapEmailRecords);
    this.state = {
      emailAddress,
      emailIndex: 0,
      selectedEmail: emailAddress[0],
      acceptedList: [],
      step: EmailRecordComponent.STEPS.authorization,
      processing: true,
      list: [],
      ids: []
    };
  }

  componentDidMount() {
    this.processEmailRecordsFromAnEmail(this.state.selectedEmail);
  }

  async processEmailRecordsFromAnEmail(selectedEmail) {
    this.setState({ processing: true });
    KeepAwake.activate();
    let results = await AppProcessor.doProcessEmailRecords(CacheData.userInformation.bitmarkAccountNumber, this.props.mapEmailRecords[selectedEmail]);
    KeepAwake.deactivate();
    this.setState({
      list: results.list || [],
      ids: results.ids || [],
      processing: false
    });
  }

  doAccept() {
    AppProcessor.doAcceptEmailRecords({ list: this.state.list, ids: this.state.ids }, {
      indicator: true, title: i18n.t('EmailRecordComponent_alertTitle'), message: ''
    }).then((results) => {
      if (results) {
        let acceptedList = this.state.acceptedList;
        acceptedList = acceptedList.concat(this.state.list.filter(item => !item.existingAsset));
        if (this.state.emailIndex < this.state.emailAddress.length - 1) {
          this.setState({
            selectedEmail: this.state.emailAddress[this.state.emailIndex + 1],
            emailIndex: this.state.emailIndex + 1,
            acceptedList
          });
          this.processEmailRecordsFromAnEmail(this.state.emailAddress[this.state.emailIndex + 1]);
        } else {
          if (acceptedList.length > 0) {
            this.setState({ step: EmailRecordComponent.STEPS.view, acceptedList });
          } else {
            this.gotoUserScreen();
          }
        }
      }
    }).catch(error => {
      console.log('EmailRecordComponent doAcceptEmailRecords error :', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }
  doReject() {
    AppProcessor.doRejectEmailRecords({ list: this.state.list, ids: this.state.ids }).then(() => {
      if (this.state.emailIndex < this.state.emailAddress.length - 1) {
        this.setState({
          selectedEmail: this.state.emailAddress[this.state.emailIndex + 1],
          emailIndex: this.state.emailIndex + 1,
        });
      } else {
        if (this.state.acceptedList.length === 0) {
          this.gotoUserScreen();
          return;
        }
        this.setState({ step: EmailRecordComponent.STEPS.view });
      }
    }).catch(error => {
      console.log('EmailRecordComponent doReject error :', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  gotoUserScreen() {
    Actions.reset('user');
    DataProcessor.finishedDisplayEmailRecords();
  }

  render() {
    console.log('this :', this.state, this.props);

    const areAllExistingAssets = this.state.list.every(item => item.existingAsset);

    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            {/*Authorization*/}
            {this.state.step === EmailRecordComponent.STEPS.authorization &&
            <View style={{flex: 1}}>
              {/*TOP AREA*/}
              <View style={[styles.topArea, styles.paddingContent]}>
                <Text style={[styles.title]}>{i18n.t('EmailRecordComponent_title1').toUpperCase()}</Text>
                <Image style={styles.logo} source={require('assets/imgs/info-icon.png')} />
              </View>

              {/*CONTENT*/}
              <View style={[styles.contentArea, styles.paddingContent, { justifyContent: 'flex-start' }]}>
                <ScrollView contentContainerStyle={{alignItems: 'center'}}>
                  {/*New Assets*/}
                  <View>
                    <Text style={styles.message}>{i18n.t('EmailRecordComponent_message1', { email: this.state.selectedEmail })}</Text>
                    {
                      !this.state.processing && this.state.list.filter(item => !item.existingAsset).map((item, index) => (
                        <TouchableOpacity key={`new_asset_${index}`} onPress={() => {
                          if (isImageFile(item.filePath)) {
                            Actions.fullViewCaptureAsset({ filePath: item.filePath, title: item.assetName });
                          } else {
                            Alert.alert(i18n.t('EmailRecordComponent_fileTypeNotSupport'));
                          }
                        }}>
                          <Text style={styles.emailRecordItem}>- {item.assetName}</Text>
                        </TouchableOpacity>
                      ))
                    }
                  </View>
                  {/*Existing Assets*/}
                  {!this.state.processing && this.state.list.findIndex(item => item.existingAsset) >= 0 &&
                  <View>
                    {/* TODO i18n */}
                    <Text style={styles.existingAssetMessage}>{i18n.t('EmailRecordComponent_existingAssetMessage')}</Text>
                    {
                      this.state.list.filter(item => item.existingAsset).map((item, index) => (
                        <TouchableOpacity key={`existing_asset_${index}`} onPress={() => {
                          if (isImageFile(item.filePath)) {
                            Actions.fullViewCaptureAsset({ filePath: item.filePath, title: item.assetName });
                          } else {
                            Alert.alert(i18n.t('EmailRecordComponent_fileTypeNotSupport'));
                          }
                        }}>
                          <Text style={styles.emailRecordItem}>- {item.assetName}</Text>
                        </TouchableOpacity>
                      ))
                    }
                  </View>
                  }

                  {/*PROCESSING*/}
                  {this.state.processing && <Text style={styles.processingText}>{i18n.t('EmailRecordComponent_processingText')}</Text>}
                </ScrollView>


              </View>

              {/*BOTTOM AREA*/}
              {!this.state.processing &&
              <View>
                {areAllExistingAssets ? (
                  <View style={[styles.bottomArea, styles.paddingContent, {justifyContent: 'flex-end'}]}>
                    <TouchableOpacity style={styles.buttonNext} onPress={this.gotoUserScreen.bind(this)} >
                      <Text style={[styles.buttonText, { color: '#FF003C' }]}>{i18n.t('BitmarkInternetOffComponent_okButtonText').toUpperCase()}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={[styles.bottomArea, styles.paddingContent]}>
                    {/*Dummy button*/}
                    <TouchableOpacity style={styles.buttonNext} onPress={() => {}} disabled={true}>
                      <Text style={[styles.buttonText, { color: '#F4F2EE' }]}>{i18n.t('EmailRecordComponent_rejectButtonText').toUpperCase()}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.buttonNext} onPress={this.doReject.bind(this)} >
                      <Text style={[styles.buttonText, { color: '#FF003C' }]}>{i18n.t('EmailRecordComponent_rejectButtonText').toUpperCase()}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.buttonNext} onPress={this.doAccept.bind(this)} >
                      <Text style={[styles.buttonText, { color: '#FF003C' }]}>{i18n.t('EmailRecordComponent_acceptButtonText').toUpperCase()}</Text>
                    </TouchableOpacity>
                  </View>
                )
                }
              </View>
              }
            </View>
            }

            {/*View*/}
            {this.state.step === EmailRecordComponent.STEPS.view &&
            <View style={{flex: 1}}>
              {/*TOP AREA*/}
              <View style={[styles.topArea, styles.paddingContent]}>
                <Text style={[styles.title]}>{i18n.t('EmailRecordComponent_title2').toUpperCase()}</Text>
              </View>

              {/*CONTENT*/}
              <View style={[styles.contentArea, styles.paddingContent, { justifyContent: 'flex-start', alignItems: 'flex-start' }]}>
                <Text style={styles.message}>{i18n.t('EmailRecordComponent_message2')}</Text>
                <FlatList data={this.state.acceptedList}
                          keyExtractor={(item, index) => index + ''}
                          renderItem={({ item, index }) => {
                            return (<View key={index}>
                              <Text style={styles.acceptedEmailRecordItem}>- {item.assetName}</Text>
                            </View>);
                          }}
                />
              </View>

              {/*BOTTOM AREA*/}
              <View style={[styles.bottomArea, styles.paddingContent, {justifyContent: 'flex-end'}]}>
                <TouchableOpacity style={styles.buttonNext} onPress={() => {
                  this.gotoUserScreen();
                }}>
                  <Text style={[styles.buttonText, {color: '#FF003C'}]}>{i18n.t('EmailRecordComponent_viewButtonText').toUpperCase()}</Text>
                </TouchableOpacity>
              </View>
            </View>
            }
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
    backgroundColor: 'white',
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
    paddingTop: 8,
    paddingBottom: 16,
  },

  bodyContent: {
    flex: 1,
    backgroundColor: '#F4F2EE',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  message: {
    marginTop: 30,
    fontFamily: 'AvenirNextW1G-Light',
    fontSize: 17,
    color: 'rgba(0, 0, 0, 0.6)'
  },
  emailRecordItem: {
    fontFamily: 'AvenirNextW1G-Medium',
    fontSize: 16,
    color: '#0060F1',
    marginTop: 20,
  },

  acceptedEmailRecordItem: {
    fontFamily: 'AvenirNextW1G-Medium',
    fontSize: 17,
    marginTop: 20,
  },
  processingText: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 16,
    color: '#0060F1',
    marginTop: 16,
  },
  existingAssetMessage: {
    fontFamily: 'AvenirNextW1G-Medium',
    fontSize: 17,
    marginTop: 20,
  },
  paddingContent: {
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
  },
  topArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  contentArea: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  bottomArea: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'AvenirNextW1G-Light',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.6)',
    letterSpacing: 1.5
  },
  logo: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  buttonNext: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 16,
    color: '#FF003C',
  },
  buttonText: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 16,
  },

});
