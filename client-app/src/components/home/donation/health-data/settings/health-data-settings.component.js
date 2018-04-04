import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image,
} from 'react-native';

import { FullComponent } from './../../../../../commons/components';

import defaultStyle from './../../../../../commons/styles';
import myStyle from './health-data-settings.component.style';

import { DataController } from '../../../../../managers';


export class HealthDataSettingsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: DataController.getUserInformation(),
    }
  }

  render() {
    return (
      <FullComponent
        header={(<View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('./../../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle} >HEALTH DATA</Text>
          <TouchableOpacity style={defaultStyle.headerRight} />
        </View>)}

        content={(<View style={myStyle.body}>
          <View style={myStyle.healthDataField}>
            <Text style={myStyle.healthDataFieldTitle}>FREQUENCY</Text>
            <Text style={myStyle.healthDataFieldFrequency}>WEEKLY</Text>
          </View>
          <View style={myStyle.healthDataFieldDescriptionArea}>
            <Text style={myStyle.healthDataFieldDescriptionText}>We will send you issuance request every Monday 11pm, please sign the issuance.</Text>
          </View>


          <TouchableOpacity style={myStyle.healthDataField} onPress={() => this.props.navigation.navigate('HealthDataMetadata')}>
            <Text style={myStyle.healthDataFieldTitle}>METADATA</Text>
            <Image style={myStyle.healthDataFieldNextIcon} source={require('./../../../../../../assets/imgs/next-icon-blue.png')} />
          </TouchableOpacity>
          <View style={myStyle.healthDataFieldDescriptionArea}>
            <Text style={myStyle.healthDataFieldDescriptionText}>All the bitmarks of health data metadata has been pre-defined. The metadata will be recorded in Bitmark blockchain.</Text>
          </View>

          <TouchableOpacity style={myStyle.healthDataField} onPress={() => this.props.navigation.navigate('HealthDataDataSource')}>
            <Text style={myStyle.healthDataFieldTitle}>DATA SOURCES</Text>
            <Image style={myStyle.healthDataFieldNextIcon} source={require('./../../../../../../assets/imgs/next-icon-blue.png')} />
          </TouchableOpacity>
          <View style={myStyle.healthDataFieldDescriptionArea}>
            <Text style={myStyle.healthDataFieldDescriptionText}>
              Claim ownership over your health data. Connect Bitmark to Apple’s Health app: <Text style={{ color: '#0060F2' }}>{"Health App > Sources > Bitmark."}</Text>  Any data sources that you allow Bitmark to access will be bitmarked automatically. (If you did not grant access or if you did and no data was detected, the status will be inactive.)
              </Text>
          </View>

        </View >
        )}
      />
    );
  }
}

HealthDataSettingsComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
}