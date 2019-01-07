import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, Alert, ScrollView,
  View, TouchableOpacity, Text, SafeAreaView, FlatList,
} from 'react-native';

import KeepAwake from 'react-native-keep-awake';
import { Actions } from 'react-native-router-flux';
import { AppProcessor, DataProcessor, EventEmitterService, CacheData } from 'src/processors';
import { isImageFile, convertWidth } from 'src/utils';
import { config, constants } from 'src/configs';

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
            Actions.reset('user');
            DataProcessor.finishedDisplayEmailRecords();
          }
        }
      }
    }).catch(error => {
      console.log('error :', error);
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
          Actions.reset('user');
          DataProcessor.finishedDisplayEmailRecords();
          return;
        }
        this.setState({ step: EmailRecordComponent.STEPS.view });
      }
    }).catch(error => {
      console.log('error :', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  render() {
    console.log('this :', this.state, this.props);
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          {this.state.step === EmailRecordComponent.STEPS.authorization && <View style={styles.bodyContent}>
            <ScrollView contentContainerStyle={styles.content}>
              <Text style={styles.title}>{i18n.t('EmailRecordComponent_title1')}</Text>
              <Text style={styles.message}>{i18n.t('EmailRecordComponent_message1', { email: this.state.selectedEmail })}</Text>

              {!this.state.processing && <FlatList data={this.state.list.filter(item => !item.existingAsset)}
                scrollEnabled={false}
                extraData={this.state}
                keyExtractor={(item, index) => index + ''}
                renderItem={({ item, index }) => {
                  return (
                    <TouchableOpacity key={index} onPress={() => {
                      if (isImageFile(item.filePath)) {
                        Actions.fullViewCaptureAsset({ filePath: item.filePath, title: item.assetName });
                      } else {
                        Alert.alert(i18n.t('EmailRecordComponent_fileTypeNotSupport'));
                      }
                    }}>
                      <Text style={styles.emailRecordItem}>- {item.assetName}</Text>
                    </TouchableOpacity>
                  )
                }}
              />}
              {!this.state.processing && this.state.list.findIndex(item => item.existingAsset) >= 0 && <View>
                {/* TODO i18n */}
                <Text style={styles.existingAssetMessage}>{i18n.t('EmailRecordComponent_existingAssetMessage')}</Text>
                <FlatList data={this.state.list.filter(item => item.existingAsset)}
                  scrollEnabled={false}
                  extraData={this.state}
                  keyExtractor={(item, index) => index + ''}
                  renderItem={({ item, index }) => {
                    return (
                      <TouchableOpacity key={index} onPress={() => {
                        if (isImageFile(item.filePath)) {
                          Actions.fullViewCaptureAsset({ filePath: item.filePath, title: item.assetName });
                        } else {
                          Alert.alert(i18n.t('EmailRecordComponent_fileTypeNotSupport'));
                        }
                      }}>
                        <Text style={styles.emailRecordItem}>- {item.assetName}</Text>
                      </TouchableOpacity>
                    )
                  }}
                />
              </View>}

              {this.state.processing && <Text style={styles.processingText}>{i18n.t('EmailRecordComponent_processingText')}</Text>}
            </ScrollView>

            {!this.state.processing && <View style={styles.buttonArea}>
              <TouchableOpacity style={styles.rejectButton} onPress={this.doReject.bind(this)} >
                <Text style={styles.rejectButtonText}>{i18n.t('EmailRecordComponent_rejectButtonText').toUpperCase()}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.acceptButton} onPress={this.doAccept.bind(this)} >
                <Text style={styles.acceptButtonText}>{i18n.t('EmailRecordComponent_acceptButtonText').toUpperCase()}</Text>
              </TouchableOpacity>

            </View>}
          </View>}

          {this.state.step === EmailRecordComponent.STEPS.view && <View style={styles.bodyContent}>
            <ScrollView contentContainerStyle={styles.content}>
              <Text style={styles.title}>{i18n.t('EmailRecordComponent_title2')}</Text>
              <Text style={styles.message}>{i18n.t('EmailRecordComponent_message2')}</Text>
              <FlatList data={this.state.acceptedList}
                keyExtractor={(item, index) => index + ''}
                renderItem={({ item, index }) => {
                  return (<View key={index}>
                    <Text style={styles.acceptedEmailRecordItem}>- {item.assetName}</Text>
                  </View>);
                }}
              />

            </ScrollView>
            <View style={styles.buttonArea}>
              <TouchableOpacity style={styles.viewButton} onPress={() => {
                Actions.reset('user');
                Actions.bitmarkList({ bitmarkType: 'bitmark_health_issuance' });
                DataProcessor.finishedDisplayEmailRecords();
              }} >
                <Text style={styles.viewButtonText}>{i18n.t('EmailRecordComponent_viewButtonText').toUpperCase()}</Text>
              </TouchableOpacity>
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
    padding: convertWidth(16),
    paddingTop: convertWidth(16),
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
  },
  title: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Light',
    fontWeight: '900',
    fontSize: 36,
    color: '#464646',
  },
  message: {
    marginTop: 24,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Light',
    fontWeight: '300',
    fontSize: 16,
  },
  emailRecordItem: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Medium',
    fontWeight: '300',
    fontSize: 16,
    color: '#0060F1',
    marginTop: 20,
  },

  acceptedEmailRecordItem: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Medium',
    fontWeight: '300',
    fontSize: 16,
    marginTop: 20,
  },
  processingText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Black',
    fontWeight: '800',
    fontSize: 16,
    color: '#0060F1',
    marginTop: 16,
  },
  existingAssetMessage: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Medium',
    fontWeight: '300',
    fontSize: 16,
    marginTop: 20,
  },

  buttonArea: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft: convertWidth(20),
    paddingRight: convertWidth(20),
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: constants.buttonHeight,
    backgroundColor: '#FF4444',
    width: convertWidth(143),
  },
  acceptButtonText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Medium',
    fontWeight: '800',
    fontSize: 16,
    color: 'white'
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: constants.buttonHeight,
    width: convertWidth(143),
    borderColor: '#FF4444',
    borderWidth: 1,
  },
  rejectButtonText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Medium',
    fontWeight: '800',
    fontSize: 16,
    color: '#FF4444'
  },

  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: constants.buttonHeight,
    width: '100%',
    backgroundColor: '#FF4444'
  },
  viewButtonText: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Medium',
    fontWeight: '800',
    fontSize: 16,
    color: 'white'
  },

});
