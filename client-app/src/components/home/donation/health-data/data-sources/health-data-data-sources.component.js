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
    this.state = {
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
          <FlatList data={this.state.donationInformation.dataSourceStatuses}
            extraData={this.state.donationInformation.dataSourceStatuses}
            renderItem={({ item }) => {
              return (<View style={myStyle.dataSourceRow}>
                <Text style={myStyle.dataSourcesName} numberOfLines={1}>{item.title}</Text>
                <Text style={myStyle['dataSource' + item.status]}>{item.status.toUpperCase()}</Text>
              </View>)
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
  }),
}