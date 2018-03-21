import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Text,
} from 'react-native';

import { ActiveDonationComponent } from './active-donation';

import { StudiesComponent } from './studies/studies.component';
import { } from './tasks/task.component';

import donationStyle from './donation.component.style';
import { DataController } from '../../../managers';

const SubTabs = {
  studies: 'STUDIES',
  tasks: 'TASKS',
};

export class DonationComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      donationInformation: DataController.getDonationInformation(),
      subTab: SubTabs.studies,
    };
  }

  switchSubtab(subTab) {
    this.setState({ subTab });
  }

  render() {
    if (!this.state.donationInformation.createAt) {
      return (<View style={donationStyle.body}>
        <View style={donationStyle.inActiveContent}><ActiveDonationComponent /></View>
      </View>);
    }
    return (<View style={donationStyle.body}>
      <View style={donationStyle.activedContent}>
        <View style={donationStyle.subTabArea}>
          <TouchableOpacity style={donationStyle.subTabButton} onPress={() => this.switchSubtab(SubTabs.studies)}>
            <Text style={[donationStyle.subTabButtonText, { color: this.state.subTab === SubTabs.studies ? '#0060F2' : '#C1C1C1' }]}>{SubTabs.studies.toUpperCase()}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={donationStyle.subTabButton} onPress={() => this.switchSubtab(SubTabs.tasks)}>
            <Text style={[donationStyle.subTabButtonText, { color: this.state.subTab === SubTabs.tasks ? '#0060F2' : '#C1C1C1' }]}>{SubTabs.tasks.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {this.state.subTab === SubTabs.studies && <StudiesComponent screenProps={{
          homeNavigation: this.props.screenProps.homeNavigation,
        }} />}
        {/* {this.state.subTab === SubTabs.tasks && <TransactionsComponent screenProps={{
          homeNavigation: this.props.screenProps.homeNavigation,
        }} />} */}
      </View>
    </View>);
  }
}

DonationComponent.propTypes = {
  screenProps: PropTypes.shape({
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
  }),

}