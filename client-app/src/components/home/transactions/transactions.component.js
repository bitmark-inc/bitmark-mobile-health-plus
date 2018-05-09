import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList, Image, ActivityIndicator,
  Alert,
} from 'react-native';
import moment from 'moment';

import { DataController, AppController } from './../../../managers';

import transactionsStyle from './transactions.component.style';
import { EventEmiterService } from '../../../services';
import defaultStyle from './../../../commons/styles';
import { sortList, convertWidth } from '../../../utils';
import { config } from '../../../configs';

const SubTabs = {
  required: 'ACTION REQUIRED',
  completed: 'HISTORY',
};

const ActionTypes = {
  transfer: 'transfer',
  donation: 'donation',
  ifttt: 'ifttt',
};
let generateDataStore = {
  actionRequired: [],
  completed: []
};

export class TransactionsComponent extends React.Component {
  static SubTabs = SubTabs;
  constructor(props) {
    super(props);
    this.switchSubtab = this.switchSubtab.bind(this);
    this.handerChangePendingTransactions = this.handerChangePendingTransactions.bind(this);
    this.handerChangeCompletedTransaction = this.handerChangeCompletedTransaction.bind(this);
    this.reloadData = this.reloadData.bind(this);
    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);
    this.handerLoadingData = this.handerLoadingData.bind(this);
    this.handerIftttInformationChange = this.handerIftttInformationChange.bind(this);
    this.acceptAllTransfers = this.acceptAllTransfers.bind(this);
    this.clickToActionRequired = this.clickToActionRequired.bind(this);
    this.generateData = this.generateData.bind(this);
    this.clickToCompleted = this.clickToCompleted.bind(this);


    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_TRANSACTIONS, null, 'TransactionsComponent');
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER, null, 'TransactionsComponent');
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_IFTTT_INFORMATION, null, 'TransactionsComponent');
    EventEmiterService.remove(EventEmiterService.events.APP_LOADING_DATA, null, 'TransactionsComponent');


    let subTab = (this.props.screenProps.subTab === SubTabs.required || this.props.screenProps.subTab === SubTabs.completed) ? this.props.screenProps.subTab : SubTabs.required;
    this.state = {
      currentUser: DataController.getUserInformation(),
      subTab,
      actionRequired: generateDataStore.actionRequired,
      completed: generateDataStore.completed,
      donationInformation: DataController.getDonationInformation(),
      isLoadingData: DataController.isLoadingData(),
      lengthDisplayActionRequired: 10,
      lengthDisplayCompleted: 10,
    };
  }

  componentWillReceiveProps(nexpProps) {
    let subTab = (nexpProps.subTab === SubTabs.required || nexpProps.subTab === SubTabs.completed) ? nexpProps.subTab : this.state.subTab;
    this.setState({ subTab });
  }

  componentDidMount() {
    this.switchSubtab(this.state.subTab);
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_TRANSACTIONS, this.handerChangeCompletedTransaction, 'TransactionsComponent');
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER, this.handerChangePendingTransactions, 'TransactionsComponent');
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange, 'TransactionsComponent');
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_IFTTT_INFORMATION, this.handerIftttInformationChange, 'TransactionsComponent');
    EventEmiterService.on(EventEmiterService.events.APP_LOADING_DATA, this.handerLoadingData, 'TransactionsComponent');
    setTimeout(() => {
      let { actionRequired, completed, donationInformation } = this.generateData();
      generateDataStore.actionRequired = actionRequired;
      generateDataStore.completed = completed;
      this.setState({ actionRequired, completed, donationInformation })
    }, 1000);

    if (this.props.screenProps.needReloadData) {
      this.reloadData();
      if (this.props.screenProps.doneReloadData) {
        this.props.screenProps.doneReloadData()
      }
    }
  }

  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_TRANSACTIONS, this.handerChangeCompletedTransaction, 'TransactionsComponent');
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER, this.handerChangePendingTransactions, 'TransactionsComponent');
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_IFTTT_INFORMATION, this.handerIftttInformationChange, 'TransactionsComponent');
    EventEmiterService.remove(EventEmiterService.events.APP_LOADING_DATA, this.handerLoadingData, 'TransactionsComponent');
  }

  generateData() {
    let actionRequired;
    let transactionData = DataController.getTransactionData();
    if (transactionData.activeIncompingTransferOffers) {
      actionRequired = actionRequired || [];
      transactionData.activeIncompingTransferOffers.forEach((item) => {
        actionRequired.push({
          key: actionRequired.length,
          transferOffer: item,
          type: ActionTypes.transfer,
          typeTitle: 'OWNERSHIP TRANSFER REQUEST ',
          timestamp: moment(item.created_at),
        });
      });
    }

    let donationInformation = DataController.getDonationInformation();
    if (donationInformation.todoTasks) {
      actionRequired = actionRequired || [];
      (donationInformation.todoTasks || []).forEach(item => {
        item.key = actionRequired.length;
        item.type = ActionTypes.donation;
        item.typeTitle = item.study ? 'DONATION Request' : 'ISSUANCE Request';
        item.timestamp = (item.list && item.list.length > 0) ? item.list[0].startDate : (item.study ? item.study.joinedDate : null);
        actionRequired.push(item);
      });
    }

    let ifttInformation = DataController.getIftttInformation();
    if (ifttInformation.bitmarkFiles) {
      ifttInformation.bitmarkFiles.forEach(item => {
        item.key = actionRequired.length;
        item.type = ActionTypes.ifttt;
        item.typeTitle = 'ISSUANCE Request';
        item.timestamp = item.assetInfo.timestamp;
        actionRequired.push(item);
      });
    }

    actionRequired = actionRequired ? sortList(actionRequired, (a, b) => {
      if (a.important) { return -1; }
      if (b.important) { return 1; }
      if (!a.timestamp) return 1;
      if (!b.timestamp) return 1;
      return moment(b.timestamp).toDate().getTime() - moment(a.timestamp).toDate().getTime();
    }) : actionRequired;

    let completed;
    if (transactionData.transactions) {
      completed = [];
      let mapIssuance = [];

      transactionData.transactions.forEach((item) => {
        let title = 'ISSUANCE';
        let type = '';
        let to = item.to;
        let status = item.status;
        let researcherName;
        if (!item.to) {
          let exitCompleted = completed.find(citem => (citem.previousId === item.txid && citem.type === 'DONATION'));
          if (exitCompleted) {
            return;
          }
          let donationCompletedTask = (donationInformation.completedTasks || []).find(task => task.bitmarkId === item.txid);
          if (donationCompletedTask && donationCompletedTask.study) {
            title = 'waiting for researcher to accept...'.toUpperCase();
            type = 'DONATION';
            status = 'waiting';
            to = donationCompletedTask.study.researcherAccount;
            researcherName = donationCompletedTask.study.researcherName.substring(0, donationCompletedTask.study.researcherName.indexOf(','));
          }
        } else {
          title = 'TRANSFER';
          type = 'P2P TRANSFER';
          let exitCompleted = completed.find(citem => (citem.txid === item.previousId && citem.type === 'DONATION'));
          if (exitCompleted) {
            exitCompleted.previousId = exitCompleted.txid;
            exitCompleted.txid = item.txid;
            return;
          }
          let donationCompletedTask = (donationInformation.completedTasks || []).find(task => task.bitmarkId === item.previousId);
          if (donationCompletedTask && donationCompletedTask.study) {
            type = 'DONATION';
            to = donationCompletedTask.study.researcherAccount;
            researcherName = donationCompletedTask.study.researcherName.substring(0, donationCompletedTask.study.researcherName.indexOf(','));
          }
        }
        if (title === 'ISSUANCE') {
          if (mapIssuance[item.assetId] && mapIssuance[item.assetId][item.blockNumber]) {
            return;
          }
          if (!mapIssuance[item.assetId]) {
            mapIssuance[item.assetId] = {};
          }
          mapIssuance[item.assetId][item.blockNumber] = true;
        }
        completed.push({
          title,
          type,
          to,
          status,
          researcherName,
          assetId: item.assetId,
          blockNumber: item.blockNumber,
          key: completed.length,
          timestamp: item.timestamp,
          txid: item.txid,
          previousId: item.previousId,
          assetName: item.assetName,
          from: item.from,
        });
      });
    }

    completed = completed ? sortList(completed, (a, b) => {
      if (!a || !a.timestamp) return -1;
      if (!b || !b.timestamp) return -1;
      return moment(b.timestamp).toDate().getTime() - moment(a.timestamp).toDate().getTime();
    }) : completed;
    console.log('generateData :', actionRequired, completed);
    return { actionRequired, completed, donationInformation };
  }
  handerDonationInformationChange() {
    let { actionRequired, completed, donationInformation } = this.generateData();
    generateDataStore.actionRequired = actionRequired;
    generateDataStore.completed = completed;
    this.setState({
      donationInformation,
      isLoadingData: DataController.isLoadingData(),
    });
  }
  handerIftttInformationChange() {
    let { actionRequired, completed, donationInformation } = this.generateData();
    generateDataStore.actionRequired = actionRequired;
    generateDataStore.completed = completed;

    this.setState({
      actionRequired, completed, donationInformation,
      isLoadingData: DataController.isLoadingData(),
    });
  }
  handerChangePendingTransactions() {
    let { actionRequired, completed, donationInformation } = this.generateData();
    generateDataStore.actionRequired = actionRequired;
    generateDataStore.completed = completed;

    this.setState({
      actionRequired, completed, donationInformation,
      isLoadingData: DataController.isLoadingData(),
    });
  }
  handerChangeCompletedTransaction() {
    let { actionRequired, completed, donationInformation } = this.generateData();
    generateDataStore.actionRequired = actionRequired;
    generateDataStore.completed = completed;

    this.setState({
      actionRequired, completed, donationInformation,
      isLoadingData: DataController.isLoadingData(),
    });
  }
  handerLoadingData() {
    this.setState({
      isLoadingData: DataController.isLoadingData(),
    });
  }

  reloadData() {
    AppController.doReloadUserData().then(() => {
      let { actionRequired, completed, donationInformation } = this.generateData();
      generateDataStore.actionRequired = actionRequired;
      generateDataStore.completed = completed;
      this.setState({
        actionRequired, completed, donationInformation,
        isLoadingData: DataController.isLoadingData(),
      });
    }).catch((error) => {
      console.log('doReloadUserData error :', error);
      EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR);
    });
  }

  switchSubtab(subTab) {
    this.setState({ subTab });
  }

  clickToActionRequired(item) {
    if (item.type === ActionTypes.transfer && item.transferOffer) {
      this.props.screenProps.homeNavigation.navigate('TransactionDetail', {
        transferOffer: item.transferOffer,
      });
    } else if (item.type === ActionTypes.donation) {
      if (item.taskType === this.state.donationInformation.commonTaskIds.bitmark_health_data) {
        this.props.screenProps.homeNavigation.navigate('HealthDataBitmark', { list: item.list });
      } else if (item.study && item.study.taskIds && item.taskType === item.study.taskIds.donations) {
        this.props.screenProps.homeNavigation.navigate('StudyDonation', { study: item.study, list: item.list });
      } else if (item.study && item.study.studyId === 'study1' && item.study.taskIds && item.taskType === item.study.taskIds.exit_survey_2) {
        this.props.screenProps.homeNavigation.navigate('Study1ExitSurvey2', { study: item.study });
      } else if (item.study && item.study.taskIds && item.taskType) {
        AppController.doStudyTask(item.study, item.taskType).then(result => {
          if (result) {
            DataController.doReloadUserData();
          }
        }).catch(error => {
          console.log('doStudyTask error:', error);
          EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR);
        });
      }
    } else if (item.type === ActionTypes.ifttt) {
      AppController.doIssueIftttData(item, {
        indicator: true, title: 'Submitting your request to the network for confirmation…', message: ''
      }, {
          indicator: false, title: 'Issuance Successful!', message: 'Now you’ve created your property. Let’s verify that your property is showing up in your account.'
        }).then(result => {
          if (result) {
            DataController.doReloadUserData();
          }
        }).catch(error => {
          console.log('doStudyTask error:', error);
          EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR);
        });
    }
  }

  clickToCompleted(item) {
    if (item.title === 'TRANSFER' && item.type === 'P2P TRANSFER') {
      let sourceUrl = config.registry_server_url + `/transaction/${item.txid}?env=app`;
      this.props.screenProps.homeNavigation.navigate('BitmarkWebView', { title: 'REGISTRY', sourceUrl, isFullScreen: true });
    } else if (item.title === 'TRANSFER' && item.type === 'DONATION' && item.previousId) {
      let sourceUrl = config.registry_server_url + `/transaction/${item.txid}?env=app`;
      this.props.screenProps.homeNavigation.navigate('BitmarkWebView', { title: 'REGISTRY', sourceUrl, isFullScreen: true });
    } else if (item.title === 'ISSUANCE') {
      let sourceUrl = config.registry_server_url + `/issuance/${item.blockNumber}/${item.assetId}/${DataController.getUserInformation().bitmarkAccountNumber}?env=app`;
      this.props.screenProps.homeNavigation.navigate('BitmarkWebView', { title: 'REGISTRY', sourceUrl, isFullScreen: true });
    }
  }

  acceptAllTransfers() {
    let transferOffers = [];
    for (let item in this.state.acceptAllTransfers) {
      if (item.type === ActionTypes.transfer) {
        transferOffers.push(item.transferOffer);
      }
    }

    Alert.alert('Sign All the Ownership Transfer Requests', `Accept “${transferOffers.length}” properties ownership transfer. `, [{
      text: 'Cancel', style: 'cancel',
    }, {
      text: 'Yes',
      onPress: () => {
        AppController.acceptAllTransfers(transferOffers, { indicator: true, }, {
          indicator: false, title: 'Acceptance Submitted', message: 'Your signature for the transfer requests have been successfully submitted to the Bitmark network.'
        }, { indicator: false, title: 'Request Failed', message: 'This error may be due to a request expiration or a network error. We will inform the property owner that the property transfer failed. Please try again later or contact the property owner to resend a property transfer request.' }, result => {
          if (result) {
            DataController.doReloadIncommingTransferOffers();
          }
        }).catch(error => {
          console.log('acceptAllTransfers error:', error);
          EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR);
        });
      }
    }]);
  }

  render() {
    return (
      <View style={transactionsStyle.body}>
        <View style={transactionsStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft}></TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>TRANSACTIONS</Text>
          <TouchableOpacity style={defaultStyle.headerRight}></TouchableOpacity>
        </View>
        <View style={transactionsStyle.subTabArea}>
          {this.state.subTab === SubTabs.required && <TouchableOpacity style={[transactionsStyle.subTabButton, {
            shadowOffset: { width: 2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={transactionsStyle.subTabButtonArea}>
              <View style={[transactionsStyle.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={transactionsStyle.subTabButtonTextArea}>
                <Text style={transactionsStyle.subTabButtonText}>{SubTabs.required.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.required && <TouchableOpacity style={[transactionsStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubtab(SubTabs.required)}>
            <View style={transactionsStyle.subTabButtonArea}>
              <View style={[transactionsStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={transactionsStyle.subTabButtonTextArea}>
                <Text style={[transactionsStyle.subTabButtonText, { color: '#C1C1C1' }]}>{SubTabs.required.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}

          {this.state.subTab === SubTabs.completed && <TouchableOpacity style={[transactionsStyle.subTabButton, {
            shadowOffset: { width: -2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={transactionsStyle.subTabButtonArea}>
              <View style={[transactionsStyle.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={transactionsStyle.subTabButtonTextArea}>
                <Text style={transactionsStyle.subTabButtonText}>{SubTabs.completed.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.completed && <TouchableOpacity style={[transactionsStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubtab(SubTabs.completed)}>
            <View style={transactionsStyle.subTabButtonArea}>
              <View style={[transactionsStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={transactionsStyle.subTabButtonTextArea}>
                <Text style={[transactionsStyle.subTabButtonText, { color: '#C1C1C1' }]}>{SubTabs.completed.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
        </View>

        {this.state.subTab === SubTabs.required && <ScrollView style={[transactionsStyle.scrollSubTabArea]}
          onScroll={(scrollEvent) => {
            if (!this.spaceNeedLoadActionRequire) {
              this.spaceNeedLoadActionRequire = scrollEvent.nativeEvent.contentSize.height / 2;
            }
            if (scrollEvent.nativeEvent.contentOffset.y >= (scrollEvent.nativeEvent.contentSize.height - this.spaceNeedLoadActionRequire) && this.state.lengthDisplayActionRequired < this.state.actionRequired.length) {
              this.setState({ lengthDisplayActionRequired: this.state.lengthDisplayActionRequired + 10 });
            }
          }}
          scrollEventThrottle={1}
        >
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            {this.state.actionRequired && this.state.actionRequired.length === 0 && this.state.isLoadingData && <View style={transactionsStyle.contentSubTab}>
              <Text style={transactionsStyle.titleNoRequiredTransferOffer}>NO ACTIONS REQUIRED.</Text>
              <Text style={transactionsStyle.messageNoRequiredTransferOffer}>This is where you will receive authorization requests.</Text>
            </View>}

            {this.state.actionRequired && this.state.actionRequired.length > 0 && <View style={transactionsStyle.contentSubTab}>
              <FlatList data={this.state.actionRequired.slice(0, Math.min(this.state.lengthDisplayActionRequired, this.state.actionRequired.length))}
                extraData={this.state}
                renderItem={({ item }) => {
                  return (<TouchableOpacity style={transactionsStyle.transferOfferRow} onPress={() => this.clickToActionRequired(item)}>
                    <View style={transactionsStyle.transferOfferTitle}>
                      <Text style={transactionsStyle.transferOfferTitleType}>{item.typeTitle.toUpperCase()}</Text>
                      <Text style={transactionsStyle.transferOfferTitleTime} >{moment(item.timestamp).format('YYYY MMM DD').toUpperCase()}</Text>
                      <Image style={transactionsStyle.transferOfferTitleIcon} source={require('../../../../assets/imgs/sign-request-icon.png')} />
                    </View>

                    {item.type === ActionTypes.transfer && <View style={transactionsStyle.iftttTask}>
                      <Text style={transactionsStyle.iftttTitle}>{item.transferOffer.asset.name}</Text>
                      <Text style={transactionsStyle.iftttDescription}>Sign your bitmark transfer.</Text>
                    </View>}

                    {item.type === ActionTypes.donation && <View style={transactionsStyle.donationTask}>
                      <Text style={transactionsStyle.donationTaskTitle} >{item.title + (item.number > 1 ? ` (${item.number})` : '')}</Text>
                      <View style={transactionsStyle.donationTaskDescriptionArea}>
                        <Text style={transactionsStyle.donationTaskDescription}>{item.description}</Text>
                        {item.important && <Image style={transactionsStyle.donationTaskImportantIcon} source={require('../../../../assets/imgs/important-blue.png')} />}
                      </View>
                    </View>}

                    {item.type === ActionTypes.ifttt && <View style={transactionsStyle.iftttTask}>
                      <Text style={transactionsStyle.iftttTitle}>{item.assetInfo.propertyName}</Text>
                      <Text style={transactionsStyle.iftttDescription}>Sign your bitmark issuance for your IFTTT data.</Text>
                    </View>}
                  </TouchableOpacity>)
                }} />
            </View>}
            {(!this.state.isLoadingData || this.state.lengthDisplayActionRequired < this.state.actionRequired.length) && <View style={transactionsStyle.contentSubTab}>
              <ActivityIndicator size="large" style={{ marginTop: 46, }} />
            </View>}
          </TouchableOpacity>
        </ScrollView>}
        {this.state.subTab === SubTabs.required && this.state.actionRequired && this.state.actionRequired.length > 0
          && (this.state.actionRequired.findIndex(item => item.type === ActionTypes.transfer) >= 0) && <TouchableOpacity style={transactionsStyle.acceptAllTransfersButton} onPress={this.acceptAllTransfers} >
            <Text style={transactionsStyle.acceptAllTransfersButtonText}>SIGN ALL OWNERSHIP TRANSFER REQUESTS</Text>
          </TouchableOpacity>
        }
        {this.state.subTab === SubTabs.completed && <ScrollView style={[transactionsStyle.scrollSubTabArea]}
          onScroll={(scrollEvent) => {
            if (!this.spaceNeedLoadActionCompleted) {
              this.spaceNeedLoadActionCompleted = scrollEvent.nativeEvent.contentSize.height / 2;
            }
            if (scrollEvent.nativeEvent.contentOffset.y >= (scrollEvent.nativeEvent.contentSize.height - this.spaceNeedLoadActionCompleted) && this.state.lengthDisplayCompleted < this.state.completed.length) {
              this.setState({ lengthDisplayCompleted: this.state.lengthDisplayCompleted + 10 });
            }
          }}
          scrollEventThrottle={1}
        >
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            {this.state.completed && this.state.completed.length === 0 && this.state.isLoadingData && <View style={transactionsStyle.contentSubTab}>
              <Text style={transactionsStyle.titleNoRequiredTransferOffer}>NO TRANSACTION HISTORY.</Text>
              <Text style={transactionsStyle.messageNoRequiredTransferOffer}>Your transaction history will be available here.</Text>
            </View>}
            {this.state.completed && this.state.completed.length > 0 && <View style={transactionsStyle.contentSubTab}>
              <FlatList data={this.state.completed.slice(0, Math.min(this.state.lengthDisplayCompleted, this.state.completed.length))}
                extraData={this.state}
                renderItem={({ item }) => {
                  return (
                    <TouchableOpacity style={transactionsStyle.completedTransfer} onPress={() => this.clickToCompleted(item)} disabled={(item.status === 'pending' || item.status === 'waiting')}>
                      <View style={transactionsStyle.completedTransferHeader}>
                        <Text style={[transactionsStyle.completedTransferHeaderTitle, {
                          color: (item.status === 'pending' || item.status === 'waiting') ? '#999999' : '#0060F2',
                          width: item.status === 'waiting' ? 'auto' : convertWidth(102)
                        }]}>{item.title}</Text>
                        {item.status !== 'waiting' && <Text style={[transactionsStyle.completedTransferHeaderValue, {
                          color: (item.status === 'pending' || item.status === 'waiting') ? '#999999' : '#0060F2'
                        }]}>{item.status === 'pending' ? 'PENDING...' : moment(item.timestamp).format('YYYY MMM DD HH:mm:ss').toUpperCase()}</Text>}
                      </View>
                      <View style={transactionsStyle.completedTransferContent}>
                        <View style={transactionsStyle.completedTransferContentRow}>
                          <Text style={[transactionsStyle.completedTransferContentRowLabel, { marginTop: 1, }]}>PROPERTY</Text>
                          <Text style={[transactionsStyle.completedTransferContentRowPropertyName]} numberOfLines={1} >{item.assetName}</Text>
                        </View>
                        {!!item.type && <View style={transactionsStyle.completedTransferContentRow}>
                          <Text style={transactionsStyle.completedTransferContentRowLabel}>TYPE</Text>
                          <Text style={transactionsStyle.completedTransferContentRowValue} numberOfLines={1}>{item.type.toUpperCase()}</Text>
                        </View>}
                        <View style={[transactionsStyle.completedTransferContentRow, { marginTop: 1, }]}>
                          <Text style={transactionsStyle.completedTransferContentRowLabel}>FROM</Text>
                          <Text style={transactionsStyle.completedTransferContentRowValue} numberOfLines={1}>{item.from === this.state.currentUser.bitmarkAccountNumber ? 'YOU' :
                            ('[' + item.from.substring(0, 4) + '...' + item.from.substring(item.from.length - 4, item.from.length) + ']')}</Text>
                        </View>
                        {!!item.to && <View style={transactionsStyle.completedTransferContentRow}>
                          <Text style={transactionsStyle.completedTransferContentRowLabel}>TO</Text>
                          <Text style={transactionsStyle.completedTransferContentRowValue} numberOfLines={1}>{item.researcherName ? item.researcherName : (item.to === this.state.currentUser.bitmarkAccountNumber ? 'YOU' :
                            ('[' + item.to.substring(0, 4) + '...' + item.to.substring(item.to.length - 4, item.to.length) + ']'))}</Text>
                        </View>}
                      </View>
                    </TouchableOpacity>
                  )
                }} />
            </View >}
            {(!this.state.isLoadingData || this.state.lengthDisplayCompleted < this.state.completed.length) && <View style={transactionsStyle.contentSubTab}>
              <ActivityIndicator size="large" style={{ marginTop: 46, }} />
            </View>}
          </TouchableOpacity>
        </ScrollView>}
      </View >
    );
  }
}

TransactionsComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
  screenProps: PropTypes.shape({
    subTab: PropTypes.string,
    switchMainTab: PropTypes.func,
    logout: PropTypes.func,
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
      dispatch: PropTypes.func,
    }),
    needReloadData: PropTypes.bool,
    doneReloadData: PropTypes.func,
  }),
}