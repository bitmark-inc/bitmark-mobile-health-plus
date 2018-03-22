import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Text,
} from 'react-native';

import { ActiveDonationComponent } from './active-donation';

import { StudiesComponent } from './studies/studies.component';
import { TasksComponent } from './tasks/task.component';
import { } from './tasks/task.component';

import donationStyle from './donation.component.style';
import { DataController } from '../../../managers';
import { EventEmiterService } from '../../../services';

const SubTabs = {
  studies: 'STUDIES',
  tasks: 'TASKS',
};

export class DonationComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);

    this.state = {
      donationInformation: DataController.getDonationInformation(),
      subTab: (this.props.screenProps.subTab === SubTabs.studies || this.props.screenProps.subTab === SubTabs.tasks) ? this.props.screenProps.subTab : SubTabs.studies,
      subTab2: this.props.screenProps.subTab2,
    };
  }
  // ==========================================================================================
  componentDidMount() {
    EventEmiterService.on(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange);
  }
  componentWillUnmount() {
    EventEmiterService.remove(EventEmiterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange);
  }
  // ==========================================================================================
  handerDonationInformationChange() {
    this.switchSubtab();
  }
  switchSubtab(subTab) {
    subTab = subTab || this.state.subTab;
    this.setState({ subTab, donationInformation: DataController.getDonationInformation() });
  }

  render() {
    if (!this.state.donationInformation.createdAt) {
      return (<View style={donationStyle.body}>
        <View style={donationStyle.inActiveContent}><ActiveDonationComponent screenProps={{ callDirective: true }} /></View >
      </View>);
    }
    return (<View style={donationStyle.body}>
      <View style={donationStyle.activedContent}>
        <View style={donationStyle.subTabArea}>
          <TouchableOpacity style={donationStyle.subTabButton} onPress={() => this.switchSubtab(SubTabs.studies)}>
            <Text style={[donationStyle.subTabButtonText, { color: this.state.subTab === SubTabs.studies ? '#0060F2' : '#C1C1C1' }]}>{SubTabs.studies.toUpperCase()}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={donationStyle.subTabButton} onPress={() => this.switchSubtab(SubTabs.tasks)}>
            {!!this.state.donationInformation.totalTodoTask && <View style={donationStyle.taskIndicator}></View>}
            <Text style={[donationStyle.subTabButtonText, { color: this.state.subTab === SubTabs.tasks ? '#0060F2' : '#C1C1C1' }]}>{SubTabs.tasks.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {this.state.subTab === SubTabs.studies && <StudiesComponent screenProps={{
          homeNavigation: this.props.screenProps.homeNavigation,
          type: this.state.subTab2,
        }} />}
        {this.state.subTab === SubTabs.tasks && <TasksComponent screenProps={{
          homeNavigation: this.props.screenProps.homeNavigation,
        }} />}
      </View>
    </View>);
  }
}

DonationComponent.propTypes = {
  screenProps: PropTypes.shape({
    subTab: PropTypes.string,
    subTab2: PropTypes.string,
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
  }),

}