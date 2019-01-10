import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image,
} from 'react-native'

import { FileUtil, humanFileSize } from 'src/utils';
import moment from "moment/moment";
import { styles } from './bitmark-feed-card.style.component';

export class MedicalRecordFeedCardComponent extends React.Component {
  static propTypes = {
    bitmark: PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    let fileStat = await FileUtil.stat(this.props.bitmark.asset.filePath);
    this.setState({fileSize: humanFileSize(fileStat.size)});
  }

  render() {
    let bitmark = this.props.bitmark;

    return (
      <View style={[styles.cardContainer]}>
        {/*TOP BAR*/}
        <View style={[styles.cardTopBar]}>
          <Text style={[styles.cardTitle]}>MEDICAL RECORD</Text>
          <Image style={styles.cardIcon} source={require('assets/imgs/medical-record-card-icon.png')} />
        </View>

        {/*CONTENT*/}
        <View style={[styles.cardContent]}>
          <Text style={[styles.cardHeader]}>{bitmark.asset.name}</Text>
          <Text style={[styles.cardText]}>{bitmark.asset.created_at ? ('ADDED ON ' + moment(bitmark.asset.created_at).format('MMM DD, YYYY').toUpperCase()) : 'REGISTERING...'}</Text>

          {this.state.fileSize &&
          <Text style={[styles.cardText]}>{this.state.fileSize}</Text>
          }
        </View>

        {/*BOTTOM BAR*/}
        <View style={[styles.cardBottomBar]}>
        </View>
      </View>
    );
  }
}