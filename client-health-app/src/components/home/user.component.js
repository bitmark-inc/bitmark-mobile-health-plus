import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Text, Image,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import defaultStyle from './../../commons/styles';
import userStyle from './user.component.style';

import { BottomTabsComponent } from './bottom-tabs/bottom-tabs.component';
import { AppProcessor } from '../../processors';
import { EventEmitterService } from '../../services';
import { DonationService } from '../../services/donation-service';
import { BitmarkComponent } from '../../commons/components';
import { DonationComponent } from './donation';

const MainTabs = BottomTabsComponent.MainTabs;

let ComponentName = 'UserComponent';
export class UserComponent extends React.Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
    this.reloadUserData = this.reloadUserData.bind(this);
    this.switchMainTab = this.switchMainTab.bind(this);
    this.handerReceivedNotification = this.handerReceivedNotification.bind(this);
    this.refreshComponent = this.refreshComponent.bind(this);

    EventEmitterService.remove(EventEmitterService.events.APP_RECEIVED_NOTIFICATION, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.NEED_RELOAD_USER_DATA, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.NEED_REFRESH_USER_COMPONENT_STATE, null, ComponentName);

    let subTab;
    let mainTab = MainTabs.Timeline;
    let needReloadData;
    if (this.props.navigation.state && this.props.navigation.state.params) {
      needReloadData = this.props.navigation.state.params.needReloadData;
      if (this.props.navigation.state.params.displayedTab) {
        mainTab = this.props.navigation.state.params.displayedTab.mainTab;
        if (mainTab !== MainTabs.Timeline && mainTab !== MainTabs.Donate) {
          mainTab = MainTabs.Timeline;
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
    EventEmitterService.on(EventEmitterService.events.APP_RECEIVED_NOTIFICATION, this.handerReceivedNotification, ComponentName);
    EventEmitterService.on(EventEmitterService.events.NEED_RELOAD_USER_DATA, this.reloadUserData, ComponentName);
    EventEmitterService.on(EventEmitterService.events.NEED_REFRESH_USER_COMPONENT_STATE, this.refreshComponent, ComponentName);
  }

  refreshComponent(newState) {
    this.setState(newState);
    if (newState.changeMainTab) {
      EventEmitterService.emit(EventEmitterService.events.CHANGE_MAIN_TAB, newState.changeMainTab.mainTab);
    }
  }

  reloadUserData() {
    AppProcessor.doReloadUserData();
  }

  switchMainTab(mainTab) {
    let displayedTab = { mainTab, subTab: null };
    this.setState({ displayedTab });
  }

  handerReceivedNotification(data) {
    console.log('UserComponent handerReceivedNotification data :', data);
    if (data.event === 'DONATE_DATA' && data.studyData && data.studyData.studyId && data.studyData.taskType) {
      if (data.studyData.taskType === 'donations') {
        AppProcessor.doReloadDonationInformation().then((donationInformation) => {
          let studyTask = (donationInformation.todoTasks || []).find(task => (task.study && task.study.studyId === data.studyData.studyId && task.taskType === data.studyData.taskType));
          if (studyTask && studyTask.taskType === studyTask.study.taskIds.donations) {
            // const resetHomePage = NavigationActions.reset({
            //   index: 1,
            //   actions: [
            //     NavigationActions.navigate({
            //       routeName: 'User', params: {
            //         displayedTab: { mainTab: MainTabs.transaction, subTab: 'ACTIONS REQUIRED' },
            //         needReloadData: true,
            //       }
            //     }),
            //     NavigationActions.navigate({
            //       routeName: 'StudyDonation', params: {
            //         study: studyTask.study,
            //         list: studyTask.list,
            //       }
            //     }),
            //   ]
            // });
            // this.props.navigation.dispatch(resetHomePage);
          }
        }).catch(error => {
          console.log('handerReceivedNotification BITMARK_DATA error :', error);
        });
      } else {
        // const resetHomePage = NavigationActions.reset({
        //   index: 0,
        //   actions: [
        //     NavigationActions.navigate({
        //       routeName: 'User', params: {
        //         displayedTab: { mainTab: MainTabs.transaction, subTab: 'ACTIONS REQUIRED' },
        //         needReloadData: true,
        //       }
        //     }),
        //   ]
        // });
        // this.props.navigation.dispatch(resetHomePage);
      }
    } else if (data.event === 'STUDY_DETAIL') {
      AppProcessor.doReloadDonationInformation().then((donationInformation) => {
        let study = DonationService.getStudy(donationInformation, data.studyId);
        if (study) {
          // const resetHomePage = NavigationActions.reset({
          //   index: 1,
          //   actions: [
          //     NavigationActions.navigate({
          //       routeName: 'User', params: { displayedTab: { mainTab: MainTabs.donation, subTab: 'BROWSER' } }
          //     }),
          //     NavigationActions.navigate({
          //       routeName: 'StudyDetail', params: { study }
          //     }),
          //   ]
          // });
          // this.props.navigation.dispatch(resetHomePage);
        }
      }).catch(error => {
        console.log('handerReceivedNotification STUDY_DETAIL error :', error);
      });
    } else if (data.event === 'BITMARK_DATA') {
      AppProcessor.doReloadDonationInformation().then((donationInformation) => {
        let bitmarkHealthDataTask = (donationInformation.todoTasks || []).find(task => task.taskType === donationInformation.commonTaskIds.bitmark_health_data);
        if (bitmarkHealthDataTask && bitmarkHealthDataTask.list && bitmarkHealthDataTask.list.length > 0) {
          // const resetHomePage = NavigationActions.reset({
          //   index: 1,
          //   actions: [
          //     NavigationActions.navigate({
          //       routeName: 'User', params: {
          //         displayedTab: { mainTab: MainTabs.transaction, subTab: 'ACTIONS REQUIRED' },
          //         needReloadData: true,
          //       }
          //     }),
          //     NavigationActions.navigate({
          //       routeName: 'HealthDataBitmark', params: { list: bitmarkHealthDataTask.list, }
          //     }),
          //   ]
          // });
          // this.props.navigation.dispatch(resetHomePage);
        }
      }).catch(error => {
        console.log('handerReceivedNotification BITMARK_DATA error :', error);
      });
    } else if (data.event === 'DONATION_SUCCESS') {
      // const resetHomePage = NavigationActions.reset({
      //   index: 0,
      //   actions: [
      //     NavigationActions.navigate({
      //       routeName: 'User', params: {
      //         displayedTab: { mainTab: MainTabs.transaction, subTab: 'HISTORY' },
      //         needReloadData: true,
      //       }
      //     }),
      //   ]
      // });
      // this.props.navigation.dispatch(resetHomePage);
    }
  }

  logout() {
    AppProcessor.doLogout().then(() => {
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
      <BitmarkComponent
        backgroundColor={'#EDF0F4'}
        header={(
          <View style={defaultStyle.header}>
            <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.navigate('Account')}>
              <Image style={userStyle.accountIcon} source={require('./../../../assets/imgs/account-icon.png')} />
            </TouchableOpacity>
            <Text style={defaultStyle.headerTitle}>BITMARK HEALTH</Text>
            <TouchableOpacity style={defaultStyle.headerRight} />
          </View>

        )}
        content={(<View style={{ flex: 1 }}>
          {this.state.displayedTab.mainTab === MainTabs.Donate && <DonationComponent screenProps={{
            homeNavigation: this.props.navigation,
            subTab: this.state.displayedTab.subTab,
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