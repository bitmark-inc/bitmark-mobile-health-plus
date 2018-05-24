import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image, TouchableOpacity,
} from 'react-native'
import { NavigationActions } from 'react-navigation';

import notificationStyle from './notification.component.style';
import { NotificationService } from '../../../services';
import { iosConstant } from '../../../configs/ios/ios.config';
import { BitmarkComponent } from '../../../commons/components';

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
      <BitmarkComponent
        backgroundColor='white'
        contentInScroll={true}
        content={(<View style={[notificationStyle.body]}>
          <Text style={[notificationStyle.notificationTitle]}>NOTIFICATIONS</Text>
          <Text style={[notificationStyle.notificationDescription,]}>
            Receive notifications when actions require your authorization.
          </Text>
          <Image style={[notificationStyle.notificationImage]} source={require('../../../../assets/imgs/notification.png')} />
        </View>)}

        footerHeight={90}
        footer={(<View style={notificationStyle.enableButtonArea}>
          <TouchableOpacity style={[notificationStyle.enableButton]} onPress={requestNotification}>
            <Text style={notificationStyle.enableButtonText}>ENABLE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[notificationStyle.enableButton, { backgroundColor: 'white', paddingBottom: Math.max(10, iosConstant.blankFooter) }]} onPress={() => {
            this.props.screenProps.rootNavigation.dispatch(resetMainPage);
          }}>
            <Text style={[notificationStyle.enableButtonText, { color: '#0060F2' }]}>LATER</Text>
          </TouchableOpacity>
        </View>)}
      />
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