import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  Alert,
} from 'react-native';

import DefaultStudies from './default';
import JoinedStudies from './joined';

import { BitmarkComponent } from './../../../../commons/components';

import defaultStyle from './../../../../commons/styles';
import studyDetailsStyles from './study-detail.component.style';
import { AppProcessor, DataProcessor } from '../../../../processors';
import { EventEmitterService } from '../../../../services';

export class StudyDetailComponent extends React.Component {
  constructor(props) {
    super(props);
    this.doJoinStudy = this.doJoinStudy.bind(this);
    this.doOutOptStudy = this.doOutOptStudy.bind(this);
    let study;
    if (this.props.navigation && this.props.navigation.state && this.props.navigation.state.params && this.props.navigation.state.params.study) {
      study = this.props.navigation.state.params.study;
    }
    this.state = {
      study: study,
    };
  }
  render() {
    let DetailComponent = (this.state.study && this.state.study.studyId && this.state.study.joinedDate)
      ? JoinedStudies[this.state.study.studyId] : DefaultStudies[this.state.study.studyId];
    return (
      <BitmarkComponent
        header={<View style={[defaultStyle.header]}>
          <TouchableOpacity style={[defaultStyle.headerLeft]} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('./../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>Study Details</Text>
          <TouchableOpacity style={defaultStyle.headerRight} />
        </View>}
        content={(<View style={studyDetailsStyles.body}>
          {!DetailComponent && <Text>This study is not support!</Text>}
          {!!DetailComponent && <ScrollView style={studyDetailsStyles.studyContent}>
            {<DetailComponent study={this.state.study} navigation={this.props.navigation} doJoinStudy={this.doJoinStudy} doOutOptStudy={this.doOutOptStudy} />}
          </ScrollView>}
        </View>)}
      />
    );
  }
  // ======================================================================================================================================================
  // ======================================================================================================================================================
  doJoinStudy() {
    console.log('doJoinStudy =====', this.props);
    this.props.navigation.navigate('StudySetting', { study: this.state.study });
  }
  doOutOptStudy() {
    Alert.alert('Leave Study', "Are you sure you want to completely withdraw from the study? You will no longer be able to donate data to this study. This action cannot be undone.", [{
      text: 'Cancel', style: 'cancel'
    }, {
      text: 'Leave',
      onPress: () => {
        AppProcessor.doLeaveStudy(this.state.study.studyId).then((result) => {
          if (result) {
            DataProcessor.doReloadUserData();
            this.props.navigation.goBack();
          }
        }).catch(error => {
          console.log('doLeaveStudy error:', error);
          EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {
            onClose: () => {
              this.props.navigation.goBack();
            },
            error
          });
        })
      }
    }])
  }
  // ======================================================================================================================================================
  // ======================================================================================================================================================
}

StudyDetailComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        study: PropTypes.object,
      })
    })
  })
}