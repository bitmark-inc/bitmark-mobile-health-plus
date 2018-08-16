import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Text, Image,
} from 'react-native';
import Intercom from 'react-native-intercom';

import { NavigationActions } from 'react-navigation';
import defaultStyle from './../../commons/styles';
import userStyle from './user.component.style';

import { BottomTabsComponent } from './bottom-tabs/bottom-tabs.component';
import { AppProcessor, DataProcessor } from '../../processors';
import { EventEmitterService } from '../../services';
import { DonationService } from '../../services/donation-service';
import { BitmarkComponent } from '../../commons/components';
import { DonationComponent } from './donation';
import { TimelineComponent } from './timeline';
import { CommonModel } from '../../models';
import { convertWidth } from '../../utils';

const MainTabs = BottomTabsComponent.MainTabs;

let ComponentName = 'UserComponent';
export class UserComponent extends React.Component {
  constructor(props) {
    super(props);
    this.switchMainTab = this.switchMainTab.bind(this);
    this.handerReceivedNotification = this.handerReceivedNotification.bind(this);

    EventEmitterService.remove(EventEmitterService.events.APP_RECEIVED_NOTIFICATION, null, ComponentName);

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
  }

  switchMainTab(mainTab) {
    let displayedTab = { mainTab, subTab: null };
    this.setState({ displayedTab });
  }

  handerReceivedNotification(data) {
    console.log('UserComponent handerReceivedNotification data :', data);
    if (data.event === 'DONATE_DATA' && data.studyData && data.studyData.studyId && data.studyData.taskType) {
      if (data.studyData.taskType === 'donations') {
        AppProcessor.doReloadUserData().then((donationInformation) => {
          let studyTask = (donationInformation.todoTasks || []).find(task => (task.study && task.study.studyId === data.studyData.studyId && task.taskType === data.studyData.taskType));
          if (studyTask && studyTask.taskType === studyTask.study.taskIds.donations) {
            const resetHomePage = NavigationActions.reset({
              index: 1,
              actions: [
                NavigationActions.navigate({
                  routeName: 'User', params: {
                    displayedTab: { mainTab: MainTabs.Donate, subTab: 'To-do' },
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
          }
        }).catch(error => {
          console.log('handerReceivedNotification BITMARK_DATA error :', error);
        });
      } else {
        const resetHomePage = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: 'User', params: {
                displayedTab: { mainTab: MainTabs.Donate, subTab: 'To-do' },
                needReloadData: true,
              }
            }),
          ]
        });
        this.props.navigation.dispatch(resetHomePage);
      }
    } else if (data.event === 'STUDY_DETAIL') {
      AppProcessor.doReloadUserData().then((donationInformation) => {
        let study = DonationService.getStudy(donationInformation, data.studyId);
        if (study) {
          const resetHomePage = NavigationActions.reset({
            index: 1,
            actions: [
              NavigationActions.navigate({
                routeName: 'User', params: { displayedTab: { mainTab: MainTabs.Donate, subTab: 'Studies' } }
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
      AppProcessor.doReloadUserData().then(() => {
        const resetHomePage = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: 'User', params: { displayedTab: { mainTab: MainTabs.Timeline } }
            }),
          ]
        });
        this.props.navigation.dispatch(resetHomePage);
      }).catch(error => {
        console.log('handerReceivedNotification BITMARK_DATA error :', error);
      });
    } else if (data.event === 'DONATION_SUCCESS') {
      const resetHomePage = NavigationActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({
            routeName: 'User', params: { displayedTab: { mainTab: MainTabs.Donate, subTab: 'Studies' } }
          }),
        ]
      });
      this.props.navigation.dispatch(resetHomePage);
    }
  }

  render() {
    return (
      <BitmarkComponent
        backgroundColor={'#EDF0F4'}
        header={(
          <View style={[defaultStyle.header, { backgroundColor: '#EDF0F4' }]}>
            <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => {
              CommonModel.doTrackEvent({
                event_name: 'health_user_view_account_screen',
                account_number: DataProcessor.getUserInformation() ? DataProcessor.getUserInformation().bitmarkAccountNumber : null,
              });
              this.props.navigation.navigate('Account');
            }}>
              <Image style={userStyle.accountIcon} source={require('./../../../assets/imgs/account-icon.png')} />
            </TouchableOpacity>
            <Text style={defaultStyle.headerTitle}>BITMARK HEALTH</Text>
            <TouchableOpacity style={defaultStyle.headerRight} onPress={() => {
              Intercom.displayMessageComposer();
            }}>
              <Image style={[userStyle.accountIcon, { width: 26, height: 26, marginRight: convertWidth(19) }]} source={require('./../../../assets/imgs/intercom.png')} />
            </TouchableOpacity>
          </View>

        )}
        content={(<View style={{ flex: 1 }}>
          {this.state.displayedTab.mainTab === MainTabs.Donate && <DonationComponent screenProps={{
            homeNavigation: this.props.navigation,
            subTab: this.state.displayedTab.subTab,
            needReloadData: this.needReloadData,
            donReloadData: () => this.needReloadData = false,
          }} />}

          {this.state.displayedTab.mainTab === MainTabs.Timeline && <TimelineComponent screenProps={{
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