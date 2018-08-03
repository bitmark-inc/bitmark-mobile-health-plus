import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, FlatList, ActivityIndicator,
} from 'react-native';

import { BitmarkComponent } from './../../../../../commons/components';

import defaultStyle from './../../../../../commons/styles';
import myStyle from './health-data-sources.component.style';

import { DataProcessor } from '../../../../../processors';
import { EventEmitterService } from '../../../../../services';

let ComponentName = 'HealthDataSourceComponent';
export class HealthDataSourceComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);

    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, null, ComponentName);

    let dataTypes;
    if (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) {
      dataTypes = this.props.navigation.state.params.dataTypes;
    }
    this.state = {
      dataTypes,
      donationInformation: null,
      gettingData: true,
    };
    const doGetScreenData = async () => {
      let donationInformation = await DataProcessor.doGetDonationInformation();
      this.setState({
        donationInformation,
        gettingData: false,
      });
    }
    doGetScreenData();
  }

  // ==========================================================================================
  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange, ComponentName);
  }
  // ==========================================================================================
  handerDonationInformationChange(donationInformation) {
    this.setState({ donationInformation });
  }

  render() {
    return (
      <BitmarkComponent
        header={(<View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('./../../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>DATA TYPES</Text>
          <TouchableOpacity style={defaultStyle.headerRight} />
        </View>)}

        content={(<View style={myStyle.body}>
          <Text style={myStyle.dataSourceMessage}>
            {"Claim ownership over your health data. Connect Bitmark to Apple’s Health app: Health App > Sources > Bitmark. Any data sources that you allow Bitmark to access will be bitmarked automatically. (If you did not grant access or if you did and no data was detected, the status will be inactive.)"}
          </Text>
          {this.state.donationInformation && <FlatList style={myStyle.dataSourceList}
            data={this.state.donationInformation.dataSourceStatuses}
            extraData={this.state.donationInformation.dataSourceStatuses}
            renderItem={({ item }) => {
              let display = true;
              if (this.state.dataTypes) {
                display = this.state.dataTypes.findIndex(dataType => dataType === item.key) >= 0;
              }
              if (display) {
                return (<View style={myStyle.dataSourceRow}>
                  <Text style={myStyle.dataSourcesName} numberOfLines={1}>{item.title}</Text>
                  <Text style={myStyle['dataSource' + item.status]}>{item.status.toUpperCase()}</Text>
                </View>);
              }
            }}
          />}
          {(this.state.appLoadingData || this.state.gettingData) && <ActivityIndicator size="large" style={{ marginTop: 46, }} />}
        </View >
        )}
      />
    );
  }
}

HealthDataSourceComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        dataTypes: PropTypes.array,
      })
    })
  }),
}