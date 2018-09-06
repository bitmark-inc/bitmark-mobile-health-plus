import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, SafeAreaView, ScrollView, FlatList,
} from 'react-native';
import moment from "moment";

import { convertWidth, runPromiseWithoutError } from '../../utils';
import { constants } from '../../constants';
import { config } from '../../configs';
import { EventEmitterService } from '../../services';
import { DataProcessor } from '../../processors';
import { Actions } from 'react-native-router-flux';

let ComponentName = 'BitmarkListComponent';
export class BitmarkListComponent extends Component {
  static propTypes = {
    bitmarkType: PropTypes.string
  };
  constructor(props) {
    super(props);

    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, null, ComponentName);
    this.state = {
      donationInformation: null,
      completedTasks: [],
    };
    runPromiseWithoutError(DataProcessor.doGetDonationInformation()).then(donationInformation => {
      if (donationInformation && donationInformation.error) {
        // TODO
        Actions.pop();
      }
      let completedTasks = donationInformation.completedTasks.filter(item => item.taskType === this.props.bitmarkType);
      this.setState({ donationInformation, completedTasks });
    });
  }

  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange, ComponentName);
  }

  handerDonationInformationChange({ donationInformation }) {
    let completedTasks = donationInformation.completedTasks.filter(item => item.taskType === this.props.bitmarkType);
    this.setState({ donationInformation, completedTasks });
  }

  goToDetailScreen(bitmarkId, bitmarkType, issuedAt) {
    Actions.bitmarkDetail({ bitmarkId, bitmarkType, issuedAt });
  }

  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <ScrollView style={styles.bodyContent}>
            <View style={styles.titleRow}>
              {this.props.bitmarkType === 'bitmark_health_data' && <Text style={styles.titleText}>Health data</Text>}
              {this.props.bitmarkType === 'bitmark_health_issuance' && <Text style={styles.titleText}>Health records</Text>}
              <TouchableOpacity onPress={Actions.pop}>
                <Image style={styles.closeIcon} source={require('./../../../assets/imgs/close_icon_red.png')} />
              </TouchableOpacity>
            </View>

            <View style={styles.bitmarkList}>
              <FlatList
                scrollEnabled={false}
                data={this.state.completedTasks}
                extraData={this.state}
                renderItem={({ item }) => {
                  return (<TouchableOpacity style={styles.bitmarkRow} onPress={() => this.goToDetailScreen.bind(this)(item.bitmarkId, this.props.bitmarkType, item.completedAt)}>
                    <Text style={styles.bitmarkRowText}>{moment(item.completedAt).format('YYYY MMM DD').toUpperCase()}</Text>
                    <Image style={styles.bitmarkRowIcon} source={require('./../../../assets/imgs/arrow_left_icon_red.png')} />
                  </TouchableOpacity>);
                }}
              />
            </View>

            {/* {this.props.bitmarkType === 'bitmark_health_data' && <View style={styles.dataSourcesArea}>
              <Text style={styles.dataSourcesMessage}>{'Claim ownership over your health data. Connect Bitmark to Apple’s Health app: Health App > Sources > Health+. Any data sources that you allow Bitmark to access will be bitmarked automatically. (If you did not grant access or if you did and no data was detected, the status will be inactive.)'}</Text>
              {this.state.donationInformation && <FlatList style={styles.dataSourceList}
                scrollEnabled={false}
                data={this.state.donationInformation.dataSourceStatuses}
                extraData={this.state}
                renderItem={({ item }) => {
                  return (<View style={styles.dataSourceRow}>
                    <Text style={styles.dataSourcesName} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.dataSourceStatus, item.status === 'Inactive' ? { color: '#999999' } : {}]}>{item.status.toUpperCase()}</Text>
                  </View>);
                }}
              />}
            </View>} */}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  bodySafeView: {
    flex: 1,
  },
  body: {
    padding: convertWidth(16),
    paddingTop: convertWidth(16) + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
    flex: 1,
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: "#FF4444",
    width: "100%",
    padding: convertWidth(20),
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    fontFamily: 'Avenir Black',
    fontWeight: '900',
    fontSize: 36,
    color: '#464646',
  },
  closeIcon: {
    width: convertWidth(30),
    height: convertWidth(30),
    resizeMode: 'contain',
  },

  bitmarkList: {
    padding: convertWidth(6),
    marginTop: 30,
  },
  bitmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bitmarkRowText: {
    fontFamily: 'Avenir Book',
    fontSize: 16,
    fontWeight: '300',
    color: '#464646',
  },
  bitmarkRowIcon: {
    width: convertWidth(8),
    height: 14 * convertWidth(8) / 8,
    resizeMode: 'contain',
  },


  // dataSourcesArea: {
  //   padding: convertWidth(6),
  // },
  // dataSourcesMessage: {
  //   fontFamily: 'Avenir Book',
  //   fontSize: 16,
  //   fontWeight: '300',
  //   marginTop: 36,
  //   color: '#464646',
  // },
  // dataSourceList: {
  //   marginTop: 20,
  // },
  // dataSourceRow: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'space-between',
  //   marginTop: 3,
  //   minHeight: 21,
  // },
  // dataSourcesName: {
  //   fontFamily: 'Avenir Medium',
  //   fontSize: 14,
  //   color: '#464646',
  // },
  // dataSourceStatus: {
  //   color: '#0060F2',
  //   fontFamily: 'Avenir Medium',
  //   fontSize: 14,
  // },

});