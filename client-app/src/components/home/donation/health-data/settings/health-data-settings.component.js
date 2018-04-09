import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image,
  Alert,
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import { FullComponent } from './../../../../../commons/components';

import defaultStyle from './../../../../../commons/styles';
import myStyle from './health-data-settings.component.style';

import { DataController, AppController } from '../../../../../managers';
import { EventEmiterService } from '../../../../../services';


export class HealthDataSettingsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: DataController.getUserInformation(),
    }
  }
  done() {
    const resetHomePage = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({
          routeName: 'User', params: {
            displayedTab: { mainTab: 'Properties' },
            needReloadData: true,
          }
        }),
      ]
    });
    this.props.navigation.dispatch(resetHomePage);
  }

  inactiveBitmarkHealthData() {
    Alert.alert('Are you sure you want to remove bitmark health data?', '', [{
      text: 'No',
    }, {
      text: 'YES',
      onPress: () => {
        AppController.doInactiveBitmarkHealthData().then((result) => {
          if (result) {
            this.props.navigation.goBack();
          }
        }).catch(error => {
          EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR);
          console.log('doInactiveBitmarkHealthData error :', error);
        });
      }
    }]);
  }

  render() {
    return (
      <FullComponent
        header={(<View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('./../../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle} >HEALTH DATA</Text>
          <TouchableOpacity style={defaultStyle.headerRight} onPress={this.done.bind(this)} >
            <Text style={defaultStyle.headerRightText}>Done</Text>
          </TouchableOpacity>
        </View>)}

        content={(<View style={myStyle.body}>
          <View style={myStyle.healthDataField}>
            <Text style={myStyle.healthDataFieldTitle}>FREQUENCY</Text>
            <Text style={myStyle.healthDataFieldFrequency}>WEEKLY</Text>
          </View>
          <View style={myStyle.healthDataFieldDescriptionArea}>
            <Text style={myStyle.healthDataFieldDescriptionText}>We will send you issuance request every Monday 11:00AM, please sign the issuance.</Text>
          </View>

          <TouchableOpacity style={myStyle.healthDataField} onPress={() => this.props.navigation.navigate('HealthDataMetadata')}>
            <Text style={myStyle.healthDataFieldTitle}>METADATA</Text>
            <Image style={myStyle.healthDataFieldNextIcon} source={require('./../../../../../../assets/imgs/next-icon-blue.png')} />
          </TouchableOpacity>
          <View style={myStyle.healthDataFieldDescriptionArea}>
            <Text style={myStyle.healthDataFieldDescriptionText}>These metadata will be permanently recorded in the Bitmark blockchain and cannot be modified after the issuance is confirmed. All subsequently issued bitmarks for this asset will share this recorded metadata.</Text>
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

          <TouchableOpacity style={myStyle.removeButton} onPress={this.inactiveBitmarkHealthData.bind(this)}>
            <Text style={myStyle.removeButtonText}>REMOVE</Text>
          </TouchableOpacity>
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
    dispatch: PropTypes.func,
  }),
}