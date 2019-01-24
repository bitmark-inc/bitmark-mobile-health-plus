import React from 'react';
import {
  View, Text, Image,
} from 'react-native'

import { styles } from './bitmark-feed-card.style.component';
import PropTypes from 'prop-types';
import moment from "moment/moment";

export class DailyHealthDataFeedCardComponent extends React.Component {
  static propTypes = {
    header: PropTypes.string,
    lastBitmark: PropTypes.any
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let bitmark = this.props.lastBitmark;

    return (
      <View style={[styles.cardContainer]}>
        {/*TOP BAR*/}
        <View style={[styles.cardTopBar]}>
          <Text style={[styles.cardTitle]}>HEALTH DATA</Text>
          <Image style={styles.cardIcon} source={require('assets/imgs/health-data-card-icon.png')} />
        </View>

        {/*CONTENT*/}
        <View style={[styles.cardContent]}>
          <Text style={[styles.cardHeader]}>{this.props.header}</Text>
          <Text style={[styles.cardText]}>{'RECORDED ON ' + moment(bitmark.asset.metadata['Collection Date']).add(1, 'day').format('MMM DD, YYYY').toUpperCase()}</Text>
        </View>

        {/*BOTTOM BAR*/}
        <View style={[styles.cardBottomBar, {height: 20}]}>
        </View>
      </View>
    );
  }
}