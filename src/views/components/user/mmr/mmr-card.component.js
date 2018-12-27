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
    onPress: PropTypes.func
  };
  render() {
    let displaySeeMoreButton = this.props.mmrInformation && this.props.mmrInformation.avatar
      && this.props.mmrInformation.name && this.props.mmrInformation.birthday && this.props.mmrInformation.sex;
    return (
      <ShadowComponent style={styles.body}>
        {!this.props.mmrInformation &&
          <TouchableOpacity style={styles.bodyContent} onPress={() => this.props.onPress ? this.props.onPress() : Actions.mmrInformation({ mmrInformation: this.props.mmrInformation, displayFromUserScreen: this.props.displayFromUserScreen })}>
            <Text style={styles.cardHeaderTitleText}>Personalize your vault</Text>
            <Text style={styles.cardContentDescription}>Medical profile helps first responders access your critical medical information from the Bitmark health app. They can see information like allergies and medical conditions as well as who to contact in case of an emergency. </Text>
            <View style={styles.cardNextButton}>
              <Image style={styles.cardNextButtonIcon} source={require('assets/imgs2/next_icon_grey.png')} />
            </View>
          </TouchableOpacity>
        }

        {this.props.mmrInformation &&
          <TouchableOpacity style={styles.bodyContent} disabled={!this.props.displayFromUserScreen} onPress={this.props.onPress ? this.props.onPress : Actions.account}>
            <Text style={styles.mmrUserTitle}>{this.props.displayFromUserScreen ? 'Vault' : 'Minimum Medical Record'}</Text>
            <View style={styles.mmrInformation}>
              <Image style={styles.mmrInformationAvatar} source={{ uri: this.props.mmrInformation.avatar }} />
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
                    <Text style={styles.mmrInformationValue}>{this.props.mmrInformation.sex}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.cardNextButton}>
              <TouchableOpacity style={{ padding: convertWidth(5) }} onPress={() => Actions.mmrInformation({ mmrInformation: this.props.mmrInformation, edit: !displaySeeMoreButton })}>
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
    width: convertWidth(344), minHeight: 200,
    borderWidth: 0.1, borderRadius: 4, borderColor: '#F4F2EE',
    backgroundColor: '#F4F2EE',
  },
  bodyContent: {
    flex: 1,
    borderWidth: 0.1, borderRadius: 4, borderColor: '#F4F2EE',
    backgroundColor: 'white',
    padding: convertWidth(16),
  },
  cardHeaderTitleText: {
    fontFamily: 'Avenir Light', fontSize: 24, fontWeight: '900',
  },
  cardContentDescription: {
    marginTop: 18,
    fontFamily: 'Avenir Light', fontSize: 14, fontWeight: '300', color: 'rgba(0, 0, 0, 0.6)',
  },
  cardNextButton: {
    width: '100%',
    flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center',
  },
  cardNextButtonIcon: {
    width: 16, height: 16, resizeMode: 'contain',
  },
  mmrUserTitle: {
    fontFamily: 'Avenir Black', fontSize: 18, fontWeight: '900',
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
    fontFamily: 'Avenir Light', fontSize: 10, fontWeight: '300', color: '#545454',
  },
  mmrInformationValue: {
    fontFamily: 'Avenir Light', fontSize: 14, fontWeight: '900', color: '#545454',
  },
  mmrInformationSeeMoreButtonText: {
    fontFamily: 'Avenir Black', fontSize: 10, fontWeight: '900', color: '#FF003C',
  },
});


const StoreMMRCardComponent = connect(
  (state, ) => state.data
)(PrivateMMRCardComponent);

export class MMRCardComponent extends Component {
  propTypes = {
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