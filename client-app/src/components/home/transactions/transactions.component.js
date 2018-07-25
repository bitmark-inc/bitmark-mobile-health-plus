import React from 'react';
import PropTypes from 'prop-types';
import { NavigationActions } from 'react-navigation';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList, Image, ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import moment from 'moment';

import { DataProcessor, AppProcessor } from './../../../processors';

import transactionsStyle from './transactions.component.style';
import { EventEmitterService } from '../../../services';
import defaultStyle from './../../../commons/styles';
import { convertWidth } from '../../../utils';
import { config } from '../../../configs';
import { BottomTabsComponent } from '../bottom-tabs/bottom-tabs.component';

const SubTabs = {
  required: 'ACTIONS REQUIRED',
  completed: 'HISTORY',
};

const ActionTypes = {
  transfer: 'transfer',
  donation: 'donation',
  ifttt: 'ifttt',
  test_write_down_recovery_phase: 'test_write_down_recovery_phase'
};

let currentSize = Dimensions.get('window');

let ComponentName = 'TransactionsComponent';
export class TransactionsComponent extends React.Component {
  static SubTabs = SubTabs;
  constructor(props) {
    super(props);
    this.switchSubTab = this.switchSubTab.bind(this);
    this.handerChangeScreenData = this.handerChangeScreenData.bind(this);
    this.acceptAllTransfers = this.acceptAllTransfers.bind(this);
    this.reloadData = this.reloadData.bind(this);
    this.handerLoadingData = this.handerLoadingData.bind(this);

    this.clickToActionRequired = this.clickToActionRequired.bind(this);
    this.clickToCompleted = this.clickToCompleted.bind(this);

    EventEmitterService.remove(EventEmitterService.events.CHANGE_TRANSACTION_SCREEN_ACTION_REQUIRED_DATA, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_TRANSACTION_SCREEN_HISTORIES_DATA, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.APP_LOADING_DATA, null, ComponentName);

    let subTab = (this.props.screenProps.subTab === SubTabs.required || this.props.screenProps.subTab === SubTabs.completed) ? this.props.screenProps.subTab : SubTabs.required;
    this.state = {
      currentUser: DataProcessor.getUserInformation(),
      subTab,
      totalActionRequired: 0,
      totalCompleted: 0,
      actionRequired: [],
      completed: [],
      donationInformation: null,
      appLoadingData: DataProcessor.isAppLoadingData(),
      gettingData: true,
      lengthDisplayActionRequired: 0,
      lengthDisplayCompleted: 0,
    };

    const doGetScreenData = async () => {

      let { actionRequired, totalActionRequired } = await DataProcessor.doGetTransactionScreenActionRequired(0);
      let { completed, totalCompleted } = await DataProcessor.doGetTransactionScreenHistories(0);
      let donationInformation = await DataProcessor.doGetDonationInformation();

      this.setState({
        totalActionRequired,
        totalCompleted,
        completed,
        actionRequired,
        gettingData: false,
        lengthDisplayActionRequired: actionRequired.length,
        lengthDisplayCompleted: completed.length,
        donationInformation,
      });
    }
    doGetScreenData();
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    let subTab = (nextProps.subTab === SubTabs.required || nextProps.subTab === SubTabs.completed) ? nextProps.subTab : this.state.subTab;
    this.setState({ subTab });
  }

  componentDidMount() {
    this.switchSubTab(this.state.subTab);
    EventEmitterService.on(EventEmitterService.events.CHANGE_TRANSACTION_SCREEN_ACTION_REQUIRED_DATA, this.handerChangeScreenData, ComponentName);
    EventEmitterService.on(EventEmitterService.events.CHANGE_TRANSACTION_SCREEN_HISTORIES_DATA, this.handerChangeScreenData, ComponentName);

    EventEmitterService.on(EventEmitterService.events.APP_LOADING_DATA, this.handerLoadingData, ComponentName);

    if (this.props.screenProps.needReloadData) {
      this.reloadData();
      if (this.props.screenProps.doneReloadData) {
        this.props.screenProps.doneReloadData()
      }
    }
  }

  async handerChangeScreenData() {
    let { actionRequired, totalActionRequired } = await DataProcessor.doGetTransactionScreenActionRequired(this.state.lengthDisplayActionRequired);
    let { completed, totalCompleted } = await DataProcessor.doGetTransactionScreenHistories(this.state.lengthDisplayCompleted);

    let donationInformation = await DataProcessor.doGetDonationInformation();
    this.setState({
      actionRequired: actionRequired,
      completed: completed,
      lengthDisplayActionRequired: actionRequired.length,
      lengthDisplayCompleted: completed.length,
      totalActionRequired,
      totalCompleted,
      donationInformation,
    });
  }
  handerLoadingData() {
    this.setState({
      appLoadingData: DataProcessor.isAppLoadingData(),
    });
  }

  reloadData() {
    AppProcessor.doReloadUserData().catch((error) => {
      console.log('doReloadUserData error :', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  switchSubTab(subTab) {
    this.setState({ subTab });
  }

  clickToActionRequired(item) {
    if (item.type === ActionTypes.transfer && item.transferOffer) {
      this.props.screenProps.homeNavigation.navigate('TransactionDetail', {
        transferOffer: item.transferOffer,
      });
    } else if (item.type === ActionTypes.donation && this.state.donationInformation) {
      if (item.taskType === this.state.donationInformation.commonTaskIds.bitmark_health_data) {
        this.props.screenProps.homeNavigation.navigate('HealthDataBitmark', { list: item.list });
      } else if (item.study && item.study.taskIds && item.taskType === item.study.taskIds.donations) {
        this.props.screenProps.homeNavigation.navigate('StudyDonation', { study: item.study, list: item.list });
      } else if (item.study && item.study.studyId === 'study1' && item.study.taskIds && item.taskType === item.study.taskIds.exit_survey_2) {
        this.props.screenProps.homeNavigation.navigate('Study1ExitSurvey2', { study: item.study });
      } else if (item.study && item.study.studyId === 'study2' && item.study.taskIds && item.taskType === item.study.taskIds.entry_study) {
        this.props.screenProps.homeNavigation.navigate('Study2EntryInterview', { study: item.study });
      } else if (item.study && item.study.taskIds && item.taskType) {
        AppProcessor.doStudyTask(item.study, item.taskType).then(result => {
          if (result) {
            DataProcessor.doReloadUserData();
          }
        }).catch(error => {
          console.log('doStudyTask error:', error);
          EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
        });
      }
    } else if (item.type === ActionTypes.ifttt) {
      AppProcessor.doIssueIftttData(item, {
        indicator: true, title: '', message: 'Sending your transaction to the Bitmark network...'
      }).then(result => {
        if (result) {
          DataProcessor.doReloadUserData();
          Alert.alert('Success!', 'Your property rights have been registered.', [{
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
              this.props.screenProps.homeNavigation.dispatch(resetHomePage);
            }
          }]);
        }
      }).catch(error => {
        console.log('doStudyTask error:', error);
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
      });
    } else if (item.type === ActionTypes.test_write_down_recovery_phase) {
      EventEmitterService.emit(EventEmitterService.events.NEED_REFRESH_USER_COMPONENT_STATE, {
        displayedTab: {
          mainTab: 'Account',
          subTab: null
        },
        goToRecoveryPhase: true,
        changeMainTab: {mainTab: 'Account'}
      });
    }
  }

  clickToCompleted(item) {
    if (item.title === 'SEND' && item.type === 'P2P TRANSFER') {
      let sourceUrl = config.registry_server_url + `/transaction/${item.txid}?env=app`;
      this.props.screenProps.homeNavigation.navigate('BitmarkWebView', { title: 'REGISTRY', sourceUrl, isFullScreen: true });
    } else if (item.title === 'SEND' && item.type === 'DONATION' && item.previousId) {
      let sourceUrl = config.registry_server_url + `/transaction/${item.txid}?env=app`;
      this.props.screenProps.homeNavigation.navigate('BitmarkWebView', { title: 'REGISTRY', sourceUrl, isFullScreen: true });
    } else if ((item.title === 'CANCELLED BY YOU' || item.title === 'REJECTED BY RESEARCHER') && item.type === 'DONATION') {
      let sourceUrl = config.registry_server_url + `/bitmark/${item.txid}?env=app`;
      this.props.screenProps.homeNavigation.navigate('BitmarkWebView', { title: 'REGISTRY', sourceUrl, isFullScreen: true });
    } else if (item.title === 'ISSUANCE') {
      let sourceUrl = config.registry_server_url + `/issuance/${item.blockNumber}/${item.assetId}/${DataProcessor.getUserInformation().bitmarkAccountNumber}?env=app`;
      this.props.screenProps.homeNavigation.navigate('BitmarkWebView', { title: 'REGISTRY', sourceUrl, isFullScreen: true });
    }
  }

  async acceptAllTransfers() {
    AppProcessor.doGetAllTransfersOffers().then(transferOffers => {
      console.log(transferOffers);
      Alert.alert('Sign for acceptance of all bitmarks sent to you?', `Accept “${transferOffers.length}” properties sent to you.`, [{
        text: 'Cancel', style: 'cancel',
      }, {
        text: 'Yes',
        onPress: () => {
          AppProcessor.doAcceptAllTransfers(transferOffers, { indicator: true, }, result => {
            if (result) {
              Alert.alert('Acceptance Submitted', 'Your signature for the transfer request has been successfully submitted to the Bitmark network.');
            }
          }).catch(error => {
            console.log('acceptAllTransfers error:', error);
            Alert.alert('Request Failed', 'This error may be due to a request expiration or a network error. We will inform the property owner that the property transfer failed. Please try again later or contact the property owner to resend a property transfer request.');
          });
        }
      }]);
    }).catch(error => {
      console.log('doGetAllTransfersOffers error:', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
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
          }]} onPress={() => this.switchSubTab(SubTabs.required)}>
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
          }]} onPress={() => this.switchSubTab(SubTabs.completed)}>
            <View style={transactionsStyle.subTabButtonArea}>
              <View style={[transactionsStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={transactionsStyle.subTabButtonTextArea}>
                <Text style={[transactionsStyle.subTabButtonText, { color: '#C1C1C1' }]}>{SubTabs.completed.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
        </View>

        {this.state.subTab === SubTabs.required && <ScrollView style={[transactionsStyle.scrollSubTabArea]}
          onScroll={async (scrollEvent) => {
            if (this.loadingActionRequiredWhenScroll) {
              return;
            }
            if (scrollEvent.nativeEvent.contentOffset.y >= (scrollEvent.nativeEvent.contentSize.height - currentSize.height) && (this.state.lengthDisplayActionRequired < this.state.totalActionRequired)) {
              this.loadingActionRequiredWhenScroll = true;
              let lengthDisplayActionRequired = Math.min(this.state.totalActionRequired, this.state.lengthDisplayActionRequired + 20);
              let { actionRequired } = await DataProcessor.doGetTransactionScreenActionRequired(lengthDisplayActionRequired);
              this.setState({ lengthDisplayActionRequired: actionRequired.length, actionRequired });
            }
            this.loadingActionRequiredWhenScroll = false;
          }}
          scrollEventThrottle={1}>
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            {this.state.actionRequired && this.state.actionRequired.length === 0 && (!this.state.gettingData && !this.state.appLoadingData) && <View style={transactionsStyle.contentSubTab}>
              <Text style={transactionsStyle.titleNoRequiredTransferOffer}>NO ACTIONS REQUIRED.</Text>
              <Text style={transactionsStyle.messageNoRequiredTransferOffer}>This is where you will receive authorization requests.</Text>
            </View>}

            {this.state.actionRequired && this.state.actionRequired.length > 0 && <View style={transactionsStyle.contentSubTab}>
              <FlatList data={this.state.actionRequired}
                extraData={this.state}
                renderItem={({ item }) => {
                  return (<TouchableOpacity style={transactionsStyle.transferOfferRow} onPress={() => this.clickToActionRequired(item)}>
                    <View style={transactionsStyle.transferOfferTitle}>
                      <Text style={transactionsStyle.transferOfferTitleType}>{item.typeTitle.toUpperCase()}</Text>
                      <Text style={transactionsStyle.transferOfferTitleTime} >{moment(item.timestamp).format('YYYY MMM DD').toUpperCase()}</Text>
                      <Image style={transactionsStyle.transferOfferTitleIcon} source={require('./../../../../assets/imgs/sign-request-icon.png')} />
                    </View>

                    {item.type === ActionTypes.transfer && <View style={transactionsStyle.iftttTask}>
                      <Text style={transactionsStyle.iftttTitle}>{item.transferOffer.asset.name}</Text>
                      <Text style={transactionsStyle.iftttDescription}>Sign to receive the bitmark from {'[' + item.transferOffer.bitmark.owner.substring(0, 4) + '...' + item.transferOffer.bitmark.owner.substring(item.transferOffer.bitmark.owner.length - 4, item.transferOffer.bitmark.owner.length) + ']'}.</Text>
                    </View>}

                    {item.type === ActionTypes.donation && <View style={transactionsStyle.donationTask}>
                      <Text style={transactionsStyle.donationTaskTitle} >{item.title + (item.number > 1 ? ` (${item.number})` : '')}</Text>
                      <View style={transactionsStyle.donationTaskDescriptionArea}>
                        <Text style={transactionsStyle.donationTaskDescription}>{item.description}</Text>
                        {item.important && <Image style={transactionsStyle.donationTaskImportantIcon} source={require('./../../../../assets/imgs/important-blue.png')} />}
                      </View>
                    </View>}

                    {item.type === ActionTypes.ifttt && <View style={transactionsStyle.iftttTask}>
                      <Text style={transactionsStyle.iftttTitle}>{item.assetInfo.propertyName}</Text>
                      <Text style={transactionsStyle.iftttDescription}>Sign your bitmark issuance for your IFTTT data.</Text>
                    </View>}

                    {item.type === ActionTypes.test_write_down_recovery_phase && <View style={transactionsStyle.donationTask}>
                      <Text style={transactionsStyle.donationTaskTitle}>Write Down Your Recovery Phrase</Text>
                      <View style={transactionsStyle.donationTaskDescriptionArea}>
                        <Text style={transactionsStyle.donationTaskDescription}>Protect your Bitmark account.</Text>
                        <Image style={transactionsStyle.donationTaskImportantIcon} source={require('./../../../../assets/imgs/alert.png')} />
                      </View>
                    </View>}
                  </TouchableOpacity>)
                }} />
            </View>}
            {(this.state.gettingData || this.state.appLoadingData || (this.state.lengthDisplayActionRequired < this.state.totalActionRequired)) &&
              <View style={transactionsStyle.contentSubTab}>
                <ActivityIndicator size="large" style={{ marginTop: 46, }} />
              </View>
            }
          </TouchableOpacity>
        </ScrollView>}
        {this.state.subTab === SubTabs.required && this.state.actionRequired && this.state.actionRequired.length > 0
          && (this.state.actionRequired.findIndex(item => item.type === ActionTypes.transfer) >= 0) && <TouchableOpacity style={transactionsStyle.acceptAllTransfersButton} onPress={this.acceptAllTransfers} >
            <Text style={transactionsStyle.acceptAllTransfersButtonText}>SIGN FOR ALL BITMARKS SENT TO YOU</Text>
          </TouchableOpacity>
        }

        {this.state.subTab === SubTabs.completed && <ScrollView style={[transactionsStyle.scrollSubTabArea]}
          onScroll={async (scrollEvent) => {
            if (this.loadingCompletedWhenScroll) {
              return;
            }
            if (scrollEvent.nativeEvent.contentOffset.y >= (scrollEvent.nativeEvent.contentSize.height - currentSize.height) && (this.state.lengthDisplayCompleted < this.state.totalCompleted)) {
              this.loadingCompletedWhenScroll = true;
              let lengthDisplayCompleted = Math.min(this.state.totalActionRequired, this.state.lengthDisplayCompleted + 20);
              let { completed } = await DataProcessor.doGetTransactionScreenHistories(lengthDisplayCompleted);
              this.setState({ lengthDisplayCompleted: completed.length, completed });
            }
            this.loadingCompletedWhenScroll = false;
          }}
          scrollEventThrottle={1}
        >
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            {this.state.completed && this.state.completed.length === 0 && !this.state.appLoadingData && <View style={transactionsStyle.contentSubTab}>
              <Text style={transactionsStyle.titleNoRequiredTransferOffer}>NO TRANSACTION HISTORY.</Text>
              <Text style={transactionsStyle.messageNoRequiredTransferOffer}>Your transaction history will be available here.</Text>
            </View>}
            {this.state.completed && this.state.completed.length > 0 && <View style={transactionsStyle.contentSubTab}>
              <FlatList data={this.state.completed}
                extraData={this.state}
                renderItem={({ item }) => {
                  return (
                    <TouchableOpacity style={transactionsStyle.completedTransfer} onPress={() => this.clickToCompleted(item)} disabled={(item.status === 'pending' || item.status === 'waiting')}>
                      <View style={transactionsStyle.completedTransferHeader}>
                        <Text style={[transactionsStyle.completedTransferHeaderTitle, {
                          color: (item.status === 'pending' || item.status === 'waiting')
                            ? '#999999' : (
                              (item.status === 'canceled' || item.status === 'rejected') ? '#FF003C' : '#0060F2'
                            ),
                          width: (item.status === 'waiting' || item.status === 'canceled' || item.status === 'rejected')
                            ? 'auto' : convertWidth(102)
                        }]}>{item.title}</Text>
                        {(item.status !== 'waiting' && item.status !== 'rejected' && item.status !== 'canceled') &&
                          <Text style={[transactionsStyle.completedTransferHeaderValue, {
                            color: (item.status === 'pending' || item.status === 'waiting') ? '#999999' : '#0060F2'
                          }]}>{item.status === 'pending' ? 'PENDING...' : moment(item.timestamp).format('YYYY MMM DD HH:mm:ss').toUpperCase()}</Text>
                        }
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
            {(this.state.gettingData || this.state.appLoadingData || (this.state.lengthDisplayCompleted < this.state.totalCompleted)) &&
              <View style={transactionsStyle.contentSubTab}>
                <ActivityIndicator size="large" style={{ marginTop: 46, }} />
              </View>
            }
          </TouchableOpacity>
        </ScrollView>}
      </View >
    );
  }
}

TransactionsComponent.propTypes = {
  subTab: PropTypes.string,
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