import React from 'react';
import PropTypes from 'prop-types';
import Swiper from 'react-native-swiper'
import {
  View, Text, TouchableOpacity, ScrollView, TextInput, Image,
} from 'react-native';

import defaultStyle from '../../../../../../commons/styles';
import styles from './study2-entry-interview.component.style';

import { BitmarkComponent } from '../../../../../../commons/components';
import { AppProcessor, DataProcessor } from '../../../../../../processors';
import { EventEmitterService } from '../../../../../../services';
import { iosConstant } from '../../../../../../configs/ios/ios.config';

export class Study2EntryInterviewComponent extends React.Component {
  constructor(props) {
    super(props);
    this.doSubmit = this.doSubmit.bind(this);
    this.doCompletedTask = this.doCompletedTask.bind(this);
    let study = this.props.navigation.state.params.study;

    console.log('study:', study);
    this.state = {
      study,
      email: '',
      emailError: '',
    }
  }
  doSubmit() {
    let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (reg.test(this.state.email)) {
      this.doCompletedTask();
    } else {
      this.setState({ emailError: this.state.email ? 'Invalid email!' : 'You need input email address!' })
    }
  }
  doCompletedTask() {
    AppProcessor.doCompletedStudyTask(this.state.study, this.state.study.taskIds.entry_study, this.state.email ? { email: this.state.email } : null).then((result) => {
      if (result) {
        DataProcessor.doReloadUserData();
        this.props.navigation.goBack();
      }
    }).catch(error => {
      console.log('doCompletedStudyTask study2_entry_study error:', error);
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
                  <Text style={[styles.title]}>{'Optional Entry Interview'.toUpperCase()}</Text>
                  <Text style={[styles.description,]}>
                    <Text style={{ fontWeight: '500' }}>
                      Would you like to share your personal experience with us over an interview?{'\n\n'}
                    </Text>
                    You will be asked to provide your email address once clicking the “I’m interested” button.{'\n\n'}
                    If you prefer not to share your email, you can still participate in the study, but we will not be able to contact you for the interview.{'\n\n'}
                    No matter which way you choose, we will treat your data with privacy, confidentiality and encryption.
                  </Text>
                </View>
              </ScrollView>
            )}

            footerHeight={45 + iosConstant.blankFooter}
            footer={(<View style={styles.bottomButtons}>
              <TouchableOpacity style={styles.leftButton} onPress={this.doCompletedTask}>
                <Text style={styles.leftButtonText}>{'No, thanks'.toUpperCase()}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.rightButton} onPress={() => this.swiper.scrollBy(1)}>
                <Text style={styles.rightButtonText}>{'I’m interested'.toUpperCase()}</Text>
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
                  <Text style={[styles.title]}>{'Optional ENTRY Interview'.toUpperCase()} </Text>
                  <Text style={[styles.description,]}>
                    Awesome!{'\n\n'}
                    Please enter the email where we can best reach you.
                  </Text>
                  <TextInput style={styles.emailInput}
                    placeholder="EMAIL"
                    placeholderTextColor="#C1C1C1"
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
              <TouchableOpacity style={styles.submitButton} onPress={this.doSubmit}>
                <Text style={styles.submitButtonText}>SUBMIT</Text>
              </TouchableOpacity>
            </View>)}
          />
        </Swiper>
      </View>
    );
  }
}

Study2EntryInterviewComponent.propTypes = {
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