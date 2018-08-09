import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, ImageBackground, Image,
} from 'react-native';

import cardStyles from './study-card.component.style';

export class StudyCardComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  // ==========================================================================================
  render() {
    return (
      <View style={[cardStyles.body, this.props.style]}>
        <View style={cardStyles.scale}>
          <ImageBackground style={cardStyles.cardBackground} source={require('./../../../../../assets/imgs//card-berkeley.png')}>
            <Image style={cardStyles.researcherImage} source={this.props.researcherImage} />
            {this.props.displayStatus && <View style={[cardStyles.studyStatus, { opacity: this.props.joined ? 0.8 : 1 }]}>
              <Text style={cardStyles.studyStatusText}>{this.props.joined ? 'JOINED' : 'JOIN'}</Text>
            </View>}
            <Text style={cardStyles.title}>
              {this.props.title}
            </Text>
            <Text style={cardStyles.description}>
              {this.props.description}
            </Text>
            <Text style={cardStyles.frequency}>
              {this.props.joined ? 'YOUR DONATION FREQUENCY' : 'DONATION FREQUENCY'}
            </Text>
            <Text style={cardStyles.frequencyValue}>
              {this.props.interval.toUpperCase()}
            </Text>
            <Text style={cardStyles.durationLabel}>
              {this.props.joined ? 'YOUR DURATION OF STUDY' : 'DURATION OF STUDY'}
            </Text>
            <Text style={cardStyles.durationValue}>
              {this.props.duration}
            </Text>
          </ImageBackground>
        </View>
      </View>
    );
  }
}

StudyCardComponent.propTypes = {
  researcherImage: PropTypes.any,
  displayStatus: PropTypes.bool,
  duration: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  joined: PropTypes.bool,
  interval: PropTypes.string,
  style: PropTypes.object,
}