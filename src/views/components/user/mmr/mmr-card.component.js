import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, Text, Image, TouchableOpacity,
} from 'react-native';
import { Provider, connect } from 'react-redux';

import { convertWidth } from 'src/utils';
import { ShadowComponent, } from 'src/views/commons';
import { MMRInformationStore } from 'src/views/stores';
import moment from 'moment';
import { Actions } from 'react-native-router-flux';


class PrivateMMRCardComponent extends Component {
  static propTypes = {
    mmrInformation: PropTypes.any,
    displayFromUserScreen: PropTypes.bool,
  };
  render() {
    let displaySeeMoreButton = (this.props.mmrInformation && this.props.mmrInformation.avatar
      && this.props.mmrInformation.name && this.props.mmrInformation.birthday && this.props.mmrInformation.sex) && this.props.displayFromUserScreen;
    return (
      <ShadowComponent style={styles.body}>
        {!this.props.mmrInformation &&
          <TouchableOpacity style={[styles.bodyContent, { padding: convertWidth(16), }]} onPress={() => Actions.mmrInformation({ mmrInformation: this.props.mmrInformation, displayFromUserScreen: this.props.displayFromUserScreen })}>
            <Text style={styles.cardHeaderTitleText}>Personalize your vault</Text>
            <Text style={styles.cardContentDescription}>Medical profile helps first responders access your critical medical information from the Bitmark health app. They can see information like allergies and medical conditions as well as who to contact in case of an emergency. </Text>
            <View style={[styles.cardNextButton, { marginTop: 20 }]}>
              <Image style={styles.cardNextButtonIcon} source={require('assets/imgs2/next_icon_grey.png')} />
            </View>
          </TouchableOpacity>
        }

        {this.props.mmrInformation &&
          <TouchableOpacity style={styles.bodyContent}
            onPress={() => this.props.displayFromUserScreen ? Actions.account() : Actions.mmrInformation({ mmrInformation: this.props.mmrInformation })}>
            <Text style={styles.mmrUserTitle}>{this.props.displayFromUserScreen ? 'Vault' : 'Minimum Medical Record'}</Text>
            <View style={styles.mmrInformation}>
              <Image style={styles.mmrInformationAvatar} source={this.props.mmrInformation.avatar ? { uri: this.props.mmrInformation.avatar } : require('assets/imgs2/mmr_avarta_default.png')} />
              <View style={styles.mmrInformationBasic}>
                <Text style={styles.mmrInformationLabel}>Name</Text>
                <Text style={styles.mmrInformationValue}>{this.props.mmrInformation.name}</Text>
                <View style={{ flex: 1, flexDirection: 'row', marginTop: 21, }}>
                  <View style={{ flex: 1, flexDirection: 'column' }}>
                    <Text style={styles.mmrInformationLabel}>Date of birth</Text>
                    <Text style={styles.mmrInformationValue}>{this.props.mmrInformation.birthday ? moment(this.props.mmrInformation.birthday).format('MMM DD, YYYY') : ''}</Text>
                  </View>
                  <View style={{ flex: 1, flexDirection: 'column' }}>
                    <Text style={styles.mmrInformationLabel}>Sex</Text>
                    <Text style={styles.mmrInformationValue}>{this.props.mmrInformation.sex ?
                      (this.props.mmrInformation.sex.substring(0, 1).toUpperCase() + this.props.mmrInformation.sex.substring(1, this.props.mmrInformation.sex.length).toUpperCase().toLowerCase()) : ''}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.cardNextButton}>
              <TouchableOpacity style={{ padding: convertWidth(16) }} onPress={() => Actions.mmrInformation({ mmrInformation: this.props.mmrInformation, })}>
                <Text style={styles.mmrInformationSeeMoreButtonText}>{displaySeeMoreButton ? 'SEE MORE' : 'EDIT'}</Text>
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
  cardHeaderTitleText: {
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 24, color: 'rgba(0, 0, 0, 0.87)',
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
  mmrUserTitle: {
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 18,
    padding: convertWidth(15), paddingBottom: 0,
  },
  mmrInformation: {
    padding: convertWidth(15),
    flexDirection: 'row',
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
    fontFamily: 'AvenirNextW1G-Light', fontSize: 10, color: '#545454',
  },
  mmrInformationValue: {
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 14, color: 'rgba(0, 0, 0, 0.6)',
    marginTop: 3,
  },
  mmrInformationSeeMoreButtonText: {
    fontFamily: 'AvenirNextW1G-Bold', fontSize: 10, color: '#FF003C',
  },
});


const StoreMMRCardComponent = connect(
  (state, ) => state.data
)(PrivateMMRCardComponent);

export class MMRCardComponent extends Component {
  static propTypes = {
    displayFromUserScreen: PropTypes.bool,
    onPress: PropTypes.func
  }

  render() {
    return (
      <Provider store={MMRInformationStore}>
        <StoreMMRCardComponent displayFromUserScreen={this.props.displayFromUserScreen} onPress={this.props.onPress} />
      </Provider>
    );
  }
}