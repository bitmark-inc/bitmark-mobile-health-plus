import React from 'react';
import {
  View, Image,
} from 'react-native';

import loadingStyles from './bitmark-loading.component.style';

export class LoadingComponent extends React.Component {
  render() {
    return (
      <View style={loadingStyles.body}>
        <View style={loadingStyles.loading}>
          <Image style={loadingStyles.loadingLogo} source={require('./../../../../assets/imgs/loading-logo.png')} />
        </View>
      </View>
    );
  }
}