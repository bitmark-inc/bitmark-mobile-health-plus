import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, TextInput, ScrollView, TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import { convertWidth } from './../../../../utils';

import propertyTransferStyle from './local-property-transfer.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../../commons/styles';
import { AppController } from '../../../../managers/app-controller';
import { AccountService } from '../../../../services';

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});

export class LocalPropertyTransferComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onSendProperty = this.onSendProperty.bind(this);

    let bitmark = this.props.navigation.state.params.bitmark;
    let asset = this.props.navigation.state.params.asset;
    let bitmarkIndexNumber = asset.bitmarks.findIndex(item => item.id === bitmark.id);
    bitmarkIndexNumber = (bitmarkIndexNumber + 1) + '/' + asset.bitmarks.length;
    this.state = {
      bitmark,
      asset,
      bitmarkIndexNumber,
      bitmarkAccount: '',
      bitmarkAccountError: '',
      transferError: '',
    };
  }

  onSendProperty() {
    AccountService.doValidateBitmarkAccountNumber(this.state.bitmarkAccount).then(() => {
      this.setState({
        bitmarkAccountError: '',
      });
      AppController.doTransferBitmark(this.state.bitmark, this.state.bitmarkAccount).then((result) => {
        if (result) {
          const resetMainPage = NavigationActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'User' })]
          });
          this.props.navigation.dispatch(resetMainPage);
        }
      }).catch(error => {
        this.setState({ transferError: 'Transfer property error!' });
        console.log('transfer bitmark error :', error);
      });
    }).catch(error => {
      console.log('onSendProperty doValidateBitmarkAccountNumber :', error);
      this.setState({ bitmarkAccountError: 'Invalid bitmark account number!' });
    });
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
              <Text style={[defaultStyle.headerTitle, { maxWidth: convertWidth(180), }]} numberOfLines={1}>{this.state.asset.name} </Text>
              <Text style={[defaultStyle.headerTitle, { maxWidth: convertWidth(180), }]} numberOfLines={1}>({this.state.bitmarkIndexNumber})</Text>
            </View>
            <TouchableOpacity style={[defaultStyle.headerRight]} />
          </View>
          <ScrollView style={propertyTransferStyle.content}>
            <TouchableOpacity activeOpacity={1} style={propertyTransferStyle.mainContent}>
              <Text style={propertyTransferStyle.transferTitle}>TRANSFER</Text>
              <View style={propertyTransferStyle.inputAccountNumberBar} >
                <TextInput style={propertyTransferStyle.inputAccountNumber} placeholder='BITMARK ACCOUNT'
                  onChangeText={(bitmarkAccount) => this.setState({ bitmarkAccount })}
                  returnKeyType="done"
                  onFocus={() => { this.setState({ bitmarkAccountError: false, transferError: '' }) }}
                />
              </View>
              <Text style={propertyTransferStyle.accountNumberError}>{this.state.bitmarkAccountError}</Text>
              <Text style={propertyTransferStyle.transferMessage}>Enter the Bitmark account address to which you would like to transfer ownership of this property.</Text>
              <TouchableOpacity style={[propertyTransferStyle.sendButton, {
                borderTopColor: this.state.bitmarkAccount ? '#0060F2' : '#A4B5CD'
              }]}
                disabled={!this.state.bitmarkAccount}
                onPress={this.onSendProperty}>
                <Text style={[propertyTransferStyle.sendButtonText, {
                  color: this.state.bitmarkAccount ? '#0060F2' : '#C2C2C2'
                }]}>SEND</Text>
              </TouchableOpacity>
              <Text style={propertyTransferStyle.accountNumberError}>{this.state.transferError}</Text>
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
    dispatch: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        bitmark: PropTypes.object,
        asset: PropTypes.object,
        refreshPropertiesScreen: PropTypes.func,
      }),
    }),
  }),
}