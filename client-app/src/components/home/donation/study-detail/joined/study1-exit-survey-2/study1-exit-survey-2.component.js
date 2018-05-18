import React from 'react';
import PropTypes from 'prop-types';
import Swiper from 'react-native-swiper'
import {
  View, Image, Text, TouchableOpacity, ScrollView, TextInput,
} from 'react-native';

import defaultStyle from '../../../../../../commons/styles';
import styles from './study1-exit-survey-2.component.style';

import { BitmarkComponent } from '../../../../../../commons/components';
import { AppProcessor, DataProcessor } from '../../../../../../processors';
import { EventEmitterService } from '../../../../../../services';

export class Study1ExitSurvey2Component extends React.Component {
  constructor(props) {
    super(props);
    this.doSubmit = this.doSubmit.bind(this);
    this.doCompletedTask = this.doCompletedTask.bind(this);
    let study = this.props.navigation.state.params.study;

    this.state = {
      study,
      email: '',
      emailError: '',
    }
  }
  doSubmit() {
    let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (reg.test(this.state.email)) {
      this.swiper.scrollBy(1);
    } else {
      this.setState({ emailError: 'Invalid email!' })
    }
  }
  doCompletedTask() {
    AppProcessor.doCompletedStudyTask(this.state.study, this.state.study.taskIds.exit_survey_2, this.state.email ? { email: this.state.email } : null).then((result) => {
      if (result) {
        DataProcessor.doReloadUserData();
        this.props.navigation.goBack();
      }
    }).catch(error => {
      console.log('doCompletedStudyTask study1_exit_survey_2 error:', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR);
    });
  }

  render() {
    return (
      <View style={styles.body}>
        <Swiper
          ref={swiper => this.swiper = swiper}
          scrollEnabled={false}
          loop={false}
          showsPagination={false}
        >
          <BitmarkComponent
            backgroundColor={'white'}
            ref={(ref) => this.fullRef = ref}
            header={(<View style={[defaultStyle.header, { backgroundColor: 'white' }]}>
              <TouchableOpacity style={defaultStyle.headerLeft} />
              <Text style={defaultStyle.headerTitle}>Step 1 of 2</Text>
              <TouchableOpacity style={defaultStyle.headerRight} onPress={() => this.props.navigation.goBack()}>
                <Text style={defaultStyle.headerRightText}>Cancel</Text>
              </TouchableOpacity>
            </View>)}
            content={(
              <ScrollView>
                <View style={styles.swipePage}>
                  <Text style={[styles.title]}>Optional Exit Interview</Text>
                  <Text style={styles.message}>Tell Us About Your Experience!</Text>
                  <Text style={[styles.description,]}>
                    Thank you for completing the Global Women’s Health Outcomes Study. For the optional study activity, we are interested in getting your in-depth feedback about how we can make the study and/or the app better. If you are interested in being interviewed, please let us know below. Our researchers will reach out if you meet the certain target criteria.
                  </Text>
                  <TouchableOpacity style={styles.interestedButton} onPress={() => this.swiper.scrollBy(1)}>
                    <Text style={styles.interestedButtonText}>I’m interested</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.optOutButton} onPress={() => this.swiper.scrollBy(2)}>
                    <Text style={styles.optOutButtonText}>Opt out</Text>
                  </TouchableOpacity>
                  <Text style={[styles.thankYouMessage,]}>
                    Thank you again for your contribution and support in advancing research!
                  </Text>
                </View>
              </ScrollView>
            )}
          />

          <BitmarkComponent
            backgroundColor={'white'}
            ref={(ref) => this.fullRef = ref}
            header={(<View style={[defaultStyle.header, { backgroundColor: 'white' }]}>
              <TouchableOpacity style={defaultStyle.headerLeft} />
              <Text style={defaultStyle.headerTitle}>Step 2 of 2</Text>
              <TouchableOpacity style={defaultStyle.headerRight} onPress={() => { this.props.navigation.goBack() }}>
                <Text style={defaultStyle.headerRightText}>Cancel</Text>
              </TouchableOpacity>
            </View>)}
            content={(
              <ScrollView>
                <View style={styles.swipePage}>
                  <Text style={[styles.title]}>Optional Exit Interview </Text>
                  <Text style={styles.message}>Awesome!</Text>
                  <Text style={[styles.description,]}>
                    Please enter the email where we can best reach you.
                  </Text>
                  <TextInput style={styles.emailInput}
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={(email) => this.setState({ email, emailError: '' })}
                    onFocus={() => this.setState({ emailError: '' })}
                  />
                  <Text style={styles.emailError}>{this.state.emailError}</Text>
                  <TouchableOpacity style={[styles.interestedButton, { marginTop: 103 }]} onPress={this.doSubmit}>
                    <Text style={styles.interestedButtonText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          />

          <BitmarkComponent
            backgroundColor={'white'}
            ref={(ref) => this.fullRef = ref}
            content={(
              <ScrollView>
                <View style={styles.swipePage}>
                  <Text style={[styles.congratulations]}>{"CONGRATULATONS!\nYOU'VE COMPLETED\nGLOBAL WOMEN'S HEALTH OUTCOMES STUDY!"}</Text>
                  <Image style={styles.madelenaImage} source={require('./../../../../../../../assets/imgs/madelena.png')} />
                  <Text style={[styles.madelenaName,]}>Madelena Ng, Doctoral Candidate</Text>
                  <Text style={[styles.madelenaThankMessage,]}>{"“Thank you for donating your data, and helping close the gap in women's health.”"}</Text>
                  <TouchableOpacity style={[styles.interestedButton, { marginTop: 97 }]} onPress={this.doCompletedTask}>
                    <Text style={styles.interestedButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          />


        </Swiper>
      </View>
    );
  }
}

Study1ExitSurvey2Component.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        study: PropTypes.object.isRequired,
      }),
    })
  }),
}