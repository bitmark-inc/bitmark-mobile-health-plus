import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactNative, {
  StyleSheet,
  Image, View, TouchableOpacity, Text, SafeAreaView, ScrollView, TextInput, KeyboardAvoidingView,
} from 'react-native';
import moment from 'moment';
import { convertWidth, } from 'src/utils';
import { ShadowComponent, ShadowTopComponent } from 'src/views/commons';
import { Actions } from 'react-native-router-flux';
import ImagePicker from 'react-native-image-picker';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';
import { merge } from 'lodash';

import DatePicker from 'react-native-datepicker';
import PickerSelect from 'react-native-picker-select';
import { AppProcessor, EventEmitterService } from 'src/processors';

const { ActionSheetIOS } = ReactNative;

export class MMRInformationComponent extends Component {
  static propTypes = {
    mmrInformation: PropTypes.any,
    displayFromUserScreen: PropTypes.bool,
    edit: PropTypes.bool
  }

  constructor(props) {
    super(props);
    this.state = {
      isEditing: this.props.mmrInformation ? (this.props.edit ? true : false) : true,
      mmrInformation: this.props.mmrInformation || {},
    };
  }

  updateMMRInformationState(data) {
    console.log('updateMMRInformationState :', data);
    let mmrInformation = this.state.mmrInformation;
    mmrInformation = merge({}, mmrInformation, data);
    this.setState({ mmrInformation });
  }

  chooseAvatar() {
    ActionSheetIOS.showActionSheetWithOptions({
      title: 'Add an image',
      options: ['Cancel',
        'Take Photo...',
        'Choose from Library...',
        'Files...',
      ],
      cancelButtonIndex: 0,
    },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 1: {
            ImagePicker.launchCamera({}, async (response) => {
              if (response.error || response.didCancel) {
                return;
              }
              this.updateMMRInformationState({ avatar: 'data:image/jpeg;base64,' + response.data });
            });
            break;
          }
          case 2: {
            ImagePicker.launchImageLibrary({}, async (response) => {
              if (response.error || response.didCancel) {
                return;
              }
              this.updateMMRInformationState({ avatar: 'data:image/jpeg;base64,' + response.data });
            });
            break;
          }
          case 3: {
            DocumentPicker.show({
              filetype: [DocumentPickerUtil.images()],
            }, async (error, response) => {
              if (error) {
                return;
              }
              console.log('DocumentPicker :', response);
              this.updateMMRInformationState({ avatar: 'data:image/jpeg;base64,' + response.data });
            });
            break;
          }
          default: {
            break;
          }
        }
      });
  }

  saveMMRInformation() {
    AppProcessor.doIssueMMR(this.state.mmrInformation).then(result => {
      if (result) {
        Actions.pop();
      }
    }).catch(error => {
      console.log('error:', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    })
  }

  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerLeft} onPress={() => this.props.displayFromUserScreen ? Actions.account() : Actions.pop()}>
            <Image style={styles.headerLeftBackIcon} source={require('assets/imgs2/back_icon_black.png')} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Minimum Medical Record</Text>
          <TouchableOpacity style={styles.headerRight} disabled={this.state.isEditing} onPress={() => this.setState({ isEditing: !this.state.isEditing })}>
            {!this.state.isEditing && <Image style={styles.headerLeftBackIcon} source={require('assets/imgs2/edition_icon_black.png')} />}
          </TouchableOpacity>
        </View>
        {!this.state.isEditing && <ScrollView contentContainerStyle={styles.body}>
          <ShadowComponent style={styles.cardBody}>
            <ShadowTopComponent contentStyle={styles.cardHeader}>
              <View style={styles.cardTitle}>
                <Text style={styles.cardTitleText}>PROFILE</Text>
              </View>
              <Image style={styles.cardHeaderIcon} source={require('assets/imgs2/mmr_profile_icon.png')} />
            </ShadowTopComponent>
            <View style={styles.cardContentRow}>
              <Image style={styles.mmrInformationAvatar} source={this.state.mmrInformation.avatar ? { uri: this.state.mmrInformation.avatar } : require('assets/imgs2/mmr_avarta_default.png')} />
              <View style={styles.mmrInformationBasic}>
                <Text style={styles.mmrInformationLabel}>Name</Text>
                <Text style={styles.mmrInformationValue}>{this.state.mmrInformation.name || 'TODO'}</Text>
                <View style={{ flex: 1, flexDirection: 'row', marginTop: 21 }}>
                  <View style={{ flex: 1, flexDirection: 'column' }}>
                    <Text style={styles.mmrInformationLabel}>Date of birth</Text>
                    <Text style={styles.mmrInformationValue}>{this.state.mmrInformation.birthday ? moment(this.state.mmrInformation.birthday).format('MMM DD, YYYY') : 'TODO'}</Text>
                  </View>
                  <View style={{ flex: 1, flexDirection: 'column', marginLeft: convertWidth(16), }}>
                    <Text style={styles.mmrInformationLabel}>Sex</Text>
                    <Text style={styles.mmrInformationValue}>{this.state.mmrInformation.sex || 'TODO'}</Text>
                  </View>
                </View>
              </View>
            </View>
          </ShadowComponent>

          <ShadowComponent style={styles.cardBody}>
            <ShadowTopComponent contentStyle={styles.cardHeader}>
              <View style={styles.cardTitle}>
                <Text style={styles.cardTitleText}>{'Active Clinical Diagnoses'.toUpperCase()}</Text>
              </View>
              <Image style={styles.cardHeaderIcon} source={require('assets/imgs2/mmr_information_icon_1.png')} />
            </ShadowTopComponent>
            <View style={styles.cardContentRow}>
              <Text>{this.state.mmrInformation.activeClinicalDiagnoses}</Text>
            </View>
          </ShadowComponent>

          <ShadowComponent style={styles.cardBody}>
            <ShadowTopComponent contentStyle={styles.cardHeader}>
              <View style={styles.cardTitle}>
                <Text style={styles.cardTitleText}>{'CURRENT TREATMENTS & DOSAGES'.toUpperCase()}</Text>
              </View>
              <Image style={styles.cardHeaderIcon} source={require('assets/imgs2/mmr_information_icon_2.png')} />
            </ShadowTopComponent>
            <View style={styles.cardContentRow}>
              <Text>{this.state.mmrInformation.currentTreatmentsAndDosages}</Text>
            </View>
          </ShadowComponent>

          <ShadowComponent style={styles.cardBody}>
            <ShadowTopComponent contentStyle={styles.cardHeader}>
              <View style={styles.cardTitle}>
                <Text style={styles.cardTitleText}>{'ALLERGIES & REACTIONS'.toUpperCase()}</Text>
              </View>
              <Image style={styles.cardHeaderIcon} source={require('assets/imgs2/mmr_information_icon_3.png')} />
            </ShadowTopComponent>
            <View style={styles.cardContentRow}>
              <Text>{this.state.mmrInformation.allergiesAndReactions}</Text>
            </View>
          </ShadowComponent>

          <ShadowComponent style={styles.cardBody}>
            <ShadowTopComponent contentStyle={styles.cardHeader}>
              <View style={styles.cardTitle}>
                <Text style={styles.cardTitleText}>{'Visible & Invisible Disabilities'.toUpperCase()}</Text>
              </View>
              <Image style={styles.cardHeaderIcon} source={require('assets/imgs2/mmr_information_icon_4.png')} />
            </ShadowTopComponent>
            <View style={styles.cardContentRow}>
              <Text>{this.state.mmrInformation.visibleAndInvisibleDisabilities}</Text>
            </View>
          </ShadowComponent>
        </ScrollView>}

        {this.state.isEditing && <KeyboardAvoidingView behavior="padding" enabled style={{ flex: 1 }} >
          <ScrollView contentContainerStyle={styles.body}>
            <ShadowComponent style={styles.cardBody}>
              <ShadowTopComponent contentStyle={styles.cardHeader}>
                <View style={styles.cardTitle}>
                  <Text style={styles.cardTitleText}>PROFILE</Text>
                </View>
                <Image style={styles.cardHeaderIcon} source={require('assets/imgs2/mmr_profile_icon.png')} />
              </ShadowTopComponent>
              <View style={styles.cardContentRow}>
                <TouchableOpacity onPress={this.chooseAvatar.bind(this)}>
                  <Image style={styles.mmrInformationAvatar} source={this.state.mmrInformation.avatar ? { uri: this.state.mmrInformation.avatar } : require('assets/imgs2/mmr_avarta_default.png')} />
                </TouchableOpacity>
                <View style={styles.mmrInformationBasic}>
                  <Text style={styles.mmrInformationLabel}>Name</Text>
                  <TextInput style={[styles.mmrInformationValueInput, { paddingLeft: convertWidth(16), paddingRight: convertWidth(16) }]}
                    placeholder='TAP TO INPUT'
                    defaultValue={this.state.mmrInformation.name}
                    onChangeText={(name) => this.updateMMRInformationState.bind(this)({ name })}
                  />
                  <View style={{ flex: 1, flexDirection: 'row', marginTop: 16 }}>
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                      <Text style={styles.mmrInformationLabel}>Date of birth</Text>
                      <DatePicker style={styles.mmrInformationValueInput}
                        date={this.state.mmrInformation.birthday}
                        onDateChange={(birthday) => this.updateMMRInformationState.bind(this)({ birthday: moment(birthday, 'DD|MM|YYYY').toDate() })}
                        maxDate={moment().toDate()}
                        format="DD|MM|YYYY"
                        placeholder="DD|MM|YYYY"
                        showIcon={false}
                        mode="date"
                        customStyles={{
                          dateInput: { borderWidth: 0, padding: 0, margin: 0, height: '100%', },
                          dateTouchBody: { padding: 0, margin: 0, height: '100%', alignItems: 'center', justifyContent: 'center', }
                        }}
                        confirmBtnText="Confirm"
                        cancelBtnText="Cancel"
                      >
                      </DatePicker>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'column', marginLeft: convertWidth(16), }}>
                      <Text style={styles.mmrInformationLabel}>Sex</Text>
                      <View style={styles.mmrInformationValueInput}>
                        <PickerSelect
                          style={{ inputIOS: { width: '100%', height: '100%', padding: 8, } }}
                          selectedValue={this.state.mmrInformation.sex}
                          placeholder={{
                            label: 'SELECT',
                            value: null,
                            color: '#9EA0A4',
                          }}
                          items={[{ label: 'MALE', value: 'MALE' }, { label: 'FEMALE', value: 'FEMALE' }]}
                          hideIcon={true}
                          hideDoneBar={true}
                          onValueChange={(sex) => this.updateMMRInformationState.bind(this)({ sex })}>
                        </PickerSelect>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </ShadowComponent>

            <ShadowComponent style={styles.cardBody}>
              <ShadowTopComponent contentStyle={styles.cardHeader}>
                <View style={styles.cardTitle}>
                  <Text style={styles.cardTitleText}>{'Active Clinical Diagnoses'.toUpperCase()}</Text>
                </View>
                <Image style={styles.cardHeaderIcon} source={require('assets/imgs2/mmr_information_icon_1.png')} />
              </ShadowTopComponent>
              <View style={[styles.cardContentRow, { paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, }]}>
                <TextInput style={[styles.mmrInformationValueInput, { height: 103, padding: convertWidth(16) }]}
                  placeholder='TAP TO INPUT'
                  defaultValue={this.state.mmrInformation.activeClinicalDiagnoses}
                  onChangeText={(activeClinicalDiagnoses) => this.updateMMRInformationState.bind(this)({ activeClinicalDiagnoses })}
                  multiline={true}
                />
              </View>
            </ShadowComponent>

            <ShadowComponent style={styles.cardBody}>
              <ShadowTopComponent contentStyle={styles.cardHeader}>
                <View style={styles.cardTitle}>
                  <Text style={styles.cardTitleText}>{'CURRENT TREATMENTS & DOSAGES'.toUpperCase()}</Text>
                </View>
                <Image style={styles.cardHeaderIcon} source={require('assets/imgs2/mmr_information_icon_2.png')} />
              </ShadowTopComponent>
              <View style={[styles.cardContentRow, { paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, }]}>
                <TextInput style={[styles.mmrInformationValueInput, { height: 103, padding: convertWidth(16) }]}
                  placeholder='TAP TO INPUT'
                  defaultValue={this.state.mmrInformation.currentTreatmentsAndDosages}
                  onChangeText={(currentTreatmentsAndDosages) => this.updateMMRInformationState.bind(this)({ currentTreatmentsAndDosages })}
                  multiline={true}
                />
              </View>
            </ShadowComponent>

            <ShadowComponent style={styles.cardBody}>
              <ShadowTopComponent contentStyle={styles.cardHeader}>
                <View style={styles.cardTitle}>
                  <Text style={styles.cardTitleText}>{'ALLERGIES & REACTIONS'.toUpperCase()}</Text>
                </View>
                <Image style={styles.cardHeaderIcon} source={require('assets/imgs2/mmr_information_icon_3.png')} />
              </ShadowTopComponent>
              <View style={[styles.cardContentRow, { paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, }]}>
                <TextInput style={[styles.mmrInformationValueInput, { height: 103, padding: convertWidth(16) }]}
                  placeholder='TAP TO INPUT'
                  defaultValue={this.state.mmrInformation.allergiesAndReactions}
                  onChangeText={(allergiesAndReactions) => this.updateMMRInformationState.bind(this)({ allergiesAndReactions })}
                  multiline={true}
                />
              </View>
            </ShadowComponent>

            <ShadowComponent style={styles.cardBody}>
              <ShadowTopComponent contentStyle={styles.cardHeader}>
                <View style={styles.cardTitle}>
                  <Text style={styles.cardTitleText}>{'Visible & Invisible Disabilities'.toUpperCase()}</Text>
                </View>
                <Image style={styles.cardHeaderIcon} source={require('assets/imgs2/mmr_information_icon_4.png')} />
              </ShadowTopComponent>
              <View style={[styles.cardContentRow, { paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, }]}>
                <TextInput style={[styles.mmrInformationValueInput, { height: 103, padding: convertWidth(16) }]}
                  placeholder='TAP TO INPUT'
                  defaultValue={this.state.mmrInformation.visibleAndInvisibleDisabilities}
                  onChangeText={(visibleAndInvisibleDisabilities) => this.updateMMRInformationState.bind(this)({ visibleAndInvisibleDisabilities })}
                  multiline={true}
                />
              </View>
            </ShadowComponent>
            <TouchableOpacity style={styles.saveButton} onPress={this.saveMMRInformation.bind(this)}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>}
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
    padding: convertWidth(15),
    paddingTop: convertWidth(15),
    flexGrow: 1,
  },

  header: {
    height: 56, width: '100%',
    flexDirection: 'row', alignItems: 'center',
  },
  headerLeft: {
    paddingLeft: convertWidth(19),
    width: convertWidth(35),
  },

  headerLeftBackIcon: {
    width: 16, height: '100%', resizeMode: 'contain',
  },
  headerTitle: {
    fontFamily: 'Avenir Black', fontSize: 24, fontWeight: '900', textAlign: 'center',
    flex: 1
  },
  headerRight: {
    paddingRight: convertWidth(19),
    width: convertWidth(35),
  },

  cardBody: {
    flexDirection: 'column',
    marginTop: 12,
    width: convertWidth(344),
  },
  cardHeader: {
    width: '100%', height: 40,
    flex: 1, flexDirection: 'row', justifyContent: 'space-between',
  },
  cardTitle: {
    flex: 1, width: '100%', height: '100%',
    paddingLeft: convertWidth(15), flexDirection: 'row', alignItems: 'center',
  },
  cardTitleText: {
    fontFamily: 'Avenir Light', fontSize: 10, fontWeight: '300',
  },
  cardHeaderIcon: {
    width: 26, height: 33, resizeMode: 'contain',
    marginRight: convertWidth(18),
  },
  cardContentRow: {
    paddingTop: 25, paddingBottom: 25, paddingLeft: convertWidth(15), paddingRight: convertWidth(15),
    flex: 1, flexDirection: 'row',
  },
  mmrInformationAvatar: {
    width: 76, height: 76, resizeMode: 'center',
    borderWidth: 1, borderColor: 'white', borderRadius: 38,
    marginRight: convertWidth(15),
  },
  mmrInformationBasic: {
    flex: 1,
  },
  mmrInformationLabel: {
    fontFamily: 'Avenir Light', fontSize: 10, fontWeight: '300', color: '#545454',
  },
  mmrInformationValue: {
    fontFamily: 'Avenir Light', fontSize: 14, fontWeight: '900', color: '#545454',
    marginTop: 3,
  },

  mmrInformationValueInput: {
    marginTop: 3,
    flex: 1, width: '100%', height: 32,
    backgroundColor: '#F5F5F5',
    borderColor: 'transparent', borderWidth: 0.1, borderRadius: 4,
    shadowOffset: { width: 0, height: 0, }, shadowOpacity: 0.2, shadowColor: '#000', shadowRadius: 5,
  },
  saveButton: {
    borderWidth: 1, borderColor: '#0060F2', borderRadius: 4,
    backgroundColor: '#0060F2',
    height: 36,
    marginTop: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: 'Avenir Black', fontSize: 14, fontWeight: '900', color: 'white',
  }
});
