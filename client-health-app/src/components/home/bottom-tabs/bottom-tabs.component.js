import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Image, Text,
} from 'react-native';
// import { NavigationActions } from 'react-navigation';

import userStyle from './bottom-tabs.component.style';
import { EventEmitterService, NotificationService } from '../../../services';
import { DataProcessor } from '../../../processors';

const MainTabs = {
  Timeline: 'Timeline',
  Donate: 'Donate',
};
let ComponentName = 'BottomTabsComponent';
export class BottomTabsComponent extends React.Component {
  static MainTabs = MainTabs;

  constructor(props) {
    super(props);
    this.handerChangeActiveIncomingTransferOffer = this.handerChangeActiveIncomingTransferOffer.bind(this);
    this.handerChangeLocalBitmarks = this.handerChangeLocalBitmarks.bind(this);
    this.handleChangeMainTab = this.handleChangeMainTab.bind(this);
    this.switchMainTab = this.switchMainTab.bind(this);

    EventEmitterService.remove(EventEmitterService.events.CHANGE_TRANSACTION_SCREEN_ACTION_REQUIRED_DATA, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_MAIN_TAB, null, ComponentName);


    this.state = {
      existNewAsset: false,
      totalTasks: 0,
      componentMounting: 0,
      mainTab: props.mainTab,
    };

    const doGetScreenData = async () => {
      NotificationService.setApplicationIconBadgeNumber(0);
    }
    doGetScreenData();
  }

  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.CHANGE_TRANSACTION_SCREEN_ACTION_REQUIRED_DATA, this.handerChangeActiveIncomingTransferOffer, ComponentName);
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_LOCAL_BITMARKS, this.handerChangeLocalBitmarks, ComponentName);
    EventEmitterService.on(EventEmitterService.events.CHANGE_MAIN_TAB, this.handleChangeMainTab, ComponentName);
  }

  handerChangeActiveIncomingTransferOffer() {
    DataProcessor.doGetTransactionScreenActionRequired(1).then(({ totalTasks }) => {
      this.setState({ totalTasks });
      NotificationService.setApplicationIconBadgeNumber(totalTasks || 0);
    }).catch(error => {
      console.log('doGetTransactionScreenActionRequired error:', error);
    });
  }

  handerChangeLocalBitmarks() {
    DataProcessor.doGetLocalBitmarks(1).then(({ existNewAsset }) => {
      this.setState({ existNewAsset });
    }).catch(error => {
      console.log('doGetLocalBitmarks error:', error);
    });
  }
  handleChangeMainTab(mainTab) {
    this.setState({ mainTab });
  }

  switchMainTab(mainTab) {
    if (mainTab === this.state.mainTab) {
      return;
    }
    this.props.switchMainTab(mainTab);
    this.setState({ mainTab });
    // const resetHomePage = NavigationActions.reset({
    //   index: 0,
    //   actions: [
    //     NavigationActions.navigate({
    //       routeName: 'User', params: {
    //         displayedTab: { mainTab }
    //       }
    //     }),
    //   ]
    // });
    // this.props.homeNavigation.dispatch(resetHomePage);
  }

  render() {
    return (
      <View style={userStyle.bottomTabArea}>
        <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.switchMainTab(MainTabs.Timeline)}>
          {(this.state.existNewAsset || this.state.existNewTracking) && <View style={userStyle.haveNewBitmark} />}
          <Image style={userStyle.bottomTabButtonIcon} source={this.state.mainTab === MainTabs.Timeline
            ? require('./../../../../assets/imgs/timeline-icon-enable.png')
            : require('./../../../../assets/imgs/timeline-icon-disable.png')} />
          <Text style={[userStyle.bottomTabButtonText, {
            color: this.state.mainTab === MainTabs.Timeline ? '#0060F2' : '#A4B5CD'
          }]}>{MainTabs.Timeline}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.switchMainTab(MainTabs.Donate)}>
          {this.state.totalTasks > 0 && <View style={userStyle.transactionNumber}>
            <Text style={userStyle.transactionNumberText}>{this.state.totalTasks < 100 ? this.state.totalTasks : 99}</Text>
          </View>}
          <Image style={userStyle.bottomTabButtonIcon} source={this.state.mainTab === MainTabs.Donate
            ? require('./../../../../assets/imgs/donate-icon-enable.png')
            : require('./../../../../assets/imgs/donate-icon-disable.png')} />
          <Text style={[userStyle.bottomTabButtonText, {
            color: this.state.mainTab === MainTabs.Donate ? '#0060F2' : '#A4B5CD'
          }]}>{MainTabs.Donate}</Text>
        </TouchableOpacity>

      </View>
    );
  }
}

BottomTabsComponent.propTypes = {
  mainTab: PropTypes.string,
  switchMainTab: PropTypes.func,
  homeNavigation: PropTypes.shape({
    dispatch: PropTypes.func,
  }),
}