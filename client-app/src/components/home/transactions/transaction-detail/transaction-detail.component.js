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

    let transferOffer = this.props.navigation.state.params.transferOffer;
    let metadataList = [];
    if (transferOffer.bitmark) {
      for (let key in transferOffer.bitmark.metadata) {
        metadataList.push({ key, description: transferOffer.bitmark.metadata[key] })
      }
    }
    this.state = {
      transferOffer,
      metadataList,
    };
  }

  doReject() {
    AppController.doRejectTransferBitmark(this.state.transferOffer.bitmark.id, { indicator: true, }, {
      indicator: false, title: 'Transfer Rejected!', message: 'You’ve rejected the bitmark transfer request! '
    }, {
        indicator: false, title: 'Request Failed', message: 'This error may be due to a request expiration or a network error. We will inform the property owner that the property transfer failed. Please try again later or contact the property owner to resend a property transfer request.'
      }).then(data => {
        if (data) {
          if (this.props.navigation.state.params.refreshTransactionScreen) {
            this.props.navigation.state.params.refreshTransactionScreen();
          }
          this.props.navigation.goBack();
        }
      }).catch(error => {
        console.log('TransactionDetailComponent doRejectTransferBitmark error:', error);
      });
  }
  doAccept() {
    AppController.doAcceptTransferBitmark(this.state.transferOffer.bitmark.id, {
      indicator: true,
    }, {
        indicator: false, title: 'Acceptance Submitted', message: 'Your signature for the transfer request has been successfully submitted to the Bitmark network.'
      }, {
        indicator: false, title: 'Request Failed', message: 'This error may be due to a request expiration or a network error. We will inform the property owner that the property transfer failed. Please try again later or contact the property owner to resend a property transfer request.'
      }).then(data => {
        if (data) {
          if (this.props.navigation.state.params.refreshTransactionScreen) {
            this.props.navigation.state.params.refreshTransactionScreen();
          }
          this.props.navigation.goBack();
        }
      }).catch(error => {
        console.log('TransactionDetailComponent doRejectTransferBitmark error:', error);
      });
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
            <Text style={transactionDetailStyle.assetName}>{this.state.transferOffer.asset.name}</Text>
            <Text style={transactionDetailStyle.transferOfferContent}>
              <Text style={transactionDetailStyle.transferOfferSenderFix}>[</Text>
              <Text style={transactionDetailStyle.transferOfferSenderName} numberOfLines={1}>{this.state.transferOffer.sender.substring(0, 12)}...</Text>
              <Text style={transactionDetailStyle.transferOfferSenderFix}>] </Text>
              has transferred the property
              <Text style={transactionDetailStyle.transferOfferAssetName}> {this.state.transferOffer.asset.name}</Text>
              to you. Please sign for receipt to accept the property transfer.
            </Text>
            <View style={transactionDetailStyle.extenalArea}>
              <View style={transactionDetailStyle.extenalAreaRow}>
                <Text style={transactionDetailStyle.extenalAreaRowLabel}>BITMARK ID:</Text>
                <Text style={transactionDetailStyle.extenalAreaRowValue} numberOfLines={1}>{this.state.transferOffer.bitmark.id}</Text>
              </View>
              <View style={transactionDetailStyle.extenalAreaRow}>
                <Text style={transactionDetailStyle.extenalAreaRowLabel}>ISSUER:</Text>
                <View style={transactionDetailStyle.extenalAreaRowValueIssuerView}>
                  <Text style={transactionDetailStyle.extenalAreaRowValueIssuer_}>[</Text>
                  <Text style={transactionDetailStyle.extenalAreaRowValueIssuer} numberOfLines={1}>{this.state.transferOffer.asset.registrant}</Text>
                  <Text style={transactionDetailStyle.extenalAreaRowValueIssuer_}>]</Text>
                </View>
              </View>
              <View style={transactionDetailStyle.extenalAreaRow}>
                <Text style={transactionDetailStyle.extenalAreaRowLabel}>TIMESTAMP:</Text>
                <Text style={transactionDetailStyle.extenalAreaRowValue}>BLOCK #{this.state.transferOffer.tx.block_number}{'\n'}{moment(this.state.transferOffer.block.created_at).format('DD MMM YYYY HH:mm:ss')}</Text>
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
        transferOffer: PropTypes.object,
        refreshTransactionScreen: PropTypes.func,
      }),
    }),
  }),
}