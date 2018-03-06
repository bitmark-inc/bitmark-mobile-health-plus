import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, TextInput, ScrollView, TouchableWithoutFeedback,
  Platform,
} from 'react-native';

import { convertWidth } from './../../../../utils';

import propertyTransferStyle from './local-property-transfer.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../../commons/styles';

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});

export class LocalPropertyTransferComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onFinishInputAccountNumber = this.onFinishInputAccountNumber.bind(this);
    this.onSendProperty = this.onSendProperty.bind(this);

    let bitmark = this.props.navigation.state.params.bitmark;
    this.state = {
      bitmark,
      bitmarkAccount: '',
    };
  }
  onFinishInputAccountNumber() {
    //TODO check account number
  }

  onSendProperty() {
    //TODO send property
  }

  render() {
    return (
      <TouchableWithoutFeedback style={propertyTransferStyle.body} onPress={() => this.setState({ displayTopButton: false })}>
        <View style={propertyTransferStyle.body}>
          <View style={defaultStyle.header}>
            <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
              <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_back_icon_study_setting.png')} />
            </TouchableOpacity>
            <View style={defaultStyle.headerCenter}>
              <Text style={[defaultStyle.headerTitle, { maxWidth: convertWidth(180), }]} numberOfLines={1}>TRANSFER</Text>
            </View>
            <TouchableOpacity style={[defaultStyle.headerRight]} />
          </View>
          <ScrollView style={propertyTransferStyle.content}>
            <TouchableOpacity activeOpacity={1} style={propertyTransferStyle.mainContent}>
              <TextInput style={propertyTransferStyle.inputAccountNumber} placeholder='BITMARK ACCOUNT'
                onChangeText={(bitmarkAccount) => this.setState({ bitmarkAccount })}
                onSubmitEditing={this.onFinishInputAccountNumber}
              />
              <View style={propertyTransferStyle.inputAccountNumberBar} />
              <Text style={propertyTransferStyle.transferMessage}>Enter the Bitmark account address to which you would like to transfer ownership of this property.</Text>
              <TouchableOpacity style={[propertyTransferStyle.sendButton,
              ]}
                disabled={this.state.bitmark.status === 'pending'}
                onPress={() => this.props.navigation.navigate('LocalPropertyTransfer', { bitmark: this.state.bitmark })}>
                <Text style={[propertyTransferStyle.sendButtonText, {
                  color: this.state.bitmark.status === 'pending' ? '#C2C2C2' : '#0060F2'
                }]}>SEND</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

LocalPropertyTransferComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        bitmark: PropTypes.object,
      }),
    }),
  }),
}