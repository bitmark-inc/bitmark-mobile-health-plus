import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, FlatList,
} from 'react-native';

import { BitmarkComponent } from './../../../../../commons/components';

import defaultStyle from './../../../../../commons/styles';
import myStyle from './health-data-metadata.component.style';

import { DataProcessor } from '../../../../../processors';
import { StudyCommonModel } from '../../../../../models';


export class HealthDataMetadataComponent extends React.Component {
  constructor(props) {
    super(props);

    let metadataList = [];
    let metadata = StudyCommonModel.getMetadataOfBitmarkHealthData(DataProcessor.getUserInformation().bitmarkAccountNumber);
    for (let key in metadata) {
      metadataList.push({ key, value: metadata[key] });
    }
    this.state = {
      metadataList,
    };
  }

  render() {
    return (
      <BitmarkComponent
        header={(<View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('./../../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle} >METADATA</Text>
          <TouchableOpacity style={defaultStyle.headerRight} />
        </View>)}

        content={(<View style={myStyle.body}>
          <FlatList
            data={this.state.metadataList}
            renderItem={({ item }) => {
              return (<View style={myStyle.metadataRow}>
                <Text style={myStyle.metadataRowKey}>{item.key} : </Text>
                <Text style={myStyle.metadataRowValue}>{item.value}</Text>
              </View>)
            }}
          />
        </View >
        )}
      />
    );
  }
}

HealthDataMetadataComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
  screenProps: PropTypes.shape({
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
  }),
}