import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image,
} from 'react-native'

import { styles } from './bitmark-feed-card.style.component';
import moment from "moment/moment";

export class HealthDataFeedCardComponent extends React.Component {
  static propTypes = {
    bitmark: PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let bitmark = this.props.bitmark;
    let addedOn = bitmark.asset.created_at || bitmark.addedOn || moment().toDate().toISOString();

    return (
      <View style={[styles.cardContainer, {backgroundColor: '#EDF0F4'}]}>
        {/*TOP BAR*/}
        <View style={[styles.cardTopBar]}>
          <Text style={[styles.cardTitle]}>HEALTH DATA</Text>
          <Image style={styles.cardIcon} source={require('assets/imgs/health-data-card-icon.png')} />
        </View>

        {/*CONTENT*/}
        <View style={[styles.cardContent]}>
          <Text style={[styles.cardHeader]}>{bitmark.asset.name}</Text>
          <Text style={[styles.cardText]}>{'RECORDED ON ' + moment(addedOn).format('YYYY MMM DD').toUpperCase()}</Text>
        </View>

        {/*BOTTOM BAR*/}
        <View style={[styles.cardBottomBar]}>
        </View>
      </View>
    );
  }
}