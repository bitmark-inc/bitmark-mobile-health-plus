import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, FlatList,
} from 'react-native';

import { FullComponent } from './../../../../../commons/components';

import defaultStyle from './../../../../../commons/styles';
import myStyle from './health-data-data-sources.component.style';

import { DataController } from '../../../../../managers';

export class HealthDataDataSourceComponent extends React.Component {
  constructor(props) {
    super(props);
    let dataTypes;
    if (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params) {
      dataTypes = this.props.navigation.state.params.dataTypes;
    }
    this.state = {
      dataTypes,
      donationInformation: DataController.getDonationInformation(),
    };
  }

  render() {
    return (
      <FullComponent
        header={(<View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('./../../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>DATA SOURCES</Text>
          <TouchableOpacity style={defaultStyle.headerRight} />
        </View>)}

        content={(<View style={myStyle.body}>
          <Text style={myStyle.dataSourceMessage}>
            Claim ownership over your health data. Connect Bitmark to Apple’s Health app: Health App > Sources > Bitmark. Any data sources that you allow Bitmark to access will be bitmarked automatically. (If you did not grant access or if you did and no data was detected, the status will be inactive.)
          </Text>
          <FlatList style={myStyle.dataSourceList}
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
          />
        </View >
        )}
      />
    );
  }
}

HealthDataDataSourceComponent.propTypes = {
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