import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, Text, Image, TouchableOpacity,
} from 'react-native';
import { Provider, connect } from 'react-redux';

import { convertWidth } from 'src/utils';
import { ShadowComponent, ShadowTopComponent, } from 'src/views/commons';
import { EMRInformationStore } from 'src/views/stores';
import moment from 'moment';
import { Actions } from 'react-native-router-flux';


class PrivateEMRCardComponent extends Component {
  static propTypes = {
    emrInformation: PropTypes.any,
    displayFromUserScreen: PropTypes.bool,
  };
  render() {
    let displaySeeMoreButton = (this.props.emrInformation && this.props.emrInformation.avatar
      && this.props.emrInformation.name && this.props.emrInformation.birthday && this.props.emrInformation.sex) && this.props.displayFromUserScreen;
    return (
      <ShadowComponent style={styles.body}>
        {!this.props.emrInformation &&
          <TouchableOpacity onPress={() => this.props.displayFromUserScreen ? Actions.account() : Actions.emrInformation({ emrInformation: this.props.emrInformation, displayFromUserScreen: this.props.displayFromUserScreen })}>
            <ShadowTopComponent contentStyle={styles.cardHeader}>
              <Text style={styles.cardTitleText}>GET STARTED</Text>
              <Image style={styles.cardHeaderIcon} source={require('assets/imgs2/emr_setup_icon.png')} />
            </ShadowTopComponent>
            <View style={[styles.bodyContent, { padding: convertWidth(16), }]} >
              <Text style={styles.cardHeaderTitleText}>{this.props.displayFromUserScreen ? 'Personalize your vault' : 'Set up your emergency medical record'}</Text>
              <Text style={styles.cardContentDescription}>
                {this.props.displayFromUserScreen
                  ? 'Your Bitmark Health vault gives you control over your health data. Personalize your vault settings to control how your health history is shared with healthcare providers, family, and researchers.'
                  : 'Medical profile helps first responders access your critical medical information from the Bitmark health app. They can see information like allergies and medical conditions as well as who to contact in case of an emergency.'
                }
              </Text>
              <View style={[styles.cardNextButton, { marginTop: 20 }]}>
                <Image style={styles.cardNextButtonIcon} source={require('assets/imgs2/next_icon_grey.png')} />
              </View>
            </View>
          </TouchableOpacity>
        }

        {this.props.emrInformation &&
          <TouchableOpacity style={styles.bodyContent}
            onPress={() => this.props.displayFromUserScreen ? Actions.account() : Actions.emrInformation({ emrInformation: this.props.emrInformation })}>
            <Text style={styles.emrUserTitle}>{this.props.displayFromUserScreen ? 'Vault' : 'Emergency Medical Record'}</Text>
            <View style={styles.emrInformation}>
              <Image style={styles.emrInformationAvatar} source={this.props.emrInformation.avatar ? { uri: this.props.emrInformation.avatar } : require('assets/imgs2/emr_avatar_default.png')} />
              <View style={styles.emrInformationBasic}>
                <Text style={styles.emrInformationLabel}>Name</Text>
                <Text style={styles.emrInformationValue}>{this.props.emrInformation.name}</Text>
                <View style={{ flex: 1, flexDirection: 'row', marginTop: 21, }}>
                  <View style={{ flex: 1, flexDirection: 'column' }}>
                    <Text style={styles.emrInformationLabel}>Date of birth</Text>
                    <Text style={styles.emrInformationValue}>{this.props.emrInformation.birthday ? moment(this.props.emrInformation.birthday).format('MMM DD, YYYY') : ''}</Text>
                  </View>
                  <View style={{ flex: 1, flexDirection: 'column' }}>
                    <Text style={styles.emrInformationLabel}>Sex</Text>
                    <Text style={styles.emrInformationValue}>{this.props.emrInformation.sex ?
                      (this.props.emrInformation.sex.substring(0, 1).toUpperCase() + this.props.emrInformation.sex.substring(1, this.props.emrInformation.sex.length).toUpperCase().toLowerCase()) : ''}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.cardNextButton}>
              <TouchableOpacity style={{ padding: convertWidth(16) }} onPress={() => Actions.emrInformation({ emrInformation: this.props.emrInformation, edit: (!this.props.displayFromUserScreen || !displaySeeMoreButton) ? true : false })}>
                <Text style={styles.emrInformationSeeMoreButtonText}>{displaySeeMoreButton ? 'SEE MORE' : 'EDIT'}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        }
      </ShadowComponent>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    width: '100%',
    borderWidth: 0.1, borderRadius: 4, borderColor: '#F4F2EE',
    backgroundColor: '#F4F2EE',
  },
  bodyContent: {
    flex: 1,
    borderWidth: 0.1, borderRadius: 4, borderColor: '#F4F2EE',
    backgroundColor: 'white',
  },
  cardHeader: {
    width: '100%', height: 40,
    flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  cardTitleText: {
    fontFamily: 'AvenirNextW1G-Light', fontSize: 10,
    flex: 1,
    paddingLeft: convertWidth(16),
    letterSpacing: 1.5,
  },
  cardHeaderIcon: {
    width: 26, height: 33, resizeMode: 'contain',
    marginRight: convertWidth(18),
  },
  cardHeaderTitleText: {
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 24, color: 'rgba(0, 0, 0, 0.87)',
    letterSpacing: 0.15,
  },
  cardContentDescription: {
    marginTop: 18,
    fontFamily: 'AvenirNextW1G-Light', fontSize: 14, color: 'rgba(0, 0, 0, 0.6)',
  },
  cardNextButton: {
    width: '100%',
    flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center',
  },
  cardNextButtonIcon: {
    width: 16, height: 16, resizeMode: 'contain',
  },
  emrUserTitle: {
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 18,
    padding: convertWidth(15), paddingBottom: 0,
  },
  emrInformation: {
    padding: convertWidth(15),
    flexDirection: 'row',
  },
  emrInformationAvatar: {
    width: 76, height: 76, resizeMode: 'cover',
    borderWidth: 1, borderColor: 'white', borderRadius: 38,
    marginRight: convertWidth(15),
  },
  emrInformationBasic: {
    flex: 1,
  },
  emrInformationLabel: {
    letterSpacing: 0.4,
    fontFamily: 'AvenirNextW1G-Light', fontSize: 10, color: '#545454',
  },
  emrInformationValue: {
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 14, color: 'rgba(0, 0, 0, 0.6)',
    marginTop: 3,
    letterSpacing: 0.15,
  },
  emrInformationSeeMoreButtonText: {
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 10, color: '#FF003C',
  },
});


const StoreEMRCardComponent = connect(
  (state, ) => state.data
)(PrivateEMRCardComponent);

export class EMRCardComponent extends Component {
  static propTypes = {
    displayFromUserScreen: PropTypes.bool,
    onPress: PropTypes.func
  }

  render() {
    return (
      <Provider store={EMRInformationStore}>
        <StoreEMRCardComponent displayFromUserScreen={this.props.displayFromUserScreen} onPress={this.props.onPress} />
      </Provider>
    );
  }
}