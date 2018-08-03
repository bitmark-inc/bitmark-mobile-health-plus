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
import { iosConstant } from '../../../../../../configs/ios/ios.config';

export class Study1ExitSurvey2Component extends React.Component {
  constructor(props) {
    super(props);
    this.doSubmit = this.doSubmit.bind(this);
    this.doOptOut = this.doOptOut.bind(this);
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

      AppProcessor.doCompletedStudyTask(this.state.study, this.state.study.taskIds.exit_survey_2, { email: this.state.email }).then((result) => {
        if (result) {
          DataProcessor.doReloadUserData();
          this.swiper.scrollBy(1);
        }
      }).catch(error => {
        console.log('doCompletedStudyTask study1_exit_survey_2 error:', error);
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
      });
    } else {
      this.setState({ emailError: 'Invalid email!' })
    }
  }
  doOptOut() {
    AppProcessor.doCompletedStudyTask(this.state.study, this.state.study.taskIds.exit_survey_2, null).then((result) => {
      if (result) {
        this.swiper.scrollBy(2);
      }
    }).catch(error => {
      console.log('doCompletedStudyTask study1_exit_survey_2 error:', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
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
                  <Text style={[styles.title]}>{"Optional Exit Interview".toUpperCase()}</Text>
                  {/* <Text style={styles.message}>Tell Us About Your Experience!</Text> */}
                  <Text style={[styles.description,]}>
                    Thank you for completing the Global Women’s Health Outcomes Study. For the optional study activity, we are interested in getting your in-depth feedback about how we can make the study and/or the app better. If you are interested in being interviewed, please let us know below. Our researchers will reach out if you meet the certain target criteria.
                  </Text>

                  <Text style={[styles.thankYouMessage,]}>
                    Thank you again for your contribution and support in advancing research!
                  </Text>
                </View>
              </ScrollView>
            )}
            footerHeight={45 + iosConstant.blankFooter}
            footer={(<View style={styles.bottomButtons}>
              <TouchableOpacity style={styles.optOutButton} onPress={this.doOptOut}>
                <Text style={styles.optOutButtonText}>OPT OUT</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.interestedButton} onPress={() => this.swiper.scrollBy(1)}>
                <Text style={styles.interestedButtonText}>I’M INTERESTED</Text>
              </TouchableOpacity>
            </View>)}
          />

          <BitmarkComponent
            backgroundColor={'white'}
            ref={(ref) => this.fullRef = ref}
            header={(<View style={[defaultStyle.header, { backgroundColor: 'white' }]}>
              <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.swiper.scrollBy(-1)} >
                <Image style={defaultStyle.headerLeftIcon} source={require('./../../../../../../../assets/imgs/header_blue_icon.png')} />
              </TouchableOpacity>
              <Text style={defaultStyle.headerTitle}>Step 2 of 2</Text>
              <TouchableOpacity style={defaultStyle.headerRight} onPress={() => { this.props.navigation.goBack() }}>
                <Text style={defaultStyle.headerRightText}>Cancel</Text>
              </TouchableOpacity>
            </View>)}
            content={(
              <ScrollView>
                <View style={styles.swipePage}>
                  <Text style={[styles.title]}>{"Optional Exit Interview".toUpperCase()}</Text>
                  <Text style={[styles.description,]}>
                    Awesome!{'\n\n'}
                    Please enter the email where we can best reach you.
                  </Text>
                  <TextInput style={styles.emailInput}
                    placeholder="EMAIL"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={(email) => this.setState({ email, emailError: '' })}
                    onFocus={() => this.setState({ emailError: '' })}
                  />
                  <Text style={styles.emailError}>{this.state.emailError}</Text>

                </View>
              </ScrollView>
            )}
            footerHeight={45 + iosConstant.blankFooter}
            footer={(<View style={styles.bottomButtons}>
              <TouchableOpacity style={[styles.interestedButton, { width: '100%' }]} onPress={this.doSubmit}>
                <Text style={styles.interestedButtonText}>SUBMIT</Text>
              </TouchableOpacity>
            </View>)}
          />

          <BitmarkComponent
            backgroundColor={'white'}
            ref={(ref) => this.fullRef = ref}
            content={(
              <ScrollView>
                <View style={styles.swipePage}>
                  <Text style={[styles.congratulations]}>{"CONGRATULATONS!"}</Text>
                  <Text style={[styles.description,]}>
                    You’ve completed Global women’s health outcomes study!
                  </Text>
                  <View style={styles.researcherArea}>
                    <Image style={styles.madelenaImage} source={require('./../../../../../../../assets/imgs/madelena.png')} />
                    <Text style={[styles.madelenaName,]}>Madelena Ng, Doctoral Candidate</Text>
                    <Text style={[styles.madelenaThankMessage,]}>{"“Thank you for donating your data, and helping close the gap in women's health.”"}</Text>
                  </View>
                </View>
              </ScrollView>
            )}
            footerHeight={45 + iosConstant.blankFooter}
            footer={(<View style={styles.bottomButtons}>
              <TouchableOpacity style={[styles.interestedButton, { width: '100%', backgroundColor: '#0060F2' }]} onPress={() => { this.props.navigation.goBack() }}>
                <Text style={[styles.interestedButtonText, { color: 'white' }]}>DONE</Text>
              </TouchableOpacity>
            </View>)}
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