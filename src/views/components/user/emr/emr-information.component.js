import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactNative, {
  StyleSheet,
  Image, View, TouchableOpacity, Text, SafeAreaView, ScrollView, TextInput, KeyboardAvoidingView,
} from 'react-native';
import moment from 'moment';
import { convertWidth, FileUtil, getImageSize, } from 'src/utils';
import { ShadowComponent, ShadowTopComponent } from 'src/views/commons';
import { Actions } from 'react-native-router-flux';
import ImagePicker from 'react-native-image-picker';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';
import { merge } from 'lodash';
import ImageResizer from 'react-native-image-resizer';

import DatePicker from 'react-native-datepicker';
import PickerSelect from 'react-native-picker-select';
import { AppProcessor, EventEmitterService } from 'src/processors';

const { ActionSheetIOS } = ReactNative;
import { selectContactPhone } from 'react-native-select-contact';

export class EMRInformationComponent extends Component {
  static propTypes = {
    emrInformation: PropTypes.any,
    displayFromUserScreen: PropTypes.bool,
    edit: PropTypes.bool
  }

  constructor(props) {
    super(props);
    this.resizeAvatar = this.resizeAvatar.bind(this);
    this.state = {
      isEditing: this.props.emrInformation ? (this.props.edit ? true : false) : true,
      emrInformation: this.props.emrInformation || {},
    };
  }

  updateEMRInformationState(data) {
    console.log('updateEMRInformationState :', data);
    let emrInformation = this.state.emrInformation;
    emrInformation = merge({}, emrInformation, data);
    this.setState({ emrInformation });
  }

  async resizeAvatar(filePath) {
    let imageSize = await getImageSize(filePath);
    console.log({ imageSize });
    let newSize;
    if (imageSize.width < imageSize.height) {
      newSize = { width: 100, height: 100 * (imageSize.height / imageSize.width) };
    } else {
      newSize = { width: 100 * (imageSize.width / imageSize.height), height: 100 };
    }
    console.log({ filePath, newSize });
    let temp = await ImageResizer.createResizedImage(filePath, newSize.width, newSize.height, 'PNG', 100, 0, FileUtil.CacheDirectory);
    return await FileUtil.readFile(temp.uri, 'base64');
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
              let filePath = response.uri;
              this.updateEMRInformationState({ avatar: 'data:image/jpeg;base64,' + (await this.resizeAvatar(filePath)) });
            });
            break;
          }
          case 2: {
            ImagePicker.launchImageLibrary({}, async (response) => {
              if (response.error || response.didCancel) {
                return;
              }
              let filePath = response.uri;
              this.updateEMRInformationState({ avatar: 'data:image/jpeg;base64,' + (await this.resizeAvatar(filePath)) });
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
              let filePath = response.uri.replace('file://', '');
              this.updateEMRInformationState({ avatar: 'data:image/jpeg;base64,' + (await this.resizeAvatar(filePath)) });
            });
            break;
          }
          default: {
            break;
          }
        }
      });
  }
  addEmergencyContact() {
    selectContactPhone().then((data) => {
      if (!data) {
        return;
      }
      let relationshipArray = [
        'Cancel',
        'mother', 'father', 'parent', 'brother', 'sister', 'son', 'daughter', 'child',
        'friend', 'spouse', 'partner', 'assistant', 'manager',
        'other', 'roommate', 'doctor', 'emergency',
      ]
      ActionSheetIOS.showActionSheetWithOptions({
        title: 'Relationship',
        options: relationshipArray,
        cancelButtonIndex: 0,
      }, (buttonIndex) => {
        if (buttonIndex > 0) {
          let emrInformation = this.state.emrInformation;
          emrInformation.emergencyContacts = emrInformation.emergencyContacts || [];
          emrInformation.emergencyContacts.push({
            relationship: relationshipArray[buttonIndex],
            name: data.contact.name,
            phoneNumber: data.selectedPhone.number,
            type: data.selectedPhone.type,
          });
          this.setState({ emrInformation });
        }
      });
    }).catch(error => {
      console.log({ error });
    });
  }

  deleteEmergencyContact(index) {
    let emrInformation = this.state.emrInformation;
    emrInformation.emergencyContacts = emrInformation.emergencyContacts || [];
    emrInformation.emergencyContacts.splice(index, 1);
    this.setState({ emrInformation });
  }

  saveEMRInformation() {
    AppProcessor.doIssueEMR(this.state.emrInformation).then(result => {
      if (result) {
        Actions.pop();
      }
    }).catch(error => {
      console.log('error:', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    })
  }

  render() {
    console.log('emrInformation :', this.state.emrInformation);
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerLeft} onPress={() => this.props.displayFromUserScreen ? Actions.account() : Actions.pop()}>
            <Image style={styles.headerLeftBackIcon} source={require('assets/imgs2/back_icon_black.png')} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}></Text>
          <TouchableOpacity style={styles.headerRight} disabled={this.state.isEditing} onPress={() => this.setState({ isEditing: !this.state.isEditing })}>
            {!this.state.isEditing && <Text style={styles.headerEditText}>EDIT</Text>}
          </TouchableOpacity>
        </View>
        {!this.state.isEditing && <ScrollView contentContainerStyle={styles.body}>
          <ShadowComponent style={[styles.cardBody, { marginTop: 0 }]}>
            <ShadowTopComponent contentStyle={styles.cardHeader}>
              <View style={styles.cardTitle}>
                <Text style={styles.cardTitleText}>PROFILE</Text>
              </View>
              <Image style={styles.cardHeaderIcon} source={require('assets/imgs2/emr_profile_icon.png')} />
            </ShadowTopComponent>
            <View style={styles.cardContentRow}>
              <Image style={styles.emrInformationAvatar} source={this.state.emrInformation.avatar ? { uri: this.state.emrInformation.avatar } : require('assets/imgs2/emr_avatar_default.png')} />
              <View style={styles.emrInformationBasic}>
                <Text style={styles.emrInformationLabel}>Name</Text>
                <Text style={styles.emrInformationValue}>{this.state.emrInformation.name}</Text>
                <View style={{ flex: 1, flexDirection: 'row', marginTop: 21 }}>
                  <View style={{ flex: 1, flexDirection: 'column' }}>
                    <Text style={styles.emrInformationLabel}>Date of birth</Text>
                    <Text style={styles.emrInformationValue}>{this.state.emrInformation.birthday ? moment(this.state.emrInformation.birthday).format('MMM DD, YYYY') : 'TODO'}</Text>
                  </View>
                  <View style={{ flex: 1, flexDirection: 'column', marginLeft: convertWidth(16), }}>
                    <Text style={styles.emrInformationLabel}>Sex</Text>
                    <Text style={styles.emrInformationValue}>{this.state.emrInformation.sex ?
                      (this.state.emrInformation.sex.substring(0, 1).toUpperCase() + this.state.emrInformation.sex.substring(1, this.state.emrInformation.sex.length).toUpperCase().toLowerCase()) : ''}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.emergencyContactArea}>
              <Text style={styles.emergencyContactTitle}>
                EMERGENCY CONTACTS
                </Text>
              {(this.state.emrInformation.emergencyContacts || []).map((item, index) => {
                return <View key={index} style={styles.emergencyContactRow}>
                  <Text style={styles.emergencyContactRowRelationship}>{item.relationship.substring(0, 1).toUpperCase() + item.relationship.substring(1, item.relationship.length).toLowerCase()}</Text>
                  <View style={styles.emergencyContactRowInfo}>
                    <Text style={styles.emergencyContactRowInfoName}>{item.name}</Text>
                    <Text style={styles.emergencyContactRowInfoPhoneNumber}>{item.phoneNumber}</Text>
                  </View>
                </View>
              })}
            </View>
          </ShadowComponent>

          <ShadowComponent style={styles.cardBody}>
            <ShadowTopComponent contentStyle={styles.cardHeader}>
              <View style={styles.cardTitle}>
                <Text style={styles.cardTitleText}>{'CURRENT DIAGNOSES & CRITICAL HISTORY'.toUpperCase()}</Text>
              </View>
              <Image style={styles.cardHeaderIcon} source={require('assets/imgs2/emr_information_icon_1.png')} />
            </ShadowTopComponent>
            <View style={styles.cardContentRow}>
              <Text style={styles.cardContentRowValue}>{this.state.emrInformation.activeClinicalDiagnoses}</Text>
            </View>
          </ShadowComponent>

          <ShadowComponent style={styles.cardBody}>
            <ShadowTopComponent contentStyle={styles.cardHeader}>
              <View style={styles.cardTitle}>
                <Text style={styles.cardTitleText}>{'CURRENT TREATMENTS & DOSAGES'.toUpperCase()}</Text>
              </View>
              <Image style={styles.cardHeaderIcon} source={require('assets/imgs2/emr_information_icon_2.png')} />
            </ShadowTopComponent>
            <View style={styles.cardContentRow}>
              <Text style={styles.cardContentRowValue}>{this.state.emrInformation.currentTreatmentsAndDosages}</Text>
            </View>
          </ShadowComponent>

          <ShadowComponent style={styles.cardBody}>
            <ShadowTopComponent contentStyle={styles.cardHeader}>
              <View style={styles.cardTitle}>
                <Text style={styles.cardTitleText}>{'ALLERGIES & REACTIONS'.toUpperCase()}</Text>
              </View>
              <Image style={styles.cardHeaderIcon} source={require('assets/imgs2/emr_information_icon_3.png')} />
            </ShadowTopComponent>
            <View style={styles.cardContentRow}>
              <Text style={styles.cardContentRowValue}>{this.state.emrInformation.allergiesAndReactions}</Text>
            </View>
          </ShadowComponent>

          <ShadowComponent style={styles.cardBody}>
            <ShadowTopComponent contentStyle={styles.cardHeader}>
              <View style={styles.cardTitle}>
                <Text style={styles.cardTitleText}>{'Visible & Invisible Disabilities'.toUpperCase()}</Text>
              </View>
              <Image style={styles.cardHeaderIcon} source={require('assets/imgs2/emr_information_icon_4.png')} />
            </ShadowTopComponent>
            <View style={styles.cardContentRow}>
              <Text style={styles.cardContentRowValue}>{this.state.emrInformation.visibleAndInvisibleDisabilities}</Text>
            </View>
          </ShadowComponent>
        </ScrollView>}

        {this.state.isEditing && <KeyboardAvoidingView behavior="padding" enabled style={{ flex: 1 }} >
          <ScrollView contentContainerStyle={styles.body}>
            <ShadowComponent style={[styles.cardBody, { marginTop: 0 }]}>
              <ShadowTopComponent contentStyle={styles.cardHeader}>
                <View style={styles.cardTitle}>
                  <Text style={styles.cardTitleText}>PROFILE</Text>
                </View>
                <Image style={styles.cardHeaderIcon} source={require('assets/imgs2/emr_profile_icon.png')} />
              </ShadowTopComponent>
              <View style={styles.cardContentRow}>
                <TouchableOpacity onPress={this.chooseAvatar.bind(this)}>
                  <Image style={styles.emrInformationAvatar} source={this.state.emrInformation.avatar ? { uri: this.state.emrInformation.avatar } : require('assets/imgs2/emr_avatar_default.png')} />
                  <Image style={styles.emrInformationAvatarCover} source={require('assets/imgs2/emr_avatar_edit_cover.png')} />
                  {/* <View style={styles.emrInformationAvatarCover}><Text style={{ fontFamily: 'Andale Mono', fontSize: 12, color: '#404040' }}>EDIT</Text></View> */}
                </TouchableOpacity>
                <View style={styles.emrInformationBasic}>
                  <Text style={styles.emrInformationLabel}>Name</Text>
                  <TextInput style={[styles.emrInformationValueInput, { paddingLeft: convertWidth(16), paddingRight: convertWidth(16), }]}
                    placeholder='TAP TO INPUT'
                    defaultValue={this.state.emrInformation.name}
                    onChangeText={(name) => this.updateEMRInformationState.bind(this)({ name })}
                  />
                  <View style={{ flex: 1, flexDirection: 'row', marginTop: 16 }}>
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                      <Text style={styles.emrInformationLabel}>Date of birth</Text>
                      <DatePicker style={{
                        marginTop: 3,
                        flex: 1, width: '100%', height: 32,
                        backgroundColor: '#F5F5F5',
                        borderColor: 'transparent', borderWidth: 0.1, borderRadius: 4,
                        shadowOffset: { width: 0, height: 0, }, shadowOpacity: 0.2, shadowColor: '#000', shadowRadius: 5,
                      }}
                        date={this.state.emrInformation.birthday ? moment(this.state.emrInformation.birthday).toDate() : undefined}
                        onDateChange={(birthday) => this.updateEMRInformationState.bind(this)({ birthday: moment(birthday, 'DD|MM|YYYY').toDate() })}
                        maxDate={moment().toDate()}
                        format="DD|MM|YYYY"
                        placeholder="DD|MM|YYYY"
                        showIcon={false}
                        mode="date"
                        customStyles={{
                          btnTextConfirm: { color: '#FF003C' },
                          dateInput: { borderWidth: 0, padding: 0, margin: 0, height: '100%', },
                          dateTouchBody: { padding: 0, margin: 0, height: '100%', alignItems: 'center', justifyContent: 'center', }
                        }}
                        confirmBtnText="Confirm"
                        cancelBtnText="Cancel"
                      >
                      </DatePicker>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'column', marginLeft: convertWidth(16), }}>
                      <Text style={styles.emrInformationLabel}>Sex</Text>
                      <View style={styles.emrInformationValueInput}>
                        <PickerSelect
                          style={{
                            inputIOS: { width: '100%', height: '100%', padding: 8, color: 'rgba(0, 0, 0, 0.87)' },
                            modalViewMiddle: { justifyContent: 'flex-end' },
                            chevronContainer: { display: 'none' }
                          }}
                          value={this.state.emrInformation.sex}
                          placeholder={{
                            label: 'SELECT',
                            value: null,
                            color: '#9EA0A4',
                          }}
                          items={[{ label: 'MALE', value: 'MALE' }, { label: 'FEMALE', value: 'FEMALE' }]}
                          hideIcon={true}
                          onValueChange={(sex) => this.updateEMRInformationState.bind(this)({ sex })}>
                        </PickerSelect>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.emergencyContactArea}>
                <Text style={styles.emergencyContactTitle}>
                  EMERGENCY CONTACTS
                </Text>
                {(this.state.emrInformation.emergencyContacts || []).map((item, index) => {
                  return <View key={index} style={styles.emergencyContactRow}>
                    <Text style={styles.emergencyContactRowRelationship}>{item.relationship.substring(0, 1).toUpperCase() + item.relationship.substring(1, item.relationship.length).toLowerCase()}</Text>
                    <View style={styles.emergencyContactRowInfo}>
                      <Text style={styles.emergencyContactRowInfoName}>{item.name}</Text>
                      <Text style={styles.emergencyContactRowInfoPhoneNumber}>{item.phoneNumber}</Text>
                    </View>
                    <TouchableOpacity style={{ padding: 4, }} onPress={() => this.deleteEmergencyContact.bind(this)(index)}>
                      <Image style={styles.emergencyContactRowDeleteIcon} source={require('assets/imgs2/delete_icon.png')} />
                    </TouchableOpacity>
                  </View>
                })}
                <TouchableOpacity style={styles.addEmergencyContactButton} onPress={this.addEmergencyContact.bind(this)}>
                  <Text style={styles.addEmergencyContactButtonText}>
                    + ADD EMERGENCY CONTACT
                    </Text>
                </TouchableOpacity>
              </View>
            </ShadowComponent>

            <ShadowComponent style={styles.cardBody}>
              <ShadowTopComponent contentStyle={styles.cardHeader}>
                <View style={styles.cardTitle}>
                  <Text style={styles.cardTitleText}>{'CURRENT DIAGNOSES & CRITICAL HISTORY'.toUpperCase()}</Text>
                </View>
                <Image style={styles.cardHeaderIcon} source={require('assets/imgs2/emr_information_icon_1.png')} />
              </ShadowTopComponent>
              <View style={[styles.cardContentRow, { paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, }]}>
                <TextInput style={[styles.emrInformationValueInput, { height: 103, padding: convertWidth(16) }]}
                  placeholder='TAP TO INPUT'
                  defaultValue={this.state.emrInformation.activeClinicalDiagnoses}
                  onChangeText={(activeClinicalDiagnoses) => this.updateEMRInformationState.bind(this)({ activeClinicalDiagnoses })}
                  multiline={true}
                />
              </View>
            </ShadowComponent>

            <ShadowComponent style={styles.cardBody}>
              <ShadowTopComponent contentStyle={styles.cardHeader}>
                <View style={styles.cardTitle}>
                  <Text style={styles.cardTitleText}>{'CURRENT TREATMENTS & DOSAGES'.toUpperCase()}</Text>
                </View>
                <Image style={styles.cardHeaderIcon} source={require('assets/imgs2/emr_information_icon_2.png')} />
              </ShadowTopComponent>
              <View style={[styles.cardContentRow, { paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, }]}>
                <TextInput style={[styles.emrInformationValueInput, { height: 103, padding: convertWidth(16) }]}
                  placeholder='TAP TO INPUT'
                  defaultValue={this.state.emrInformation.currentTreatmentsAndDosages}
                  onChangeText={(currentTreatmentsAndDosages) => this.updateEMRInformationState.bind(this)({ currentTreatmentsAndDosages })}
                  multiline={true}
                />
              </View>
            </ShadowComponent>

            <ShadowComponent style={styles.cardBody}>
              <ShadowTopComponent contentStyle={styles.cardHeader}>
                <View style={styles.cardTitle}>
                  <Text style={styles.cardTitleText}>{'ALLERGIES & REACTIONS'.toUpperCase()}</Text>
                </View>
                <Image style={styles.cardHeaderIcon} source={require('assets/imgs2/emr_information_icon_3.png')} />
              </ShadowTopComponent>
              <View style={[styles.cardContentRow, { paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, }]}>
                <TextInput style={[styles.emrInformationValueInput, { height: 103, padding: convertWidth(16) }]}
                  placeholder='TAP TO INPUT'
                  defaultValue={this.state.emrInformation.allergiesAndReactions}
                  onChangeText={(allergiesAndReactions) => this.updateEMRInformationState.bind(this)({ allergiesAndReactions })}
                  multiline={true}
                />
              </View>
            </ShadowComponent>

            <ShadowComponent style={styles.cardBody}>
              <ShadowTopComponent contentStyle={styles.cardHeader}>
                <View style={styles.cardTitle}>
                  <Text style={styles.cardTitleText}>{'Visible & Invisible Disabilities'.toUpperCase()}</Text>
                </View>
                <Image style={styles.cardHeaderIcon} source={require('assets/imgs2/emr_information_icon_4.png')} />
              </ShadowTopComponent>
              <View style={[styles.cardContentRow, { paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0, }]}>
                <TextInput style={[styles.emrInformationValueInput, { height: 103, padding: convertWidth(16) }]}
                  placeholder='TAP TO INPUT'
                  defaultValue={this.state.emrInformation.visibleAndInvisibleDisabilities}
                  onChangeText={(visibleAndInvisibleDisabilities) => this.updateEMRInformationState.bind(this)({ visibleAndInvisibleDisabilities })}
                  multiline={true}
                />
              </View>
            </ShadowComponent>
            <TouchableOpacity style={styles.saveButton} onPress={this.saveEMRInformation.bind(this)}>
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
    paddingTop: convertWidth(12),
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
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 20, textAlign: 'center',
    flex: 1
  },
  headerRight: {
    paddingRight: convertWidth(19),
    width: convertWidth(50),
  },
  headerEditText: {
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 10,
    letterSpacing: 1.5,
    color: '#FF003C',
    width: '100%',
    textAlign: 'right'
  },
  emergencyContactArea: {
    flexDirection: 'column',
    paddingLeft: convertWidth(15), paddingRight: convertWidth(15),
    paddingBottom: 10,
  },
  emergencyContactTitle: {
    width: '100%',
    paddingLeft: 76 + convertWidth(15),
    fontFamily: 'AvenirNextW1G-Light', fontSize: 10,
    letterSpacing: 1.5,
  },
  emergencyContactRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  emergencyContactRowRelationship: {
    fontFamily: 'AvenirNextW1G-Light', fontSize: 10, textAlign: 'right',
    letterSpacing: 0.4,
    width: 76 + convertWidth(15),
    paddingRight: convertWidth(15),
    marginTop: 2,
  },
  emergencyContactRowInfo: {
    flex: 1,
    flexDirection: 'column',
  },
  emergencyContactRowInfoName: {
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 12,
    letterSpacing: 0.15,
    paddingBottom: 3,
  },
  emergencyContactRowInfoPhoneNumber: {
    fontFamily: 'AvenirNextW1G-Light', fontSize: 10,
    letterSpacing: 0.4,
  },
  addEmergencyContactButton: {
    width: '100%',
    paddingLeft: 76 + convertWidth(15),
    marginTop: 12,
  },
  addEmergencyContactButtonText: {
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 12, color: '#FF003C',
    letterSpacing: 1.5,
  },
  emergencyContactRowDeleteIcon: {
    width: 14, height: 18, resizeMode: 'contain',
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
    fontFamily: 'AvenirNextW1G-Light', fontSize: 10,
    letterSpacing: 1.5,
  },
  cardHeaderIcon: {
    width: 26, height: 33, resizeMode: 'contain',
    marginRight: convertWidth(18),
  },
  cardContentRow: {
    paddingTop: 9, paddingBottom: 15, paddingLeft: convertWidth(15), paddingRight: convertWidth(15),
    flex: 1, flexDirection: 'row',
    minHeight: 50,
  },
  cardContentRowValue: {
    fontFamily: 'AvenirNextW1G-Light', fontSize: 14, color: 'rgba(0, 0, 0, 0.6)',
  },
  emrInformationAvatar: {
    width: 76, height: 76, resizeMode: 'cover',
    borderWidth: 0.1, borderRadius: 38,
    borderColor: 'white',
    marginRight: convertWidth(15),
    shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.2, shadowColor: '#000000', shadowRadius: 5,
  },
  emrInformationAvatarCover: {
    position: 'absolute',
    top: 46.5, left: -1,
    width: 78, height: 32, resizeMode: 'contain',
    zIndex: 1,
  },
  emrInformationBasic: {
    flex: 1,
  },
  emrInformationLabel: {
    fontFamily: 'AvenirNextW1G-Light', fontSize: 10, color: '#545454',
  },
  emrInformationValue: {
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 14, color: 'rgba(0, 0, 0, 0.6)',
    marginTop: 3,
  },

  emrInformationValueInput: {
    marginTop: 3,
    flex: 1, width: '100%', height: 32,
    backgroundColor: '#F5F5F5',
    fontFamily: 'AvenirNextW1G-Regular', color: 'rgba(0, 0, 0, 0.87)',
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
