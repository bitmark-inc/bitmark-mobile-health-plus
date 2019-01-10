import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image,
} from 'react-native'

import { FileUtil, humanFileSize } from 'src/utils';
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

  async componentDidMount() {
     let fileStat = await FileUtil.stat(this.props.bitmark.asset.filePath);
     this.setState({fileSize: humanFileSize(fileStat.size)});
  }

  render() {
    let bitmark = this.props.bitmark;
    console.log('bitmark:', bitmark);

    return (
      <View style={[styles.cardContainer]}>
        {/*TOP BAR*/}
        <View style={[styles.cardTopBar]}>
          <Text style={[styles.cardTitle]}>HEALTH KIT DATA</Text>
          <Image style={styles.cardIcon} source={require('assets/imgs/health-data-card-icon.png')} />
        </View>

        {/*CONTENT*/}
        <View style={[styles.cardContent]}>
          <Text style={[styles.cardHeader]}>{bitmark.asset.name}</Text>
          <Text style={[styles.cardText]}>{bitmark.asset.created_at ? ('RECORDED ON ' + moment(bitmark.asset.created_at).format('MMM DD, YYYY').toUpperCase()) : 'REGISTERING...'}</Text>

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