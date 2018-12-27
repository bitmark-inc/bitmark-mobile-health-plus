import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image,
  StyleSheet,
} from 'react-native'

import { convertWidth, FileUtil, humanFileSize } from 'src/utils';
import { config } from 'src/configs';
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
          <Text style={[styles.cardText]}>{bitmark.asset.created_at ? ('RECORED ON ' + moment(bitmark.asset.created_at).format('YYYY MMM DD').toUpperCase()) : 'REGISTERING...'}</Text>

          {this.state.fileSize &&
          <Text style={[styles.cardText]}>{this.state.fileSize}</Text>
          }
        </View>

        {/*BOTTOM BAR*/}
        <View style={[styles.cardBottomBar]}>
          <Image style={styles.cardNextIcon} source={require('assets/imgs/options-icon.png')} />
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
    backgroundColor: '#FBC9D5',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    paddingBottom: 16,
  },
  cardTopBar: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
    marginTop: 0,
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
  },
  cardHeader: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Black',
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '900',
    color: 'rgba(0, 0, 0, 0.87)'
  },
  cardText: {
    marginTop: 5,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Andale Mono',
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)'
  },
  cardBottomBar: {
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  cardNextIcon: {
    width: 12,
    height: 24,
    resizeMode: 'contain',
  }
});