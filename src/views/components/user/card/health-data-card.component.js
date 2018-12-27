import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image,
} from 'react-native'

import moment from "moment/moment";
import { styles } from './bitmark-card.style.component';
import { FileUtil, humanFileSize } from "../../../../utils";

export class HealthDataCardComponent extends React.Component {
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
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={[styles.cardText]}>{bitmark.asset.created_at ? ('RECORED ON ' + moment(bitmark.asset.created_at).format('YYYY MMM DD').toUpperCase()) : 'REGISTERING...'}</Text>
            {this.state.fileSize &&
            <Text style={[styles.cardText]}>{this.state.fileSize}</Text>
            }
          </View>
        </View>
      </View>
    );
  }
}