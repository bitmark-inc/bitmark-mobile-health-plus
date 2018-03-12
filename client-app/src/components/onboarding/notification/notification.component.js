import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, TouchableOpacity,
} from 'react-native'
import { NavigationActions } from 'react-navigation';

import { AppScaleComponent } from './../../../commons/components';
import notificationStyle from './notification.component.style';
import { NotificationService } from '../../../services';

export class NotificationComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const resetMainPage = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Main', params: { justCreatedBitmarkAccount: true } })]
    });

    let requestNotification = () => {
      NotificationService.doRequestNotificationPermissions().then(() => {
        this.props.screenProps.rootNavigation.dispatch(resetMainPage);
      }).catch(error => {
        console.log('NotificationComponent requestNotification error:', error);
      });
    }
    return (
      <AppScaleComponent ref={(r) => { this.appScaler = r; }}>
        <View style={[notificationStyle.body]}>
          <Text style={[notificationStyle.notificationTitle]}>NOTIFICATIONS</Text>
          <Image style={[notificationStyle.notificationImage]} source={require('../../../../assets/imgs/notification.png')} />
          <Text style={[notificationStyle.notificationDescription,]}>
            Enable push notifications to stay updated on property transfer requests and app updates.
          </Text>
          <View style={notificationStyle.enableButtonArea}>
            <TouchableOpacity style={[notificationStyle.enableButton]} onPress={requestNotification}>
              <Text style={notificationStyle.enableButtonText}>ENABLE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[notificationStyle.enableButton, { backgroundColor: 'white' }]} onPress={() => {
              this.props.screenProps.rootNavigation.dispatch(resetMainPage);
            }}>
              <Text style={[notificationStyle.enableButtonText, { color: '#0060F2' }]}>LATER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AppScaleComponent>
    );
  }
}

NotificationComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
  screenProps: PropTypes.shape({
    rootNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      dispatch: PropTypes.func,
    })
  }),
}