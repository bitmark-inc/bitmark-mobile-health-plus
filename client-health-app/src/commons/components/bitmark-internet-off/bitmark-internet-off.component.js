import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View,
  Alert,
} from 'react-native';

import internetOffStyles from './bitmark-internet-off.component.style';
import { BitmarkComponent } from '..';
import { ios } from '../../../configs';
import { BitmarkOneTabButtonComponent } from '../bitmark-button';
export class BitmarkInternetOffComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <BitmarkComponent
        mainStyle={{ zIndex: ios.constant.zIndex.internetOff, backgroundColor: 'rgba(0,0,0,0.7)', }}
        content={(<BitmarkOneTabButtonComponent style={internetOffStyles.content}
          activeOpacity={1}
          onPress={() => {
            Alert.alert('Network Error', 'Failed to connect to Bitmark. Please check your device’s network connection.', [{
              text: 'Cancel', style: 'cancel',
            }, {
              text: 'Retry',
              onPress: () => {
                if (this.props.tryConnectInternet) {
                  this.props.tryConnectInternet();
                }
              }
            }]);
          }}>
          <View style={[internetOffStyles.title]}>
            <Text style={[internetOffStyles.titleText,]}>NO INTERNET CONNECTION!</Text>
          </View>
        </BitmarkOneTabButtonComponent>)}
      />
    );
  }
}

BitmarkInternetOffComponent.propTypes = {
  tryConnectInternet: PropTypes.func,
}