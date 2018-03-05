import React from 'react';
import {
  Text, View, TouchableOpacity,
  Alert,
} from 'react-native';

import internetOffStyles from './bitmark-internet-off.component.style';
export class BitmarkInternetOffComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <TouchableOpacity style={internetOffStyles.body}
        activeOpacity={1}
        onPress={() => {
          Alert.alert('No Internet Connection', 'Please connect to Internet to use Bitmark');
        }}
      >
        <View style={[internetOffStyles.title]}>
          <Text style={[internetOffStyles.titleText,]}>NO INTERNET CONNECTION!</Text>
        </View>
      </TouchableOpacity>
    );
  }
}