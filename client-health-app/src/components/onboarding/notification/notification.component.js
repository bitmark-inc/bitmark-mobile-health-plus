import React from 'react';
import PropTypes from 'prop-types';
import {
  View
} from 'react-native';

import notificationStyle from './notification.component.style';
import { NotificationService } from '../../../services';
import { iosConstant } from '../../../configs/ios/ios.config';
import { BitmarkComponent } from '../../../commons/components';
import { DataProcessor } from '../../../processors';

export class NotificationComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    NotificationService.doRequestNotificationPermissions().then((result) => {
      this.props.navigation.navigate('Welcome');
      return DataProcessor.doMarkRequestedNotification(result);
    }).catch(error => {
      console.log('NotificationComponent requestNotification error:', error);
    });
  }

  render() {
    return (
      <BitmarkComponent
        backgroundColor='white'
        content={(<View style={[notificationStyle.body]}></View>)}
        footerHeight={45 + iosConstant.bottomBottomHeight}
        footer={(<View></View>)}
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