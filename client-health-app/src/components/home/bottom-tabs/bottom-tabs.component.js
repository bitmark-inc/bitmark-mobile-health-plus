import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Image, Text,
} from 'react-native';
// import { NavigationActions } from 'react-navigation';

import userStyle from './bottom-tabs.component.style';
import { EventEmitterService, NotificationService } from '../../../services';
import styles from '../../../commons/styles';
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
    this.handerChangeDonationTasks = this.handerChangeDonationTasks.bind(this);
    this.handerChangeTimelines = this.handerChangeTimelines.bind(this);
    this.switchMainTab = this.switchMainTab.bind(this);

    EventEmitterService.remove(EventEmitterService.events.CHANGE_DONATION_TASK, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_TIMELINES, null, ComponentName);

    this.state = {
      existNewAsset: false,
      totalTasks: 0,
      componentMounting: 0,
      mainTab: props.mainTab,
      remainTimelines: 0,
    };

    const doGetScreenData = async () => {
      let { totalTasks } = await DataProcessor.doGetDonationTasks(0);
      let { remainTimelines } = await DataProcessor.doGetTimelines(0);
      this.setState({ totalTasks, remainTimelines });
      NotificationService.setApplicationIconBadgeNumber(0);
    }
    doGetScreenData();
  }

  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.CHANGE_DONATION_TASK, this.handerChangeDonationTasks, ComponentName);
    EventEmitterService.on(EventEmitterService.events.CHANGE_TIMELINES, this.handerChangeTimelines, ComponentName);
  }

  handerChangeDonationTasks({ totalTasks }) {
    this.setState({ totalTasks });
  }

  handerChangeTimelines({ remainTimelines }) {
    this.setState({ remainTimelines });
  }

  switchMainTab(mainTab) {
    if (mainTab === this.state.mainTab) {
      return;
    }
    this.props.switchMainTab(mainTab);
    this.setState({ mainTab });
  }

  render() {
    return (
      <View style={userStyle.bottomTabArea}>
        <TouchableOpacity style={userStyle.bottomTabButton} onPress={() => this.switchMainTab(MainTabs.Timeline)}>
          {this.state.remainTimelines > 0 && <View style={userStyle.haveNewBitmark} >
            <Text style={userStyle.totalTasksIndicatorText}>{this.state.remainTimelines > 99 ? 99 : this.state.remainTimelines}</Text>
          </View>}
          <Image style={userStyle.bottomTabButtonIcon} source={this.state.mainTab === MainTabs.Timeline
            ? require('./../../../../assets/imgs/timeline-icon-enable.png')
            : require('./../../../../assets/imgs/timeline-icon-disable.png')} />
          <Text style={[userStyle.bottomTabButtonText, {
            color: this.state.mainTab === MainTabs.Timeline ? '#0060F2' : '#A4B5CD'
          }]}>{MainTabs.Timeline}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[userStyle.bottomTabButton, { marginLeft: 70 }]} onPress={() => this.switchMainTab(MainTabs.Donate)}>
          {this.state.totalTasks > 0 && <View style={userStyle.totalTasksIndicator}>
            <Text style={userStyle.totalTasksIndicatorText}>{this.state.totalTasks > 99 ? 99 : this.state.totalTasks}</Text>
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