import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image,
  StyleSheet,
} from 'react-native'

import { convertWidth } from 'src/utils';
import { config } from 'src/configs';
import moment from "moment/moment";

export class HealthDataCardComponent extends React.Component {
  static propTypes = {
    bitmark: PropTypes.any,
  };

  constructor(props) {
    super(props);
  }
  render() {
    let bitmark = this.props.bitmark;

    return (
      <View style={[styles.cardContainer]}>
        <View style={[styles.cardImageContainer]}>
          <Image style={styles.cardImage} source={require('assets/imgs/health-data-thumbnail.png')} />
        </View>

        {/*TOP BAR*/}
        <View style={[styles.cardTopBar]}>
          <Text style={[styles.cardTitle]}>HEALTH KIT DATA</Text>
          <Image style={styles.cardIcon} source={require('assets/imgs/health-data-card-icon.png')} />
        </View>

        {/*CONTENT*/}
        <View style={[styles.cardContent]}>
          <Text style={[styles.cardHeader]}>{bitmark.asset.name}</Text>
          <Text style={[styles.cardText]}>{bitmark.asset.created_at ? ('ADDED ON ' + moment(bitmark.asset.created_at).format('YYYY MMM DD').toUpperCase()) : 'REGISTERING...'}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: '#F4F2EE',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    paddingBottom: 16,
  },
  cardTopBar: {
    position: 'absolute',
    width: '100%',
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    zIndex: 2,
  },
  cardTitle: {
    marginTop: 16,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Light',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.87)'
  },
  cardIcon: {
    width: 26,
    height: 33,
    resizeMode: 'contain'
  },
  cardContent: {
    marginTop: 16,
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
  },
  cardImageContainer: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: "hidden"
  },
  cardImage: {
    width: '100%',
    height: 195,
    resizeMode: 'stretch'
  },
  cardHeader: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Black',
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '900',
    color: 'rgba(0, 0, 0, 0.87)'
  },
  cardText: {
    marginTop: 10,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Book',
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)'
  }
});