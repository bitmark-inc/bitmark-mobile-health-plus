import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity,
} from 'react-native'

import styles from './study-settings.component.style';

export class StudyThankYouComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={styles.main}>
        <Text style={[styles.thankYouTitle, {}]}>YOU JOINED THE STUDY LED BY {this.props.study.researcherName.replace(', Doctoral Candidate', '').toUpperCase()}</Text>
        <Text style={styles.thankYouDescription}>Let’s see if there are any tasks for you to complete. </Text>
        <View style={styles.bottomButtonArea}>
          <TouchableOpacity style={[styles.bottomButton]} onPress={() => this.props.doFinish()}>
            <Text style={styles.bottomButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

StudyThankYouComponent.propTypes = {
  study: PropTypes.object,
  userInformation: PropTypes.object,
  doFinish: PropTypes.func,
};