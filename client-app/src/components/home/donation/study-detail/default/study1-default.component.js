import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Image, Text, TouchableOpacity,
} from 'react-native';


import { StudyCardComponent } from './../../study-card/study-card.component';
import styles from './study-default.component.style';

export class Study1DefaultComponent extends React.Component {
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
              interval={this.state.study.interval}
              joined={!!this.state.study.joinedDate}
              duration={this.state.study.duration || this.state.study.durationText}
            />
            <View style={styles.researcherArea}>
              <Image style={styles.researcherImage}
                source={require('./../../../../../../assets/imgs/madelena.png')}
              />
              <Text style={styles.studyResearcherName} >{this.state.study.researcherName}</Text>
            </View>
          </View>
          <Text style={styles.cardMessage}>
            {"Women are often not well represented in medical research studies. Connect your Health app and donate data to help narrow the gap in women's health research."}
          </Text>
          <View style={styles.infoArea}>
            <Text style={styles.infoAreaTitle}>Participant Requirements</Text>
            <View style={styles.infoAreaListItem} >
              <Text style={styles.infoAreaItem}>•	 Female</Text>
              <Text style={styles.infoAreaItem}>•	 Not pregnant</Text>
              <Text style={styles.infoAreaItem}>•	 18-55 years old</Text>
            </View>
          </View>
          <View style={styles.infoArea}>
            <Text style={styles.infoAreaTitle}>Data Requirements</Text>
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
      </View >
    );
  }
}

Study1DefaultComponent.propTypes = {
  study: PropTypes.object,
  doJoinStudy: PropTypes.func.isRequired,
}