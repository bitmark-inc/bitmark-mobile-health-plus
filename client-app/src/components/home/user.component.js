import React from 'react';
import PropTypes from 'prop-types';
import {
  View
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import { AccountComponent } from './account';
import { PropertiesComponent } from './properties';
import { TransactionsComponent } from './transactions';
import { DonationComponent } from './donation';


import { BottomTabsComponent } from './bottom-tabs/bottom-tabs.component';
import { AppController, DataController } from '../../managers';
import { EventEmiterService } from '../../services';
import { DonationService } from '../../services/donation-service';
import { FullComponent } from '../../commons/components';

const MainTabs = BottomTabsComponent.MainTabs;

export class UserComponent extends React.Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
    this.reloadUserData = this.reloadUserData.bind(this);
    this.switchMainTab = this.switchMainTab.bind(this);
    this.handerReceivedNotification = this.handerReceivedNotification.bind(this);

    let subTab;
    let mainTab = MainTabs.properties;
    let needReloadData;
    if (this.props.navigation.state && this.props.navigation.state.params) {
      needReloadData = this.props.navigation.state.params.needReloadData;
      if (this.props.navigation.state.params.displayedTab) {
        mainTab = this.props.navigation.state.params.displayedTab.mainTab;
        if (mainTab !== MainTabs.properties && mainTab !== MainTabs.transaction && mainTab !== MainTabs.account && mainTab !== MainTabs.donation) {
          mainTab = MainTabs.properties;
        }
        subTab = this.props.navigation.state.params.displayedTab.subTab;
      }
    }
    this.state = {
      displayedTab: {
        mainTab,
        subTab,
      },
    };
    this.needReloadData = needReloadData;
  }

  componentDidMount() {
    EventEmiterService.on(EventEmiterService.events.APP_RECEIVED_NOTIFICATION, this.handerReceivedNotification);
    EventEmiterService.on(EventEmiterService.events.NEED_RELOAD_USER_DATA, this.reloadUserData);
  }

  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.APP_RECEIVED_NOTIFICATION, this.handerReceivedNotification);
    EventEmiterService.remove(EventEmiterService.events.NEED_RELOAD_USER_DATA, this.reloadUserData);
  }

  reloadUserData() {
    AppController.doReloadUserData();
  }

  switchMainTab(mainTab) {
    let displayedTab = { mainTab, subTab: null };
    this.setState({ displayedTab });
  }

  handerReceivedNotification(data) {
    console.log('UserComponent handerReceivedNotification data :', data);
    if (data.event === 'transfer_request' && data.bitmark_id) {
      AppController.doReloadUserData().then(() => {
        return AppController.doGetTransferOfferDetail(data.bitmark_id);
      }).then(transferOfferDetail => {
        const resetHomePage = NavigationActions.reset({
          index: 1,
          actions: [
            NavigationActions.navigate({
              routeName: 'User', params: {
                displayedTab: { mainTab: MainTabs.transaction, subTab: 'ACTION REQUIRED' },
              }
            }),
            NavigationActions.navigate({
              routeName: 'TransactionDetail',
              params: { transferOffer: transferOfferDetail, }
            }),
          ]
        });
        this.props.navigation.dispatch(resetHomePage);
      }).catch(error => {
        console.log('handerReceivedNotification transfer_required error :', error);
      });
    } else if (data.event === 'transfer_rejected') {
      AppController.doReloadUserData().then(() => {
        let bitmarkInformation = DataController.getLocalBitmarkInformation(data.bitmark_id);
        const resetHomePage = NavigationActions.reset({
          index: 1,
          actions: [
            NavigationActions.navigate({
              routeName: 'User', params: { displayedTab: { mainTab: MainTabs.properties }, }
            }),
            NavigationActions.navigate({
              routeName: 'LocalPropertyDetail',
              params: { asset: bitmarkInformation.asset, bitmark: bitmarkInformation.bitmark }
            }),
          ]
        });
        this.props.navigation.dispatch(resetHomePage);
      }).catch(error => {
        console.log('handerReceivedNotification transfer_rejected error :', error);
      });
    } else if (data.event === 'transfer_completed' || data.event === 'transfer_accepted') {
      AppController.doReloadUserData().then(() => {
        const resetHomePage = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: 'User', params: {
                displayedTab: { mainTab: MainTabs.transaction, subTab: 'HISTORY' },
                needReloadData: true,
              }
            }),
          ]
        });
        this.props.navigation.dispatch(resetHomePage);
      }).catch((error) => {
        console.log('log out error :', error);
      });
    } else if (data.event === 'transfer_failed') {
      AppController.doReloadUserData().then(() => {
        let bitmarkInformation = DataController.getLocalBitmarkInformation(data.bitmark_id);
        const resetHomePage = NavigationActions.reset({
          index: 1,
          actions: [
            NavigationActions.navigate({
              routeName: 'User', params: { displayedTab: { mainTab: MainTabs.properties }, }
            }),
            NavigationActions.navigate({
              routeName: 'LocalPropertyDetail',
              params: { asset: bitmarkInformation.asset, bitmark: bitmarkInformation.bitmark }
            }),
          ]
        });
        this.props.navigation.dispatch(resetHomePage);
      }).catch(error => {
        console.log('handerReceivedNotification transfer_rejected error :', error);
      });
    } else if (data.event === 'DONATE_DATA' && data.studyData && data.studyData.studyId && data.studyData.taskType) {
      AppController.doReloadUserData().then(() => {

        let donationInformation = DataController.getDonationInformation();
        let studyTask = (donationInformation.todoTasks || []).find(task => (task.study && task.study.studyId === data.studyData.studyId && task.taskType === data.studyData.taskType));
        if (studyTask && studyTask.taskType === studyTask.study.taskIds.donations) {
          const resetHomePage = NavigationActions.reset({
            index: 1,
            actions: [
              NavigationActions.navigate({
                routeName: 'User', params: {
                  displayedTab: { mainTab: MainTabs.transaction, subTab: 'ACTION REQUIRED' },
                  needReloadData: true,
                }
              }),
              NavigationActions.navigate({
                routeName: 'StudyDonation', params: {
                  study: studyTask.study,
                  list: studyTask.list,
                }
              }),
            ]
          });
          this.props.navigation.dispatch(resetHomePage);
        } else if (studyTask) {
          const resetHomePage = NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: 'User', params: {
                  displayedTab: { mainTab: MainTabs.transaction, subTab: 'ACTION REQUIRED' },
                  needReloadData: true,
                }
              }),
            ]
          });
          this.props.navigation.dispatch(resetHomePage);
        }
      }).catch(error => {
        console.log('handerReceivedNotification BITMARK_DATA error :', error);
      });
    } else if (data.event === 'STUDY_DETAIL') {
      AppController.doReloadUserData().then(() => {
        let donationInformation = DataController.getDonationInformation();
        let study = DonationService.getStudy(donationInformation, data.studyId);
        if (study) {
          const resetHomePage = NavigationActions.reset({
            index: 1,
            actions: [
              NavigationActions.navigate({
                routeName: 'User', params: { displayedTab: { mainTab: MainTabs.donation, subTab: 'BROWSER' } }
              }),
              NavigationActions.navigate({
                routeName: 'StudyDetail', params: { study }
              }),
            ]
          });
          this.props.navigation.dispatch(resetHomePage);
        }
      }).catch(error => {
        console.log('handerReceivedNotification STUDY_DETAIL error :', error);
      });
    } else if (data.event === 'BITMARK_DATA') {
      AppController.doReloadUserData().then(() => {
        let donationInformation = DataController.getDonationInformation();
        let bitmarkHealthDataTask = (donationInformation.todoTasks || []).find(task => task.taskType === donationInformation.commonTaskIds.bitmark_health_data);
        if (bitmarkHealthDataTask && bitmarkHealthDataTask.list && bitmarkHealthDataTask.list.length > 0) {
          const resetHomePage = NavigationActions.reset({
            index: 1,
            actions: [
              NavigationActions.navigate({
                routeName: 'User', params: {
                  displayedTab: { mainTab: MainTabs.transaction, subTab: 'ACTION REQUIRED' },
                  needReloadData: true,
                }
              }),
              NavigationActions.navigate({
                routeName: 'HealthDataBitmark', params: { list: bitmarkHealthDataTask.list, }
              }),
            ]
          });
          this.props.navigation.dispatch(resetHomePage);
        }
      }).catch(error => {
        console.log('handerReceivedNotification BITMARK_DATA error :', error);
      });
    } else if (data.event === 'DONATION_SUCCESS') {
      AppController.doReloadUserData().then(() => {
        const resetHomePage = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: 'User', params: {
                displayedTab: { mainTab: MainTabs.transaction, subTab: 'HISTORY' },
                needReloadData: true,
              }
            }),
          ]
        });
        this.props.navigation.dispatch(resetHomePage);
      }).catch((error) => {
        console.log('log out error :', error);
      });
    }
  }

  logout() {
    AppController.doLogout().then(() => {
      const resetMainPage = NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'Main' })]
      });
      this.props.screenProps.rootNavigation.dispatch(resetMainPage);
    }).catch((error) => {
      console.log('log out error :', error);
    });
  }

  render() {
    return (
      <FullComponent
        content={(<View style={{ flex: 1 }}>
          {this.state.displayedTab.mainTab === MainTabs.properties && <PropertiesComponent screenProps={{
            homeNavigation: this.props.navigation,
            needReloadData: this.needReloadData,
            donReloadData: () => this.needReloadData = false,
          }} />}
          {this.state.displayedTab.mainTab === MainTabs.transaction && <TransactionsComponent screenProps={{
            homeNavigation: this.props.navigation,
            subTab: this.state.displayedTab.subTab,
            needReloadData: this.needReloadData,
            donReloadData: () => this.needReloadData = false,
          }} />}
          {this.state.displayedTab.mainTab === MainTabs.donation && <DonationComponent screenProps={{
            homeNavigation: this.props.navigation,
            subTab: this.state.displayedTab.subTab,
            needReloadData: this.needReloadData,
            donReloadData: () => this.needReloadData = false,
          }} />}
          {this.state.displayedTab.mainTab === MainTabs.account && <AccountComponent screenProps={{
            homeNavigation: this.props.navigation,
            subTab: this.state.displayedTab.subTab,
            logout: this.logout,
            needReloadData: this.needReloadData,
            donReloadData: () => this.needReloadData = false,
          }} />}
        </View>)}
        footer={(<BottomTabsComponent mainTab={this.state.displayedTab.mainTab} switchMainTab={this.switchMainTab} homeNavigation={this.props.navigation} />)}
      />
    );
  }
}

UserComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    dispatch: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        displayedTab: PropTypes.shape({
          mainTab: PropTypes.string,
          subTab: PropTypes.string,
        }),
        needReloadData: PropTypes.bool,
      }),
    }),
  }),
  screenProps: PropTypes.shape({
    rootNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      dispatch: PropTypes.func,
    })
  }),
}