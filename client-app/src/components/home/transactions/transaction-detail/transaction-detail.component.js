import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, Image, FlatList,
  Platform,
} from 'react-native';

import transactionDetailStyle from './transaction-detail.component.style';

import { androidDefaultStyle, iosDefaultStyle } from './../../../../commons/styles';
import { AppController } from '../../../../managers';

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});

export class TransactionDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.doReject = this.doReject.bind(this);
    this.doAccept = this.doAccept.bind(this);

    let signRequest = this.props.navigation.state.params.signRequest;
    let metadataList = [];
    if (signRequest.bitmark) {
      for (let key in signRequest.bitmark.metadata) {
        metadataList.push({ key, description: signRequest.bitmark.metadata[key] })
      }
    }
    this.state = {
      signRequest,
      metadataList,
    };
  }

  doReject() {
    AppController.doRejectTransferBitmark(this.state.bitmark.id, { indicator: true, }, {
      indicator: false, title: 'Acceptance Submitted', message: 'Your signature for the transfer request has been successfully submitted to the Bitmark network.'
    }, {
        indicator: false, title: 'Request Failed', message: 'This error may be due to a request expiration or a network error. We will inform the property owner that the property transfer failed. Please try again later or contact the property owner to resend a property transfer request.'
      }).then(data => {
        if (data !== null && this.props.navigation.state.params.refreshTransactionScreen) {
          this.props.navigation.state.params.refreshTransactionScreen();
          this.props.navigation.goBack();
        }
      }).catch(error => {
        console.log('TransactionDetailComponent doRejectTransferBitmark error:', error);
      })
  }
  doAccept() {

  }

  render() {
    return (
      <View style={transactionDetailStyle.body}>
        <View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_back_icon_study_setting.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>TRANSFER REQUEST</Text>
          <TouchableOpacity style={defaultStyle.headerRight}></TouchableOpacity>
        </View>
        <ScrollView style={[transactionDetailStyle.contentScroll]} scroll>
          <TouchableOpacity activeOpacity={1} style={transactionDetailStyle.content}>
            <Text style={transactionDetailStyle.assetName}>{this.state.signRequest.asset.name}</Text>
            <Text style={transactionDetailStyle.signRequestContent}>
              <Text style={transactionDetailStyle.signRequestSenderFix}>[</Text>
              <Text style={transactionDetailStyle.signRequestSenderName} numberOfLines={1}>{this.state.signRequest.sender.substring(0, 12)}...</Text>
              <Text style={transactionDetailStyle.signRequestSenderFix}>] </Text>
              has transferred the property
              <Text style={transactionDetailStyle.signRequestAssetName}> {this.state.signRequest.asset.name}</Text>
              to you. Please sign for receipt to accept the property transfer.
            </Text>
            <View style={transactionDetailStyle.extenalArea}>
              <View style={transactionDetailStyle.extenalAreaRow}>
                <Text style={transactionDetailStyle.extenalAreaRowLabel}>BITMARK ID:</Text>
                <Text style={transactionDetailStyle.extenalAreaRowValue} numberOfLines={1}>{this.state.signRequest.bitmark.id}</Text>
              </View>
              <View style={transactionDetailStyle.extenalAreaRow}>
                <Text style={transactionDetailStyle.extenalAreaRowLabel}>ISSUER:</Text>
                <View style={transactionDetailStyle.extenalAreaRowValueIssuerView}>
                  <Text style={transactionDetailStyle.extenalAreaRowValueIssuer_}>[</Text>
                  <Text style={transactionDetailStyle.extenalAreaRowValueIssuer} numberOfLines={1}>{this.state.signRequest.asset.registrant}</Text>
                  <Text style={transactionDetailStyle.extenalAreaRowValueIssuer_}>]</Text>
                </View>
              </View>
              <View style={transactionDetailStyle.extenalAreaRow}>
                <Text style={transactionDetailStyle.extenalAreaRowLabel}>TIMESTAMP:</Text>
                <Text style={transactionDetailStyle.extenalAreaRowValue}>BLOCK #{this.state.signRequest.tx.block_number}{'\n'}{moment(this.state.signRequest.block.created_at).format('DD MMM YYYY HH:mm:ss')}</Text>
              </View>
              <View style={transactionDetailStyle.metadataArea}>
                <FlatList data={this.state.metadataList}
                  extraData={this.state}
                  renderItem={({ item }) => {
                    return (
                      <View style={transactionDetailStyle.extenalAreaRow}>
                        <Text style={transactionDetailStyle.extenalAreaRowLabel}>{item.key}:</Text>
                        <Text style={transactionDetailStyle.metadataRowValue}>{item.description}</Text>
                      </View>
                    )
                  }} />
              </View>
            </View>
            <View style={transactionDetailStyle.buttonsArea}>
              <TouchableOpacity style={transactionDetailStyle.rejectButton} onPress={this.doReject}>
                <Text style={transactionDetailStyle.rejectButtonText}>REJECT</Text>
              </TouchableOpacity>
              <TouchableOpacity style={transactionDetailStyle.acceptButton} onPress={this.doAccept}>
                <Text style={transactionDetailStyle.acceptButtonText}>ACCEPT</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View >
    );
  }
}

TransactionDetailComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        signRequest: PropTypes.object,
        refreshTransactionScreen: PropTypes.func,
      }),
    }),
  }),
}