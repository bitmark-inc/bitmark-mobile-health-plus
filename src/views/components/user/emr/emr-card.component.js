import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, Text, Image, TouchableOpacity,
} from 'react-native';
import { Provider, connect } from 'react-redux';

import { convertWidth } from 'src/utils';
import { ShadowComponent } from 'src/views/commons';
import { EMRInformationStore } from 'src/views/stores';
import moment from 'moment';
import { Actions } from 'react-native-router-flux';


class PrivateEMRCardComponent extends Component {
  static propTypes = {
    emrInformation: PropTypes.any,
    displayFromUserScreen: PropTypes.bool,
  };
  render() {
    return (
      <ShadowComponent style={styles.body}>
        {!this.props.emrInformation &&
          <TouchableOpacity onPress={() => this.props.displayFromUserScreen ? Actions.account() : Actions.emrInformation({ emrInformation: this.props.emrInformation, displayFromUserScreen: this.props.displayFromUserScreen })}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitleText}>GET STARTED</Text>
              <Image style={styles.cardHeaderIcon} source={require('assets/imgs/emr-setup-icon.png')} />
            </View>
            <View style={[styles.bodyContent, { padding: convertWidth(16), }, {paddingBottom: 28}]} >
              <Text style={styles.cardHeaderTitleText}>{this.props.displayFromUserScreen ? 'Personalize your vault' : 'Set up Emergency Medical Record'}</Text>
              <Text style={styles.cardContentDescription}>
                {this.props.displayFromUserScreen
                  ? 'Your Bitmark Health vault gives you control over your health data. Personalize your vault settings to control how your health history is shared with healthcare providers, family, and researchers.'
                  : 'Your Emergency Medical Record stores all your most important medical history so that medical professionals can help you in case of an emergency.'
                }
              </Text>
            </View>
          </TouchableOpacity>
        }

        {this.props.emrInformation &&
          <TouchableOpacity style={[styles.bodyContent, {paddingBottom: 16}]}
            onPress={() => this.props.displayFromUserScreen ? Actions.account() : Actions.emrInformation({ emrInformation: this.props.emrInformation })}>
            <View style={styles.cardHeader}>
              <Text style={styles.emrUserTitle}>{this.props.displayFromUserScreen ? 'Vault' : 'Emergency Medical Record'}</Text>
              <Image style={styles.cardHeaderIcon} source={require('assets/imgs/emr-setup-icon.png')} />
            </View>
            <View style={styles.emrInformation}>
              <Image style={styles.emrInformationAvatar} source={this.props.emrInformation.avatar ? { uri: this.props.emrInformation.avatar } : require('assets/imgs2/emr_avatar_default_2.png')} />
              <View style={styles.emrInformationBasic}>
                <Text style={styles.emrInformationLabel}>Name</Text>
                <Text style={styles.emrInformationValue}>{this.props.emrInformation.name}</Text>
                <View style={{ flex: 1, flexDirection: 'row', marginTop: 21, }}>
                  <View style={{ flex: 1, flexDirection: 'column' }}>
                    <Text style={styles.emrInformationLabel}>Date of birth</Text>
                    <Text style={styles.emrInformationValue}>{this.props.emrInformation.birthday ? moment(this.props.emrInformation.birthday).format('YYYY MMM DD') : ''}</Text>
                  </View>
                  <View style={{ flex: 1, flexDirection: 'column' }}>
                    <Text style={styles.emrInformationLabel}>Sex</Text>
                    <Text style={styles.emrInformationValue}>{this.props.emrInformation.sex ?
                      (this.props.emrInformation.sex.substring(0, 1).toUpperCase() + this.props.emrInformation.sex.substring(1, this.props.emrInformation.sex.length).toUpperCase().toLowerCase()) : ''}</Text>
                  </View>
                </View>
              </View>
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
    borderWidth: 0.1, borderRadius: 4, borderColor: '#FFE1DE',
    backgroundColor: '#FFE1DE',
  },
  bodyContent: {
    flex: 1,
    borderWidth: 0.1, borderRadius: 4, borderColor: '#FFE1DE',
    backgroundColor: '#FFE1DE',
  },
  cardHeader: {
    width: '100%', height: 40,
    flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFE1DE',
  },
  cardTitleText: {
    fontFamily: 'AvenirNextW1G-Light', fontSize: 10,
    flex: 1,
    paddingLeft: convertWidth(16),
    letterSpacing: 1.5,
  },
  cardHeaderIcon: {
    marginTop: -8,
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
  emrUserTitle: {
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 18,
    padding: convertWidth(15), paddingBottom: 0,
    lineHeight: 20,
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