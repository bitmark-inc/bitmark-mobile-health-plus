import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Text, ScrollView, FlatList,
  Alert,
} from 'react-native';
import Mailer from 'react-native-mail';

// import { InactiveDonationComponent } from './active-donation';
import { StudyCardComponent } from './study-card/study-card.component';

import donationStyle from './donation.component.style';
import { DataController } from '../../../managers';
import { EventEmiterService } from '../../../services';
import defaultStyle from './../../../commons/styles';

const SubTabs = {
  joined: 'JOINED',
  other: 'BROWSE',
};

export class DonationComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);
    this.contactBitmark = this.contactBitmark.bind(this);

    let subTab = (this.props.screenProps.subTab && (this.props.screenProps.subTab === SubTabs.other || this.props.screenProps.subTab === SubTabs.joined)) ? this.props.screenProps.subTab : SubTabs.other;
    let studies = subTab === SubTabs.other ? DataController.getDonationInformation().otherStudies : DataController.getDonationInformation().joinedStudies;
    studies.forEach(study => {
      study.key = study.studyId
    });
    this.state = {
      donationInformation: DataController.getDonationInformation(),
      subTab,
      studies,
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
    let studies = subTab === SubTabs.other ? DataController.getDonationInformation().otherStudies : DataController.getDonationInformation().joinedStudies;
    studies.forEach(study => {
      study.key = study.studyId
    });
    this.setState({ subTab, studies, donationInformation: DataController.getDonationInformation() });
  }
  contactBitmark() {
    Mailer.mail({ recipients: ['support@bitmark.com'], }, (error) => {
      if (error) {
        Alert.alert('Error', 'Could not send mail. Please send a mail to support@bitmark.com');
      }
    });
  }

  render() {
    return (
      <View style={donationStyle.body}>
        <View style={donationStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft}></TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>STUDIES</Text>
          <TouchableOpacity style={defaultStyle.headerRight}></TouchableOpacity>
        </View>

        <View style={donationStyle.subTabArea}>
          {this.state.subTab === SubTabs.other && <TouchableOpacity style={[donationStyle.subTabButton, {
            shadowOffset: { width: 2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={donationStyle.subTabButtonArea}>
              <View style={[donationStyle.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={donationStyle.subTabButtonTextArea}>
                <Text style={donationStyle.subTabButtonText}>{SubTabs.other.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.other && <TouchableOpacity style={[donationStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubtab(SubTabs.other)}>
            <View style={donationStyle.subTabButtonArea}>
              <View style={[donationStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={donationStyle.subTabButtonTextArea}>
                <Text style={[donationStyle.subTabButtonText, { color: '#C1C1C1' }]}>{SubTabs.other.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}

          {this.state.subTab === SubTabs.joined && <TouchableOpacity style={[donationStyle.subTabButton, {
            shadowOffset: { width: -2 },
            shadowOpacity: 0.15,
          }]}>
            <View style={donationStyle.subTabButtonArea}>
              <View style={[donationStyle.activeSubTabBar, { backgroundColor: '#0060F2' }]}></View>
              <View style={donationStyle.subTabButtonTextArea}>
                <Text style={donationStyle.subTabButtonText}>{SubTabs.joined.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.joined && <TouchableOpacity style={[donationStyle.subTabButton, {
            backgroundColor: '#F5F5F5',
            zIndex: 0,
          }]} onPress={() => this.switchSubtab(SubTabs.joined)}>
            <View style={donationStyle.subTabButtonArea}>
              <View style={[donationStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={donationStyle.subTabButtonTextArea}>
                <Text style={[donationStyle.subTabButtonText, { color: '#C1C1C1' }]}>{SubTabs.joined.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
        </View>

        <ScrollView style={donationStyle.contentScroll}>
          {this.state.studies.length > 0 && <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            <View style={donationStyle.content}>
              <FlatList
                extraData={this.state}
                data={this.state.studies}
                renderItem={({ item }) => {
                  return (<TouchableOpacity style={donationStyle.studyCard} onPress={() => this.props.screenProps.homeNavigation.navigate('StudyDetail', { study: item })}>
                    <StudyCardComponent
                      title={item.title}
                      joined={!!item.joinedDate}
                      description={item.description}
                      interval={item.interval}
                      duration={item.duration || item.durationText} />
                  </TouchableOpacity>)
                }}
              />
            </View>
          </TouchableOpacity>}
          {this.state.subTab === SubTabs.other && <View style={donationStyle.content}>
            {this.state.studies.length === 0 && <Text style={donationStyle.noCardTitle}>YOU’VE JOINED ALL THE STUDIES!</Text>}
            <View style={donationStyle.noCardMessageArea}>
              <View style={donationStyle.contactMessageFirstLine}>
                <TouchableOpacity onPress={this.contactBitmark}>
                  <Text style={donationStyle.contactButtonText}>Contact Bitmark</Text>
                </TouchableOpacity>
                <Text style={donationStyle.noCardMessage}> if you would like to publish</Text>
              </View>
              <Text style={donationStyle.noCardMessage}>a study.</Text>
            </View>
          </View>}

          {this.state.studies.length === 0 && this.state.subTab === SubTabs.joined && <View style={donationStyle.content}>
            <Text style={donationStyle.noCardTitle}>HAVEN’T JOINED ANY STUDIES?</Text>
            <Text style={donationStyle.noCardMessageArea}>
              <Text style={donationStyle.noCardMessage}>Browse studies to find where you can donate your data.</Text>
            </Text>
          </View>}
        </ScrollView>
      </View>
    );
  }
}

DonationComponent.propTypes = {
  screenProps: PropTypes.shape({
    subTab: PropTypes.string,
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
  }),

}