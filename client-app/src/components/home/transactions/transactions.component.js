import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList, Image, ActivityIndicator,
} from 'react-native';
import moment from 'moment';

import { DataController, AppController } from './../../../managers';

import transactionsStyle from './transactions.component.style';
import { EventEmiterService } from '../../../services';
import defaultStyle from './../../../commons/styles';
import { sortList } from '../../../utils';
import { config } from '../../../configs';

const SubTabs = {
  required: 'ACTION REQUIRED',
  completed: 'HISTORY',
};

const ActionTypes = {
  transfer: 'Property Transfer Request',
  donation: '',
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
    this.handerLoadFistData = this.handerLoadFistData.bind(this);
    this.clickToActionRequired = this.clickToActionRequired.bind(this);
    this.generateData = this.generateData.bind(this);
    this.clickToCompleted = this.clickToCompleted.bind(this);

    let subTab = (this.props.screenProps.subTab === SubTabs.required || this.props.screenProps.subTab === SubTabs.completed) ? this.props.screenProps.subTab : SubTabs.required;

    let { actionRequired, completed, donationInformation } = this.generateData();
    this.state = {
      currentUser: DataController.getUserInformation(),
      subTab,
      actionRequired,
      completed,
      donationInformation,
      doneLoadDataFirstTime: DataController.isDoneFirstimeLoadData(),
    };
  }

  componentWillReceiveProps(nexpProps) {
    let subTab = (nexpProps.subTab === SubTabs.required || nexpProps.subTab === SubTabs.completed) ? nexpProps.subTab : this.state.subTab;
    this.setState({ subTab });
  }

  componentDidMount() {
    this.switchSubtab(this.state.subTab);
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_TRANSACTIONS, this.handerChangeCompletedTransaction);
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER, this.handerChangePendingTransactions);
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange);
    EventEmiterService.on(EventEmiterService.events.APP_LOAD_FIRST_DATA, this.handerLoadFistData);
    if (this.props.screenProps.needReloadData) {
      this.reloadData();
      if (this.props.screenProps.doneReloadData) {
        this.props.screenProps.doneReloadData()
      }
    }
  }

  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_TRANSACTIONS, this.handerChangeCompletedTransaction);
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER, this.handerChangePendingTransactions);
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange);
    EventEmiterService.remove(EventEmiterService.events.APP_LOAD_FIRST_DATA, this.handerLoadFistData);
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
          typeTitle: 'Property Transfer Request',
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
        item.typeTitle = item.study ? 'Property DONATION Request' : 'Property ISSUANCE Request';
        item.timestamp = (item.list && item.list.length > 0) ? item.list[0].startDate : (item.study ? item.study.joinedDate : null);
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
            title = 'TRANSFER';
            type = 'DONATION';
            status = 'pending';
            to = donationCompletedTask.study.researcherAccount;
            researcherName = donationCompletedTask.study.researcherName;
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
            researcherName = donationCompletedTask.study.researcherName;
          }
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

    return { actionRequired, completed, donationInformation };
  }
  handerDonationInformationChange() {
    let { actionRequired, completed, donationInformation } = this.generateData();
    console.log('actionRequired, completed, donationInformation handerDonationInformationChange:', actionRequired, completed, donationInformation);
    this.setState({
      actionRequired, completed, donationInformation,
      doneLoadDataFirstTime: DataController.isDoneFirstimeLoadData(),
    });
  }
  handerChangePendingTransactions() {
    let { actionRequired, completed, donationInformation } = this.generateData();
    console.log('actionRequired, completed, donationInformation handerChangePendingTransactions:', actionRequired, completed, donationInformation);
    this.setState({
      actionRequired, completed, donationInformation,
      doneLoadDataFirstTime: DataController.isDoneFirstimeLoadData(),
    });
  }
  handerChangeCompletedTransaction() {
    let { actionRequired, completed, donationInformation } = this.generateData();
    console.log('actionRequired, completed, donationInformation handerChangeCompletedTransaction:', actionRequired, completed, donationInformation);
    this.setState({
      actionRequired, completed, donationInformation,
      doneLoadDataFirstTime: DataController.isDoneFirstimeLoadData(),
    });
  }
  handerLoadFistData() {
    this.setState({
      doneLoadDataFirstTime: DataController.isDoneFirstimeLoadData(),
    });
  }

  reloadData() {
    AppController.doReloadUserData().then(() => {
      let { actionRequired, completed, donationInformation } = this.generateData();
      console.log('actionRequired, completed, donationInformation :', actionRequired, completed, donationInformation);
      this.setState({
        actionRequired, completed, donationInformation,
        doneLoadDataFirstTime: DataController.isDoneFirstimeLoadData(),
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
        AppController.doStudyTask(item.study, item.taskType).catch(error => {
          console.log('doStudyTask error:', error);
          EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR);
        });
      }
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

        <ScrollView style={[transactionsStyle.scrollSubTabArea]}>
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            {this.state.subTab === SubTabs.required && this.state.actionRequired && this.state.actionRequired.length === 0 && this.state.doneLoadDataFirstTime && <View style={transactionsStyle.contentSubTab}>
              <Text style={transactionsStyle.titleNoRequiredTransferOffer}>NO ACTIONS REQUIRED.</Text>
              <Text style={transactionsStyle.messageNoRequiredTransferOffer}>This is where you will receive any requests that require your signature.</Text>
            </View>}

            {this.state.subTab === SubTabs.required && this.state.actionRequired && this.state.actionRequired.length > 0 && <View style={transactionsStyle.contentSubTab}>
              <FlatList data={this.state.actionRequired}
                extraData={this.state}
                renderItem={({ item }) => {
                  return (<TouchableOpacity style={transactionsStyle.transferOfferRow} onPress={() => this.clickToActionRequired(item)}>
                    <View style={transactionsStyle.transferOfferTitle}>
                      <Text style={transactionsStyle.transferOfferTitleType}>{item.typeTitle.toUpperCase()}</Text>
                      <Text style={transactionsStyle.transferOfferTitleTime} >{moment(item.timestamp).format('YYYY MMM DD').toUpperCase()}</Text>
                      <Image style={transactionsStyle.transferOfferTitleIcon} source={require('../../../../assets/imgs/sign-request-icon.png')} />
                    </View>
                    {!!item.transferOffer && <Text style={transactionsStyle.transferOfferContent}>Sign to accept the property
                        <Text style={transactionsStyle.transferOfferAssetName}> {item.transferOffer.asset.name} </Text>transfer request.
                      </Text>}

                    {!item.transferOffer && <View style={transactionsStyle.donationTask}>
                      <Text style={transactionsStyle.donationTaskTitle} >{item.title}</Text>
                      <View style={transactionsStyle.donationTaskDescriptionArea}>
                        <Text style={transactionsStyle.donationTaskDescription}>{item.description}</Text>
                        {item.important && <Image style={transactionsStyle.donationTaskImportantIcon} source={require('../../../../assets/imgs/important-blue.png')} />}
                      </View>
                    </View>}
                  </TouchableOpacity>)
                }} />
            </View>}

            {this.state.subTab === SubTabs.completed && this.state.completed && this.state.completed.length === 0 && this.state.doneLoadDataFirstTime && <View style={transactionsStyle.contentSubTab}>
              <Text style={transactionsStyle.titleNoRequiredTransferOffer}>NO TRANSACTION HISTORY.</Text>
              <Text style={transactionsStyle.messageNoRequiredTransferOffer}>This is where your history of completed transaction will be stored.</Text>
            </View>}
            {this.state.subTab === SubTabs.completed && this.state.completed && this.state.completed.length > 0 && <View style={transactionsStyle.contentSubTab}>
              <FlatList data={this.state.completed}
                extraData={this.state}
                renderItem={({ item }) => {
                  return (
                    <TouchableOpacity style={transactionsStyle.completedTransfer} onPress={() => this.clickToCompleted(item)} disabled={item.status === 'pending'}>
                      <View style={transactionsStyle.completedTransferHeader}>
                        <Text style={[transactionsStyle.completedTransferHeaderTitle, {
                          color: item.status === 'pending' ? '#999999' : '#0060F2'
                        }]}>{item.title}</Text>
                        <Text style={[transactionsStyle.completedTransferHeaderValue, {
                          color: item.status === 'pending' ? '#999999' : '#0060F2'
                        }]}>{item.status === 'pending' ? 'PENDING...' : moment(item.timestamp).format('YYYY MMM DD HH:mm:ss').toUpperCase()}</Text>
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
            {!this.state.doneLoadDataFirstTime && <View style={transactionsStyle.contentSubTab}>
              <ActivityIndicator size="large" style={{ marginTop: 46, }} />
            </View>}
          </TouchableOpacity>
        </ScrollView>
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