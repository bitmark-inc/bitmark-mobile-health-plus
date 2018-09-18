import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image,
} from 'react-native'
import { NavigationActions } from 'react-navigation';

import notificationStyle from './notification.component.style';
import { NotificationService } from '../../../services';
import { iosConstant } from '../../../configs/ios/ios.config';
import { BitmarkComponent } from '../../../commons/components';
import { DataProcessor } from '../../../processors';
import { BitmarkOneTabButtonComponent } from '../../../commons/components/bitmark-button';
// import { DataProcessor } from '../../../processors';

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
      NotificationService.doRequestNotificationPermissions().then((result) => {
        this.props.screenProps.rootNavigation.dispatch(resetMainPage);
        return DataProcessor.doMarkRequestedNotification(result);
      }).catch(error => {
        console.log('NotificationComponent requestNotification error:', error);
      });
    }
    return (
      <BitmarkComponent
        backgroundColor='white'
        content={(<View style={[notificationStyle.body]}>
          <View style={notificationStyle.swipePageContent}>
            <View style={notificationStyle.swipePageMainContent}>
              <Image style={[notificationStyle.notificationImage]} source={require('../../../../assets/imgs/notification.png')} />
              <Text style={[notificationStyle.notificationTitle]}>NOTIFICATIONS</Text>
              <Text style={[notificationStyle.notificationDescription,]}>Receive notifications when actions require your authorization.</Text>
            </View>
          </View>
        </View>)}

        footerHeight={45 + iosConstant.bottomBottomHeight}
        footer={(<View style={notificationStyle.enableButtonArea}>
          <BitmarkOneTabButtonComponent style={[notificationStyle.enableButton]} onPress={requestNotification}>
            <Text style={notificationStyle.enableButtonText}>ENABLE</Text>
          </BitmarkOneTabButtonComponent>
          <BitmarkOneTabButtonComponent style={[notificationStyle.enableButton, {
            backgroundColor: 'white',
            paddingBottom: Math.max(10, iosConstant.blankFooter),
            height: iosConstant.bottomBottomHeight,
          }]} onPress={() => {
            this.props.screenProps.rootNavigation.dispatch(resetMainPage);
          }}>
            <Text style={[notificationStyle.enableButtonText, { color: '#0060F2' }]}>LATER</Text>
          </BitmarkOneTabButtonComponent>
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