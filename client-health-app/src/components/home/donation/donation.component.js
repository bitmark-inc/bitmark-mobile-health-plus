import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Text, ScrollView, FlatList, ActivityIndicator,
  Alert,
} from 'react-native';
import Mailer from 'react-native-mail';

// import { InactiveDonationComponent } from './active-donation';
import { StudyCardComponent } from './study-card/study-card.component';

import donationStyle from './donation.component.style';
import { DataProcessor, AppProcessor } from '../../../processors';
import { EventEmitterService } from '../../../services';
import defaultStyle from './../../../commons/styles';

const SubTabs = {
  joined: 'JOINED',
  other: 'BROWSE',
};

let ComponentName = 'DonationComponent';
export class DonationComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);
    this.contactBitmark = this.contactBitmark.bind(this);
    this.reloadData = this.reloadData.bind(this);
    this.handerLoadingData = this.handerLoadingData.bind(this);

    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.APP_LOADING_DATA, null, ComponentName);

    let subTab = (this.props.screenProps.subTab && (this.props.screenProps.subTab === SubTabs.other || this.props.screenProps.subTab === SubTabs.joined)) ? this.props.screenProps.subTab : SubTabs.other;

    this.state = {
      donationInformation: null,
      subTab,
      studies: null,
      appLoadingData: DataProcessor.isAppLoadingData(),
      gettingData: true,
    };

    const doGetScreenData = async () => {
      let donationInformation = await DataProcessor.doGetDonationInformation();
      let studies = (subTab === SubTabs.other ? donationInformation.otherStudies : donationInformation.joinedStudies);
      if (studies) {
        studies.forEach(study => {
          study.key = study.studyId
        });
      }
      this.setState({
        donationInformation,
        studies,
        gettingData: false,
      });
    };
    doGetScreenData();
  }
  // ==========================================================================================
  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange, ComponentName);
    EventEmitterService.on(EventEmitterService.events.APP_LOADING_DATA, this.handerLoadingData, ComponentName);
    if (this.props.screenProps.needReloadData) {
      this.reloadData();
      if (this.props.screenProps.doneReloadData) {
        this.props.screenProps.doneReloadData()
      }
    }
  }
  // ==========================================================================================

  handerLoadingData() {
    this.setState({ appLoadingData: DataProcessor.isAppLoadingData() });
  }

  reloadData() {
    AppProcessor.doReloadUserData().then(() => {
      this.switchSubTab(this.state.subTab);
    }).catch((error) => {
      console.log('getUserBitmark error :', error);
    });
  }
  handerDonationInformationChange(donationInformation) {
    let studies = (this.state.subTab === SubTabs.other ? donationInformation.otherStudies : donationInformation.joinedStudies);
    if (studies) {
      studies.forEach(study => {
        study.key = study.studyId
      });
    }
    this.setState({ donationInformation, studies });
  }
  switchSubTab(subTab) {
    subTab = subTab || this.state.subTab;
    let studies = (subTab === SubTabs.other ? this.state.donationInformation.otherStudies : this.state.donationInformation.joinedStudies);
    if (studies) {
      studies.forEach(study => {
        study.key = study.studyId
      });
    }
    this.setState({ subTab, studies });
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
          <Text style={defaultStyle.headerTitle}>DONATIONS</Text>
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
          }]} onPress={() => this.switchSubTab(SubTabs.other)}>
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
          }]} onPress={() => this.switchSubTab(SubTabs.joined)}>
            <View style={donationStyle.subTabButtonArea}>
              <View style={[donationStyle.activeSubTabBar, { backgroundColor: '#F5F5F5' }]}></View>
              <View style={donationStyle.subTabButtonTextArea}>
                <Text style={[donationStyle.subTabButtonText, { color: '#C1C1C1' }]}>{SubTabs.joined.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>}
        </View>

        <ScrollView style={donationStyle.contentScroll}>
          {this.state.studies && this.state.studies.length > 0 && <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
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
            {this.state.studies && this.state.studies.length === 0 && <Text style={donationStyle.noCardTitle}>YOU’VE JOINED ALL THE STUDIES!</Text>}
            <Text style={donationStyle.noCardMessage}>
              If you would like to publish a study please <TouchableOpacity style={donationStyle.contactButton} onPress={this.contactBitmark}>
                <Text style={donationStyle.contactButtonText}>contact Bitmark.</Text>
              </TouchableOpacity>
            </Text>
          </View>}

          {this.state.studies && this.state.studies.length === 0 && this.state.subTab === SubTabs.joined && <View style={donationStyle.content}>
            <Text style={donationStyle.noCardTitle}>HAVEN’T JOINED ANY STUDIES?</Text>
            <Text style={donationStyle.noCardMessage}>Browse studies to learn where you can donate your data and help advance public health.</Text>
          </View>}
          {(this.state.appLoadingData || this.state.gettingData) && <View style={donationStyle.content}>
            <ActivityIndicator size="large" style={{ marginTop: 46, }} />
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
    needReloadData: PropTypes.bool,
    doneReloadData: PropTypes.func,
  }),

}