import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Image, Text, TouchableOpacity,
  Linking,
} from 'react-native';


import { StudyCardComponent } from './../../study-card/study-card.component';

import styles from './study-joined.component.style';

export class Study2JoinedComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      study: this.props.study
    };
  }
  render() {
    return (
      <View style={styles.content}>
        <View style={styles.contentCenter}>
          <View style={styles.cardArea}>
            <StudyCardComponent style={styles.studyCard}
              title={this.state.study.title}
              joined={!!this.state.study.joinedDate}
              description={this.state.study.description}
              interval={this.state.study.interval}
              duration={this.state.study.duration || this.state.study.durationText}
            />
            <View style={styles.researcherArea}>
              <Image style={styles.researcherImage}
                source={require('./../../../../../../assets/imgs/victor.png')}
              />
              <Text style={styles.studyResearcherName} >{this.state.study.researcherName}</Text>
            </View>
          </View>
          <Text style={[styles.cardMessage]}>“Thanks for joining the Registry!”</Text>
          <TouchableOpacity onPress={() => {
            Linking.openURL(this.state.study.researcherLink.indexOf('http') > 0 ? this.state.study.researcherLink : 'http://' + this.state.study.researcherLink)
          }}>
            <Text style={styles.studyResearcherLink}>Learn more about Victor’s research and how to contact him »</Text>
          </TouchableOpacity>

          <View style={[styles.infoArea]}>
            <TouchableOpacity style={[styles.infoButton]} onPress={() => {
              this.props.navigation.navigate('StudyConsent', { study: this.state.study, })
            }}>
              <Text style={styles.infoButtonText}>View Study Consent Form</Text>
            </TouchableOpacity>
          </View>
          {/* <View style={[styles.infoArea, { marginTop: 1, }]}>
            <TouchableOpacity style={[styles.infoButton]} onPress={() => {
            }}>
              <Text style={styles.infoButtonText}>Share This Study</Text>
            </TouchableOpacity>
          </View> */}

          <View style={[styles.infoArea]}>
            <Text style={styles.infoAreaTitle}>List of Data</Text>
            <View style={styles.infoAreaListItem} >
              <Text style={styles.infoAreaItem}>•	 Dietary Energy Consumed</Text>
              <Text style={styles.infoAreaItem}>•	 Blood Glucose</Text>
              <Text style={styles.infoAreaItem}>•	 Heart Rate</Text>
              <Text style={styles.infoAreaItem}>•	 Step Count</Text>
              <Text style={styles.infoAreaItem}>•	 Walking / Running Distance</Text>
            </View>
          </View>

          <View style={styles.infoArea}>
            <Text style={styles.infoAreaTitle}>Leave Study</Text>
            <View style={styles.infoAreaListItem} >
              <Text style={styles.infoAreaItem}>
                You have agreed to continue donating data through the duration of the study. Are you sure you want to completely withdraw from the study?  If you still wish to stop donating, please tap the button below:
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={[styles.leaveButton]} onPress={() => this.props.doOutOptStudy()}>
          <Text style={styles.leaveButtonText}>LEAVE STUDY</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

Study2JoinedComponent.propTypes = {
  study: PropTypes.object,
  doOutOptStudy: PropTypes.func,
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }),
}