import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Image, Text, TouchableOpacity,
  Alert,
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import { BitmarkComponent } from './../../../../../commons/components';

import bitmarkHealthStyles from './health-data-bitmark.component.style';
import defaultStyle from './../../../../../commons/styles';
import { AppProcessor, DataProcessor } from '../../../../../processors';
import { EventEmitterService } from '../../../../../services';
import { convertWidth } from '../../../../../utils';
import { BottomTabsComponent } from '../../../bottom-tabs/bottom-tabs.component';

export class HealthDataBitmarkComponent extends React.Component {
  constructor(props) {
    super(props);
    let list = this.props.navigation.state.params.list;
    this.state = { list };
  }
  render() {
    return (
      <BitmarkComponent
        header={(<View style={defaultStyle.header}>
          <TouchableOpacity style={[defaultStyle.headerLeft, { width: 40 }]} onPress={() => this.props.navigation.goBack()} >
            <Image style={defaultStyle.headerLeftIcon} source={require('./../../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={[defaultStyle.headerTitle, { maxWidth: convertWidth(375) - 80 }]}>SIGN YOUR BITMARK ISSUANCE</Text>
          <TouchableOpacity style={[defaultStyle.headerRight, { width: 40 }]} />
        </View>)}
        content={(<View style={bitmarkHealthStyles.body}>
          <View style={bitmarkHealthStyles.content}>
            <View style={bitmarkHealthStyles.passcodeRemindImages}>
              <Image style={[bitmarkHealthStyles.touchIdImage]} source={require('./../../../../../../assets/imgs/touch-id.png')} />
              <Image style={[bitmarkHealthStyles.faceIdImage]} source={require('./../../../../../../assets/imgs/face-id.png')} />
            </View>
            <Text style={bitmarkHealthStyles.bitmarkDescription}>
              Signing your issuance with Touch/ Face ID or Passcode securely creates new bitmarks for your health data.
            </Text>
          </View>
          <TouchableOpacity style={bitmarkHealthStyles.bitmarkButton} onPress={() => {
            AppProcessor.doBitmarkHealthData(this.state.list, {
              indicator: true, title: '', message: 'Sending your transaction to the Bitmark network...'
            }).then((result) => {
              if (result) {
                DataProcessor.doReloadUserData();
                Alert.alert('Success!', 'Your property rights have been registered.', [{
                  text: 'OK',
                  onPress: () => {
                    const resetHomePage = NavigationActions.reset({
                      index: 0,
                      actions: [
                        NavigationActions.navigate({
                          routeName: 'User', params: {
                            displayedTab: { mainTab: BottomTabsComponent.MainTabs.properties },
                          }
                        }),
                      ]
                    });
                    this.props.navigation.dispatch(resetHomePage);
                  }
                }]);
              }
            }).catch(error => {
              console.log('doBitmarkHealthData error:', error);
              EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {error});
            })
          }}>
            <Text style={bitmarkHealthStyles.bitmarkButtonText}>ISSUE</Text>
          </TouchableOpacity>
        </View>)}
      />
    );
  }
}

HealthDataBitmarkComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    dispatch: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        list: PropTypes.array.isRequired,
      })
    })
  })
}