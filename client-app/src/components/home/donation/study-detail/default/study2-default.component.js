import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Image, Text, TouchableOpacity,
  Linking,
} from 'react-native';


import { StudyCardComponent } from './../../study-card/study-card.component';
import styles from './study-default.component.style';

export class Study2DefaultComponent extends React.Component {
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
          <Text style={[styles.cardMessage, { marginTop: 5, }]}>
            The IDRR is a study of people who want to prevent or reverse prediabetes, diabetes or related health problems.
          </Text>
          <TouchableOpacity onPress={() => {
            Linking.openURL(this.state.study.researcherLink.indexOf('http') > 0 ? this.state.study.researcherLink : 'http://' + this.state.study.researcherLink)
          }}>
            <Text style={styles.studyResearcherLink}>Learn more about Victor’s research and how to contact him »</Text>
          </TouchableOpacity>

          <View style={styles.infoArea}>
            <Text style={styles.infoAreaTitle}>Participant Requirements</Text>
            <View style={styles.infoAreaListItem} >
              <Text style={styles.infoAreaItem}>•	 18 and older</Text>
            </View>
          </View>

          <View style={styles.infoArea}>
            <Text style={styles.infoAreaTitle}>Data Requirements</Text>
            <View style={styles.infoAreaListItem} >
              <Text style={styles.infoAreaItem}>•	 Activity</Text>
              <Text style={styles.infoAreaItem}>•	 Blood Glucose</Text>
              <Text style={styles.infoAreaItem}>•	 Body Measurements</Text>
              <Text style={styles.infoAreaItem}>•	 Characteristics</Text>
              <Text style={styles.infoAreaItem}>•	 Mindfulness Session</Text>
              <Text style={styles.infoAreaItem}>•	 Nutrition</Text>
              <Text style={styles.infoAreaItem}>•	 Respiratory Rate</Text>
              <Text style={styles.infoAreaItem}>•	 Sleep Analysis</Text>
              <Text style={styles.infoAreaItem}>•	 Stand Hours</Text>
              <Text style={styles.infoAreaItem}>•	 UV Exposure</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.requireButton} onPress={() => { this.setState({ agreed: !this.state.agreed }) }}>
            <Image style={styles.requireIcon}
              source={this.state.agreed ? require('./../../../../../../assets/imgs/require_checked.png') : require('./../../../../../../assets/imgs/require_un_check.png')}
            />
            <Text style={styles.requireMessage}>I meet the participant requirements. </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.bottomButton, { backgroundColor: this.state.agreed ? '#0060F2' : '#BDBDBD' }]} onPress={() => this.props.doJoinStudy()} disabled={!this.state.agreed}>
          <Text style={styles.bottomButtonText}>LET’S GET STARTED</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

Study2DefaultComponent.propTypes = {
  study: PropTypes.object,
  doJoinStudy: PropTypes.func.isRequired,
}