import React from 'react';
import PropTypes from 'prop-types';
import { NavigationActions } from 'react-navigation'
import {
  View, Image, Text, TouchableOpacity,
} from 'react-native';

import { StudyConnectDataComponent } from './study-connect-data.component';
import { StudyThankYouComponent } from './study-thank-you.component';

import defaultStyle from './../../../../commons/styles';
import styles from './study-settings.component.style';

import { StudiesModel, AppleHealthKitModel } from '../../../../models';
import { EventEmiterService } from '../../../../services';
import { AppController } from '../../../../managers';
import { FullComponent } from '../../../../commons/components';
import { BottomTabsComponent } from '../../bottom-tabs/bottom-tabs.component';

// loading ==> connect-data  ==>loading=>thank-you
const SettingStatus = {
  loading: 'Loading',
  connect_data: 'Connect Data',
  thank_you: 'Thank you',
};
export class StudySettingComponent extends React.Component {
  constructor(props) {
    super(props);
    this.doIntakeSurvey = this.doIntakeSurvey.bind(this);
    this.doJoinStudy = this.doJoinStudy.bind(this);
    this.doFinish = this.doFinish.bind(this);

    this.consentSurveysResult = [];
    this.intakeSurveysResult = [];
    let study;
    if (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params && this.props.navigation.state.params.study) {
      study = this.props.navigation.state.params.study;
    }
    this.state = {
      status: SettingStatus.loading,
      // status: SettingStatus.connect_data,
      study: study,
    };
    if (this.state.study && StudiesModel[this.state.study.studyId] && this.state.status === SettingStatus.loading) {
      this.doIntakeSurvey();
    }
  }
  doIntakeSurvey() {
    fetch(this.state.study.consentLink)
      .then(response => response.text())
      .then(consentText => {
        StudiesModel[this.state.study.studyId].doConsentSurvey({ 'consent_html': consentText }).then(consentResult => {
          if (consentResult) {
            this.setState({
              status: SettingStatus.connect_data,
            });
          } else {
            this.props.navigation.goBack();
          }
        }).catch(error => {
          console.log('doIntakeSurvey error:', error);
          this.props.navigation.goBack();
        });
      }).catch(error => {
        console.log('load consent error:', error);
        this.props.navigation.goBack();
      });
  }
  doJoinStudy() {
    AppleHealthKitModel.initHealthKit(this.state.study.dataTypes).then(() => {
      return AppController.doJoinStudy(this.state.study.studyId);
    }).then((result) => {
      if (result != null) {
        this.setState({ status: SettingStatus.thank_you, });
      }
    }).catch(error => {
      console.log('initHealthKit error:', error);
      EventEmiterService.emit(EventEmiterService.events.APP_PROCESS_ERROR, {
        onClose: () => {
          this.props.navigation.goBack();
        }
      });
    });
  }
  doFinish() {
    const resetUserPage = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({
          routeName: 'User', params: {
            displayedTab: { mainTab: BottomTabsComponent.MainTabs.transaction, subTab: 'ACTION REQUIRED' },
            needReloadData: true,
          }
        })
      ]
    });
    this.props.navigation.dispatch(resetUserPage);
  }
  render() {
    if (!this.state.study || !StudiesModel[this.state.study.studyId]) {
      return (
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '600' }} >This study is not support now.</Text>
        </View>
      );
    }
    return (
      <FullComponent
        backgroundColor={this.state.status === SettingStatus.thank_you ? 'white' : '#F5F5F5'}
        header={(<View style={[defaultStyle.header, { backgroundColor: this.state.status === SettingStatus.thank_you ? 'white' : '#F5F5F5' }]}>
          {this.state.status !== SettingStatus.thank_you && <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            {this.state.status !== SettingStatus.thank_you &&
              <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/header_blue_icon.png')} />}
          </TouchableOpacity>}
          {this.state.status !== SettingStatus.thank_you && <Text style={[defaultStyle.headerTitle, { color: '#0C3E79' }]}>{this.state.status}</Text>}
          {this.state.status !== SettingStatus.thank_you && <TouchableOpacity style={defaultStyle.headerRight} onPress={() => {
            this.props.navigation.goBack();
          }}>
            {this.state.status !== SettingStatus.thank_you &&
              <Text style={[defaultStyle.headerRightText, { fontWeight: '300', fontSize: 14, }]}>Cancel</Text>}
          </TouchableOpacity>}
        </View>)}
        content={(<View style={styles.body} >
          {this.state.status === SettingStatus.connect_data && <StudyConnectDataComponent study={this.state.study} doJoinStudy={this.doJoinStudy} />}
          {this.state.status === SettingStatus.thank_you && <StudyThankYouComponent study={this.state.study} doFinish={this.doFinish} />}
        </View>)}
      />
    );
  }
}

StudySettingComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    dispatch: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        study: PropTypes.object
      })
    })
  }),
  subTab: PropTypes.string,
  userInformation: PropTypes.object,
  onClickCompletedTask: PropTypes.func,
  onClickTodoTask: PropTypes.func,
};