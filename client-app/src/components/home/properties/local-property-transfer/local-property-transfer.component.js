import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, TextInput, ScrollView,
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import { BitmarkComponent } from './../../../../commons/components';
import { convertWidth } from './../../../../utils';

import propertyTransferStyle from './local-property-transfer.component.style';
import defaultStyle from './../../../../commons/styles';
import { AppProcessor } from '../../../../processors/app-processor';
import { AccountService, EventEmitterService } from '../../../../services';
import { iosConstant } from '../../../../configs/ios/ios.config';


export class LocalPropertyTransferComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onSendProperty = this.onSendProperty.bind(this);

    let bitmark = this.props.navigation.state.params.bitmark;
    let asset = this.props.navigation.state.params.asset;

    let bitmarkIndexNumber;
    if (asset.bitmarks) {
      bitmarkIndexNumber = asset.bitmarks.findIndex(item => item.id === bitmark.id);
      bitmarkIndexNumber = (bitmarkIndexNumber + 1) + '/' + asset.bitmarks.length;
    }
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
      AppProcessor.doTransferBitmark(this.state.bitmark, this.state.bitmarkAccount).then((result) => {
        if (result) {
          const resetMainPage = NavigationActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({
              routeName: 'User', params: {
                displayedTab: { mainTab: 'Properties' },
              }
            })]
          });
          this.props.navigation.dispatch(resetMainPage);
          EventEmitterService.emit(EventEmitterService.events.NEED_RELOAD_USER_DATA);
        }
      }).catch(error => {
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {
          onClose: this.props.navigation.goBack,
          error
        });
        console.log('transfer bitmark error :', error);
      });
    }).catch(error => {
      console.log('onSendProperty doValidateBitmarkAccountNumber :', error);
      this.setState({ bitmarkAccountError: 'Invalid bitmark account number!' });
    });
  }

  render() {
    return (
      <BitmarkComponent
        header={(<View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <View style={defaultStyle.headerCenter}>
            <Text style={[defaultStyle.headerTitle, { maxWidth: convertWidth(180), }]} numberOfLines={1}>{this.state.asset.name} </Text>
            {this.state.bitmarkIndexNumber && <Text style={[defaultStyle.headerTitle, { maxWidth: convertWidth(180), }]} numberOfLines={1}>({this.state.bitmarkIndexNumber})</Text>}
          </View>
          <TouchableOpacity style={[defaultStyle.headerRight]} />
        </View>)}
        content={(
          <View style={propertyTransferStyle.body}>
            <ScrollView style={propertyTransferStyle.content}>
              <TouchableOpacity activeOpacity={1} style={propertyTransferStyle.mainContent}>
                <Text style={propertyTransferStyle.transferTitle}>SEND BITMARK</Text>
                <View style={propertyTransferStyle.inputAccountNumberBar} >
                  <TextInput style={propertyTransferStyle.inputAccountNumber} placeholder='RECIPIENT BITMARK ACCOUNT NUMBER'
                    onChangeText={(bitmarkAccount) => this.setState({ bitmarkAccount })}
                    returnKeyType="done"
                    value={this.state.bitmarkAccount}
                    onFocus={() => { this.setState({ bitmarkAccountError: false, transferError: '' }) }}
                  />
                  {!!this.state.bitmarkAccount && <TouchableOpacity style={propertyTransferStyle.removeAccountNumberButton} onPress={() => this.setState({ bitmarkAccount: '', bitmarkAccountError: false, transferError: '' })} >
                    <Image style={propertyTransferStyle.removeAccountNumberIcon} source={require('./../../../../../assets/imgs/remove-icon.png')} />
                  </TouchableOpacity>}
                </View>
                <Text style={propertyTransferStyle.accountNumberError}>{this.state.bitmarkAccountError}</Text>
                <Text style={propertyTransferStyle.transferMessage}>Enter the Bitmark account number to which you would like to send ownership of this property.</Text>
                <Text style={propertyTransferStyle.accountNumberError}>{this.state.transferError}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
        footerHeight={45 + iosConstant.blankFooter / 2}
        footer={(<TouchableOpacity style={[propertyTransferStyle.sendButton, {
          borderTopColor: this.state.bitmarkAccount ? '#0060F2' : '#A4B5CD'
        }]}
          disabled={!this.state.bitmarkAccount}
          onPress={this.onSendProperty}>
          <Text style={[propertyTransferStyle.sendButtonText, {
            color: this.state.bitmarkAccount ? '#0060F2' : '#C2C2C2'
          }]}>SEND</Text>
        </TouchableOpacity>)}
      />
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
      }),
    }),
  }),
}