import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Image, Text, TouchableOpacity,
  Linking,
} from 'react-native';


import { StudyCardComponent } from './../../study-card/study-card.component';

import styles from './study-joined.component.style';

export class Study1JoinedComponent extends React.Component {
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
              description={this.state.study.description}
              joined={!!this.state.study.joinedDate}
              interval={this.state.study.interval}
              duration={this.state.study.duration || this.state.study.durationText}
            />
            <View style={styles.researcherArea}>
              <Image style={styles.researcherImage}
                source={require('./../../../../../../assets/imgs/madelena.png')}
              />
              <Text style={styles.studyResearcherName} >{this.state.study.researcherName}</Text>
            </View>
          </View>
          <Text style={styles.cardMessage}>{"“Thank you for donating your data, and helping close the gap in women's health.”"}</Text>
          {this.state.study.researcherLink && <TouchableOpacity onPress={() => {
            Linking.openURL(this.state.study.researcherLink.indexOf('http') > 0 ? this.state.study.researcherLink : 'http://' + this.state.study.researcherLink)
          }}>
            <Text style={styles.studyResearcherLink}>Learn more about Madelena’s research and how to contact her »</Text>
          </TouchableOpacity>}

          <View style={[styles.infoArea, {
            marginTop: 10,
            borderWidth: 1,
            borderColor: '#BDBDBD',
          }]}>
            <TouchableOpacity style={[styles.infoButton]} onPress={() => {
              this.props.navigation.navigate('StudyConsent', { study: this.state.study, })
            }}>
              <Text style={styles.infoButtonText}>View Study Consent Form</Text>
            </TouchableOpacity>
            <View style={styles.infoButtonBar} />
            <TouchableOpacity style={[styles.infoButton]} onPress={() => {
              this.props.navigation.navigate('HealthDataSource', { dataTypes: this.state.study.dataTypes, })
            }}>
              <Text style={styles.infoButtonText}>View Data Types</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoArea}>
            <Text style={styles.infoAreaTitle}>List of Bitmarked Data</Text>
            <View style={styles.infoAreaListItem} >
              <Text style={styles.infoAreaItem}>•	 Basal Energy Burned</Text>
              <Text style={styles.infoAreaItem}>•	 Cervical Mucous Quality</Text>
              <Text style={styles.infoAreaItem}>•	 Exercise Time</Text>
              <Text style={styles.infoAreaItem}>•	 Flights Climbed</Text>
              <Text style={styles.infoAreaItem}>•	 Intermenstrual Bleeding (Spotting)</Text>
              <Text style={styles.infoAreaItem}>•	 Menstrual Flow</Text>
              <Text style={styles.infoAreaItem}>•	 Mindful Minutes</Text>
              <Text style={styles.infoAreaItem}>•	 Ovulation Test Result</Text>
              <Text style={styles.infoAreaItem}>•	 Sexual Activity</Text>
              <Text style={styles.infoAreaItem}>•	 Sleep Analysis</Text>
              <Text style={styles.infoAreaItem}>•	 Stand Hours</Text>
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

Study1JoinedComponent.propTypes = {
  study: PropTypes.object,
  doOutOptStudy: PropTypes.func,
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }),
}