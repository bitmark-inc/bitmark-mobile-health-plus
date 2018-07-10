import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, Image, FlatList,
  Alert,
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import { BitmarkComponent } from '../../../../commons/components';

import transactionDetailStyle from './transaction-detail.component.style';

import defaultStyle from './../../../../commons/styles';
import { AppProcessor } from '../../../../processors';
import { BottomTabsComponent } from '../../bottom-tabs/bottom-tabs.component';
import { BitmarkModel } from '../../../../models';
import { EventEmitterService } from '../../../../services';
import { iosConstant } from '../../../../configs/ios/ios.config';

export class TransactionDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.doReject = this.doReject.bind(this);
    this.doAccept = this.doAccept.bind(this);

    let transferOffer = this.props.navigation.state.params.transferOffer;
    let metadataList = [];
    if (transferOffer.asset) {
      for (let key in transferOffer.asset.metadata) {
        metadataList.push({ key, description: transferOffer.asset.metadata[key] })
      }
    }
    this.state = {
      transferOffer,
      metadataList,
      transactionData: null
    };
    BitmarkModel.doGetTransactionDetail(transferOffer.record.link).then(transactionData => {
      console.log('transactionData :', transactionData);
      this.setState({ transactionData })
    }).catch(error => {
      console.log('TransactionDetailComponent doGetTransactionDetail error :', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {error});
    });
  }

  doReject() {
    Alert.alert('Are you sure you want to reject receipt of this property?', '', [{
      text: 'Cancel', style: 'cancel',
    }, {
      text: 'Yes',
      onPress: () => {
        AppProcessor.doRejectTransferBitmark(this.state.transferOffer, { indicator: true, }, {
          indicator: false, title: '', message: ''
        }).then(data => {
          if (data) {
            Alert.alert('Receipt rejected!', 'You’ve rejected to sign for receipt of this bitmark!', [{
              text: 'OK',
              onPress: () => {
                const resetHomePage = NavigationActions.reset({
                  index: 0,
                  actions: [
                    NavigationActions.navigate({
                      routeName: 'User', params: {
                        displayedTab: { mainTab: BottomTabsComponent.MainTabs.transaction, subTab: 'ACTIONS REQUIRED' },
                      }
                    }),
                  ]
                });
                this.props.navigation.dispatch(resetHomePage);
              }
            }]);
          }
        }).catch(error => {
          Alert.alert('Request Failed', 'This error may be due to a request expiration or a network error.\nPlease try again later.');
          console.log('TransactionDetailComponent doRejectTransferBitmark error:', error);
        });
      },
    }]);
  }
  doAccept() {
    AppProcessor.doAcceptTransferBitmark(this.state.transferOffer, { indicator: true, }).then(data => {
      if (data) {
        Alert.alert('Signature Submitted', 'Your signature of receipt has been successfully submitted to the Bitmark network.', [{
          text: 'OK',
          onPress: () => {
            const resetHomePage = NavigationActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: 'User', params: {
                    displayedTab: { mainTab: BottomTabsComponent.MainTabs.properties },
                  }
                }),
              ]
            });
            this.props.navigation.dispatch(resetHomePage);
          }
        }]);
      }
    }).catch(error => {
      Alert.alert('Request Failed', 'This error may be due to a request expiration or a network error.\nPlease try again later.');
      console.log('TransactionDetailComponent doRejectTransferBitmark error:', error);
    });
  }

  render() {
    return (
      <BitmarkComponent
        header={(<View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>SIGN FOR BITMARK</Text>
          <TouchableOpacity style={defaultStyle.headerRight}></TouchableOpacity>
        </View>)}
        content={(<View style={transactionDetailStyle.body}>
          <ScrollView style={[transactionDetailStyle.contentScroll]} scroll>
            <TouchableOpacity activeOpacity={1} style={transactionDetailStyle.content}>
              <Text style={transactionDetailStyle.assetName}>{this.state.transferOffer.asset.name}</Text>
              <Text style={transactionDetailStyle.transferOfferContent}>
                <Text style={transactionDetailStyle.transferOfferSenderFix}>[</Text>
                <Text style={transactionDetailStyle.transferOfferSenderName} numberOfLines={1}>{this.state.transferOffer.from.substring(0, 12)}...</Text>
                <Text style={transactionDetailStyle.transferOfferSenderFix}>] </Text>
                has sent the property
                <Text style={transactionDetailStyle.transferOfferAssetName}> {this.state.transferOffer.asset.name} </Text>
                to you. Please sign to accept the bitmark for the property.
              </Text>
              <View style={transactionDetailStyle.externalArea}>
                <View style={transactionDetailStyle.externalAreaRow}>
                  <Text style={transactionDetailStyle.externalAreaRowLabel}>BITMARK ID:</Text>
                  <Text style={transactionDetailStyle.externalAreaRowValue} numberOfLines={1}>{this.state.transferOffer.bitmark.id}</Text>
                </View>
                <View style={transactionDetailStyle.externalAreaRow}>
                  <Text style={transactionDetailStyle.externalAreaRowLabel}>ISSUER:</Text>
                  <View style={transactionDetailStyle.externalAreaRowValueIssuerView}>
                    <Text style={transactionDetailStyle.externalAreaRowValueIssuer_}>[</Text>
                    <Text style={transactionDetailStyle.externalAreaRowValueIssuer} numberOfLines={1}>{this.state.transferOffer.asset.registrant}</Text>
                    <Text style={transactionDetailStyle.externalAreaRowValueIssuer_}>]</Text>
                  </View>
                </View>
                <View style={transactionDetailStyle.externalAreaRow}>
                  <Text style={transactionDetailStyle.externalAreaRowLabel}>TIMESTAMP:</Text>
                  {this.state.transactionData && <Text style={transactionDetailStyle.externalAreaRowValue}>BLOCK #{this.state.transactionData.tx.block_number}{'\n'}{moment(this.state.transactionData.block.created_at).format('DD MMM YYYY HH:mm:ss')}</Text>}
                  {!this.state.transactionData && <Text style={transactionDetailStyle.externalAreaRowValue}>BLOCK #...{'\n'}</Text>}
                </View>
                <View style={transactionDetailStyle.metadataArea}>
                  <FlatList data={this.state.metadataList}
                    extraData={this.state}
                    renderItem={({ item }) => {
                      return (
                        <View style={transactionDetailStyle.externalAreaRow}>
                          <Text style={transactionDetailStyle.externalAreaRowLabel}>{item.key}:</Text>
                          <Text style={transactionDetailStyle.metadataRowValue}>{item.description}</Text>
                        </View>
                      )
                    }} />
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View >)}

        footerHeight={45 + iosConstant.blankFooter / 2}
        footer={(<View style={transactionDetailStyle.buttonsArea}>
          <TouchableOpacity style={transactionDetailStyle.rejectButton} onPress={this.doReject}>
            <Text style={transactionDetailStyle.rejectButtonText}>REJECT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[transactionDetailStyle.acceptButton, { marginLeft: 1 }]} onPress={this.doAccept}>
            <Text style={transactionDetailStyle.acceptButtonText}>ACCEPT</Text>
          </TouchableOpacity>
        </View>)}
      />

    );
  }
}

TransactionDetailComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    dispatch: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        transferOffer: PropTypes.object,
      }),
    }),
  }),
}