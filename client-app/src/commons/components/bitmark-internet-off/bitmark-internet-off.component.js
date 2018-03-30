import React from 'react';
import {
  Text, View, TouchableOpacity,
  Alert,
} from 'react-native';

import internetOffStyles from './bitmark-internet-off.component.style';
import { FullComponent } from '..';
import { ios } from '../../../configs';
export class BitmarkInternetOffComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <FullComponent
        mainStyle={internetOffStyles.body}
        zIndex={ios.constant.zIndex.internetOff}
        content={(<TouchableOpacity style={internetOffStyles.content}
          activeOpacity={1}
          onPress={() => {
            Alert.alert('No Internet Connection', 'Please connect to Internet to use Bitmark');
          }}
        >
          <View style={[internetOffStyles.title]}>
            <Text style={[internetOffStyles.titleText,]}>NO INTERNET CONNECTION!</Text>
          </View>
        </TouchableOpacity>)}
      />
    );
  }
}