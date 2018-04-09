import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Image, Text, TouchableOpacity,
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import { FullComponent } from './../../../../../commons/components';

import bitmarkHealthStyles from './health-data-bitmark.component.style';
import defaultStyle from './../../../../../commons/styles';
import { AppController } from '../../../../../managers';
import { EventEmiterService } from '../../../../../services';
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
      <FullComponent
        header={(<View style={defaultStyle.header}>
          <TouchableOpacity style={[defaultStyle.headerLeft, { width: convertWidth(40) }]} onPress={() => this.props.navigation.goBack()} >
            <Image style={defaultStyle.headerLeftIcon} source={require('./../../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={[defaultStyle.headerTitle, { maxWidth: convertWidth(375) - convertWidth(80) }]}>SIGN YOUR BITMARK ISSUANCE</Text>
          <TouchableOpacity style={[defaultStyle.headerRight, { width: convertWidth(40) }]} />
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
            AppController.doBitmarkHealthData(this.state.list).then((result) => {
              if (result !== null) {
                const resetHomePage = NavigationActions.reset({
                  index: 0,
                  actions: [
                    NavigationActions.navigate({
                      routeName: 'User', params: {
                        displayedTab: { mainTab: BottomTabsComponent.transaction, subTab: 'COMPLETED' },
                        needReloadData: true,
                      }
                    }),
                  ]
                });
                this.props.navigation.dispatch(resetHomePage);
              }
            }).catch(error => {
              console.log('doBitmarkHelthData error:', error);
              EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR);
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