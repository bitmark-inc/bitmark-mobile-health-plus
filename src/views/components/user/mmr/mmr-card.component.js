import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, Text, Image, TouchableOpacity,
} from 'react-native';
import { convertWidth } from 'src/utils';


export class MMRCardComponent extends Component {
  static propTypes = {
    mmrInformation: PropTypes.any,
  };
  render() {
    return (
      <View style={styles.body}>
        {/* {!this.props.mmrInformation &&
          <TouchableOpacity style={styles.bodyContent}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderTitle}>
                <Text style={styles.cardHeaderTitleText}>GET STARTED</Text>
              </View>
              <Image style={styles.cardHeaderImage} source={require('assets/imgs/mmr_setup_icon.png')} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardContentTitle}>Set up your minimum medical record</Text>
              <Text style={styles.cardContentDescription}>Medical profile helps first responders access your critical medical information from the Bitmark health app. They can see information like allergies and medical conditions as well as who to contact in case of an emergency. </Text>
              <Image style={styles.cardNextIcon} source={require('assets/imgs/next_icon_grey.png')} />
            </View>
          </TouchableOpacity>
        } */}

        {/* {this.props.mmrInformation && */}
        <View style={styles.bodyContent}>
          <Text style={styles.mmrUserTitle}>My Account</Text>
          <View style={styles.mmrInformation}>
            <Image style={styles.mmrInformationAvatar} source={{ uri: `https://dantricdn.com/thumb_w/640/2018/anh-drone-1-1514880827496.jpg` }} />
            <View style={styles.mmrInformationBasic}>
              <Text style={styles.mmrInformationLabel}>Name</Text>
              <Text style={styles.mmrInformationValue}>Anaïs, Florence, Léa BARTHE</Text>
              <View style={{ flex: 1, flexDirection: 'row', marginTop: 21, }}>
                <View style={{ flex: 1, flexDirection: 'column' }}>
                  <Text style={styles.mmrInformationLabel}>Date of birth</Text>
                  <Text style={styles.mmrInformationValue}>Jan 27, 1988</Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'column' }}>
                  <Text style={styles.mmrInformationLabel}>Sex</Text>
                  <Text style={styles.mmrInformationValue}>Female</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingRight: convertWidth(15), width: '100%', }}>
            <Text style={styles.mmrInformationSeeMoreButtonText}>SEE MORE</Text>
          </View>
        </View>
        {/* } */}

      </View>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    width: convertWidth(344),
    shadowOffset: { width: 0, height: 3, }, shadowOpacity: 0.2, shadowColor: '#000000', shadowRadius: 5,
    borderWidth: 0.1, borderRadius: 4, borderColor: '#F4F2EE',
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F4F2EE',
    paddingBottom: 25,
    borderWidth: 0.1, borderRadius: 4, borderColor: '#F4F2EE',
  },
  cardHeader: {
    flexDirection: 'row',
    height: 40, width: '100%',
    backgroundColor: '#F5F5F5',
    shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.2, shadowColor: '#000000', shadowRadius: 4,
    borderTopWidth: 0.1, borderTopLeftRadius: 4, borderTopRightRadius: 4, borderTopColor: '#F5F5F5',
    zIndex: 1,
  },
  cardHeaderTitle: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    height: '100%',
  },
  cardHeaderTitleText: {
    fontFamily: 'Avenir Light', fontSize: 10, fontWeight: '300',
    marginLeft: convertWidth(15),
  },
  cardHeaderImage: {
    width: 34, height: 33, resizeMode: 'contain',
    marginRight: convertWidth(15),
  },
  cardContent: {
    flex: 1,
    backgroundColor: '#F4F2EE',
  },
  cardContentTitle: {
    fontFamily: 'Avenir Black', fontSize: 24, fontWeight: '900',
    padding: convertWidth(15), paddingBottom: 0,
  },
  cardContentDescription: {
    paddingLeft: convertWidth(15), paddingRight: convertWidth(15),
    marginTop: 8,
    fontFamily: 'Avenir Black', fontSize: 14, fontWeight: '300',
  },
  cardNextIcon: {
    width: 16, height: 16, resizeMode: 'contain',
    position: 'absolute',
    bottom: 20, right: 20,
  },
  mmrUserTitle: {
    fontFamily: 'Avenir Black', fontSize: 24, fontWeight: '900',
    padding: convertWidth(15), paddingBottom: 0,
  },
  mmrInformation: {
    padding: convertWidth(15),
    flexDirection: 'row',
  },
  mmrInformationAvatar: {
    width: 76, height: 76, resizeMode: 'contain',
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
