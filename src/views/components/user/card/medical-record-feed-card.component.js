import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image,
} from 'react-native'

import moment from "moment";
import { styles } from './bitmark-feed-card.style.component';
import { IndexDBService } from "src/processors";

export class MedicalRecordFeedCardComponent extends React.Component {
  static propTypes = {
    bitmark: PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    let name = await IndexDBService.getNameByBitmarkId(this.props.bitmark.id);
    this.setState({ name });
  }

  render() {
    let bitmark = this.props.bitmark;
    let addedOn = bitmark.asset.created_at || bitmark.addedOn || moment().toDate().toISOString();

    return (
      <View style={[styles.cardContainer, {backgroundColor: '#DFF0FE'}]}>
        {/*TOP BAR*/}
        <View style={[styles.cardTopBar]}>
          <Text style={[styles.cardTitle]}>MEDICAL RECORD</Text>
          <Image style={styles.cardIcon} source={require('assets/imgs/medical-record-card-icon.png')} />
        </View>

        {/*CONTENT*/}
        <View style={[styles.cardContent]}>
          <Text numberOfLines={1} ellipsizeMode='tail' style={[styles.cardHeader]}>{this.state.name || bitmark.asset.name}</Text>
          <Text style={[styles.cardText]}>{'ADDED ON ' + moment(addedOn).format('MMM DD, YYYY').toUpperCase()}</Text>
        </View>

        {/*BOTTOM BAR*/}
        <View style={[styles.cardBottomBar]}>
        </View>
      </View>
    );
  }
}