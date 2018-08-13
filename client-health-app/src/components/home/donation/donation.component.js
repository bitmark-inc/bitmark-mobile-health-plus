import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Text, ScrollView, FlatList, ActivityIndicator, Image,
  Alert,
  Dimensions,
} from 'react-native';
import Mailer from 'react-native-mail';
import moment from 'moment';

// import { InactiveDonationComponent } from './active-donation';
import { StudyCardComponent } from './study-card/study-card.component';

import donationStyle from './donation.component.style';
import { DataProcessor, AppProcessor } from '../../../processors';
import { EventEmitterService } from '../../../services';

const SubTabs = {
  todo: 'To-do',
  studies: 'Studies',
  news: 'News',
};
let currentSize = Dimensions.get('window');
let ComponentName = 'DonationComponent';
export class DonationComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handerDonationInformationChange = this.handerDonationInformationChange.bind(this);
    this.contactBitmark = this.contactBitmark.bind(this);
    this.reloadData = this.reloadData.bind(this);
    this.handerLoadingData = this.handerLoadingData.bind(this);
    this.handerChangeDonationTasks = this.handerChangeDonationTasks.bind(this);
    this.clickOnDonationTask = this.clickOnDonationTask.bind(this);

    EventEmitterService.remove(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.CHANGE_DONATION_TASK, null, ComponentName);
    EventEmitterService.remove(EventEmitterService.events.APP_LOADING_DATA, null, ComponentName);

    let subTab = (this.props.screenProps.subTab && (this.props.screenProps.subTab === SubTabs.todo || this.props.screenProps.subTab === SubTabs.studies || this.props.screenProps.subTab === SubTabs.news)) ? this.props.screenProps.subTab : SubTabs.todo;

    this.state = {
      donationInformation: null,
      subTab,
      studies: null,
      donationTasks: null,
      lengthDisplayDonationTasks: 0,
      totalDonationTasks: 0,
      appLoadingData: DataProcessor.isAppLoadingData(),
      gettingData: true,
    };

    const doGetScreenData = async () => {
      let donationInformation = await DataProcessor.doGetDonationInformation();
      let { donationTasks, totalDonationTasks } = await DataProcessor.doGetDonationTasks(0);
      let studies = (donationInformation.otherStudies || []).concat(donationInformation.joinedStudies || []);
      studies = studies.sort((a, b) => (a.studyId < b.studyId ? -1 : (a.studyId > b.studyId ? 1 : 0)));
      this.setState({
        donationInformation,
        donationTasks,
        lengthDisplayDonationTasks: donationTasks.length,
        totalDonationTasks,
        studies,
        gettingData: false,
      });
    };
    doGetScreenData();
  }
  // ==========================================================================================
  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.CHANGE_USER_DATA_DONATION_INFORMATION, this.handerDonationInformationChange, ComponentName);
    EventEmitterService.on(EventEmitterService.events.CHANGE_DONATION_TASK, this.handerChangeDonationTasks, ComponentName);
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
  async handerDonationInformationChange(donationInformation) {
    let studies = (donationInformation.otherStudies || []).concat(donationInformation.joinedStudies || []);
    studies = studies.sort((a, b) => (a.studyId < b.studyId ? -1 : (a.studyId > b.studyId ? 1 : 0)));

    let { donationTasks, totalDonationTasks } = await DataProcessor.doGetDonationTasks(this.state.lengthDisplayDonationTasks);
    this.setState({
      donationTasks,
      lengthDisplayDonationTasks: donationTasks.length,
      totalDonationTasks,
      donationInformation,
      studies
    });
  }

  async handerChangeDonationTasks() {
    let { donationTasks, totalDonationTasks } = await DataProcessor.doGetDonationTasks(this.state.lengthDisplayDonationTasks);
    this.setState({
      donationTasks,
      lengthDisplayDonationTasks: donationTasks.length,
      totalDonationTasks
    });
  }

  switchSubTab(subTab) {
    subTab = subTab || this.state.subTab;
    this.setState({ subTab });
  }
  contactBitmark() {
    Mailer.mail({ recipients: ['support@bitmark.com'], }, (error) => {
      if (error) {
        Alert.alert('Error', 'Could not send mail. Please send a mail to support@bitmark.com');
      }
    });
  }

  clickOnDonationTask(item) {
    if (item.study && item.study.taskIds && item.taskType === item.study.taskIds.donations) {
      this.props.screenProps.homeNavigation.navigate('StudyDonation', { study: item.study, list: item.list });
    } else if (item.study && item.study.studyId === 'study1' && item.study.taskIds && item.taskType === item.study.taskIds.exit_survey_2) {
      this.props.screenProps.homeNavigation.navigate('Study1ExitSurvey2', { study: item.study });
    } else if (item.study && item.study.studyId === 'study2' && item.study.taskIds && item.taskType === item.study.taskIds.entry_study) {
      this.props.screenProps.homeNavigation.navigate('Study2EntryInterview', { study: item.study });
    } else if (item.study && item.study.taskIds && item.taskType) {
      AppProcessor.doStudyTask(item.study, item.taskType).catch(error => {
        console.log('doStudyTask error:', error);
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
      });
    }
  }

  render() {
    return (
      <View style={donationStyle.body}>
        <View style={donationStyle.subTabArea}>
          {this.state.subTab === SubTabs.todo && <TouchableOpacity style={[donationStyle.subTabButton, {
            backgroundColor: '#0060F2',
            borderLeftWidth: 1, borderTopLeftRadius: 3, borderBottomLeftRadius: 3, borderColor: '#0060F2',
          }]}>
            {(this.state.donationTasks && this.state.donationTasks > 0) && <View style={donationStyle.todoHightLight}></View>}
            <View style={donationStyle.subTabButtonArea}>
              <View style={donationStyle.subTabButtonTextArea}>
                <Text style={donationStyle.subTabButtonText}>{SubTabs.todo}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.todo && <TouchableOpacity style={[donationStyle.subTabButton]} onPress={() => this.switchSubTab(SubTabs.todo)}>
            {(this.state.donationTasks && this.state.donationTasks > 0) && <View style={donationStyle.todoHightLight}></View>}
            <View style={donationStyle.subTabButtonArea}>
              <View style={donationStyle.subTabButtonTextArea}>
                <Text style={[donationStyle.subTabButtonText, { color: '#C1C1C1' }]}>{SubTabs.todo}</Text>
              </View>
            </View>
          </TouchableOpacity>}

          {this.state.subTab === SubTabs.studies && <TouchableOpacity style={[donationStyle.subTabButton, {
            backgroundColor: '#0060F2',
            borderRightWidth: 1, borderLeftWidth: 1, borderColor: '#0060F2',
          }]}>
            <View style={donationStyle.subTabButtonArea}>
              <View style={donationStyle.subTabButtonTextArea}>
                <Text style={donationStyle.subTabButtonText}>{SubTabs.studies}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.studies && <TouchableOpacity style={[donationStyle.subTabButton, {
            backgroundColor: 'white',
            borderRightWidth: 1, borderLeftWidth: 1, borderColor: '#0060F2',
          }]} onPress={() => this.switchSubTab(SubTabs.studies)}>
            <View style={donationStyle.subTabButtonArea}>
              <View style={donationStyle.subTabButtonTextArea}>
                <Text style={[donationStyle.subTabButtonText, { color: '#C1C1C1' }]}>{SubTabs.studies}</Text>
              </View>
            </View>
          </TouchableOpacity>}

          {this.state.subTab === SubTabs.news && <TouchableOpacity style={[donationStyle.subTabButton, {
            backgroundColor: '#0060F2',
            borderRightWidth: 1, borderTopRightRadius: 3, borderBottomRightRadius: 3, borderColor: '#0060F2',
          }]}>
            <View style={donationStyle.subTabButtonArea}>
              <View style={donationStyle.subTabButtonTextArea}>
                <Text style={donationStyle.subTabButtonText}>{SubTabs.news}</Text>
              </View>
            </View>
          </TouchableOpacity>}
          {this.state.subTab !== SubTabs.news && <TouchableOpacity style={[donationStyle.subTabButton]} onPress={() => this.switchSubTab(SubTabs.news)}>
            <View style={donationStyle.subTabButtonArea}>
              <View style={donationStyle.subTabButtonTextArea}>
                <Text style={[donationStyle.subTabButtonText, { color: '#C1C1C1' }]}>{SubTabs.news}</Text>
              </View>
            </View>
          </TouchableOpacity>}
        </View>

        {this.state.subTab === SubTabs.todo && <ScrollView style={donationStyle.contentScroll}
          onScroll={async (scrollEvent) => {
            if (this.loadingDonationTasksWhenScroll) {
              return;
            }
            if (scrollEvent.nativeEvent.contentOffset.y >= (scrollEvent.nativeEvent.contentSize.height - currentSize.height) && (this.state.lengthDisplayDonationTasks < this.state.totalDonationTasks)) {
              this.loadingDonationTasksWhenScroll = true;
              let lengthDisplayDonationTasks = Math.min(this.state.totalDonationTasks, this.state.lengthDisplayDonationTasks + 20);
              let { donationTasks } = await DataProcessor.doGetDonationTasks(lengthDisplayDonationTasks);
              this.setState({ lengthDisplayDonationTasks: donationTasks.length, donationTasks });
            }
            this.loadingDonationTasksWhenScroll = false;
          }}
          scrollEventThrottle={1}>
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            {(this.state.donationTasks && this.state.donationTasks.length > 0) && <View style={donationStyle.content}>
              <FlatList
                extraData={this.state}
                data={this.state.donationTasks}
                renderItem={({ item }) => {
                  return (<TouchableOpacity style={donationStyle.donationTaskItem} onPress={() => this.clickOnDonationTask(item)}>
                    <View style={donationStyle.donationTaskItemLeftArea}>
                      <Image style={donationStyle.researcherImage} source={(item.study && item.study.studyId === 'study1') ? require('./../../../../assets/imgs/madelena.png') :
                        ((item.study && item.study.studyId === 'study2') ? require('./../../../../assets/imgs/victor.png') : null)} />
                    </View>
                    <View style={donationStyle.donationTaskItemRightArea}>
                      <Text style={donationStyle.donationTaskItemType}>{item.typeTitle.toUpperCase() + (item.number > 1 ? ` (${item.number})` : ``)}</Text>
                      <Text style={donationStyle.donationTaskItemTitle}>{item.title}</Text>
                      <Text style={donationStyle.donationTaskItemDescription}>{item.description}</Text>
                      <Text style={donationStyle.donationTaskItemTime}>{moment(item.timestamp).format('HH:mm dddd, MMM DD, YYYY')}</Text>
                    </View>
                  </TouchableOpacity>)
                }}
              />
            </View>}
            {(!this.state.donationTasks || this.state.donationTasks.length === 0) && <View style={[donationStyle.content, { alignItems: 'center' }]}>
              <Image style={donationStyle.welcomeIcon} source={require('./../../../../assets/imgs/todo-welcome-icon.png')} />
              <Text style={donationStyle.todoEmptyTitle}>WELCOME!</Text>
              <Text style={donationStyle.todoEmptyDescription}>When you join studies, you will be asked to authorize access to specific data here. </Text>
            </View>}
          </TouchableOpacity>
          {(this.state.appLoadingData || this.state.gettingData) && <ActivityIndicator size="large" style={{ marginTop: 46, }} />}
        </ScrollView>}

        {this.state.subTab === SubTabs.studies && <ScrollView style={[donationStyle.contentScroll, { backgroundColor: '#EDF0F4' }]}>
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            <View style={donationStyle.content}>
              <FlatList
                keyExtractor={(item) => item.studyId}
                extraData={this.state}
                data={this.state.studies}
                renderItem={({ item }) => {
                  return (<TouchableOpacity style={donationStyle.studyCard} onPress={() => this.props.screenProps.homeNavigation.navigate('StudyDetail', { study: item })}>
                    <StudyCardComponent
                      researcherImage={item.studyId === 'study1' ? require('./../../../../assets/imgs/madelena.png') :
                        (item.studyId === 'study2' ? require('./../../../../assets/imgs/victor.png') : '')}
                      displayStatus={true}
                      title={item.title}
                      joined={!!item.joinedDate}
                      description={item.description}
                      interval={item.interval}
                      duration={item.duration || item.durationText} />
                  </TouchableOpacity>)
                }}
              />
            </View>
          </TouchableOpacity>
          {(this.state.appLoadingData || this.state.gettingData) && <ActivityIndicator size="large" style={{ marginTop: 46, }} />}
        </ScrollView>}

        {this.state.subTab === SubTabs.news && <ScrollView style={donationStyle.contentScroll}>
          <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
            <View style={donationStyle.content}>
              <FlatList
                keyExtractor={(item) => item.id}
                extraData={this.state}
                data={this.state.donationInformation ? this.state.donationInformation.news : []}
                renderItem={({ item }) => {
                  return (<TouchableOpacity style={donationStyle.newRecord} disabled={true}>
                    <View style={donationStyle.newRecordImageArea}>
                      {item.researcherImageUrl && <Image style={donationStyle.newRecordImageIcon} source={{ uri: item.researcherImageUrl }} />}
                    </View>
                    <View style={donationStyle.newRecordContentArea}>
                      <Text style={donationStyle.newTitle}>{item.title}</Text>
                      <Text style={donationStyle.newDescription}>{item.description}</Text>
                      <View style={donationStyle.newFooter}>
                        <Text style={donationStyle.newOwner} numberOfLines={1} >{item.publisher}</Text>
                        <Text style={donationStyle.newCreatedAt} numberOfLines={1}>{moment(item.createdAt).format('YYYY MMM DD')}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>)
                }}
              />
            </View>
          </TouchableOpacity>
          {(this.state.appLoadingData || this.state.gettingData) && <ActivityIndicator size="large" style={{ marginTop: 46, }} />}
        </ScrollView>}
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