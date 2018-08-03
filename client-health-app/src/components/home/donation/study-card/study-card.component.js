import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, ImageBackground,
} from 'react-native';

import cardStyles from './study-card.component.style';

export class StudyCardComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      duration: this.props.duration,
    };
  }
  // ==========================================================================================
  componentWillReceiveProps(nextProps) {
    this.setState({
      duration: nextProps.duration,
    });
  }
  // ==========================================================================================
  render() {
    return (
      <View style={[cardStyles.body, this.props.style]}>
        <View style={cardStyles.scale}>
          <ImageBackground style={cardStyles.cardBackground} source={require('./../../../../../assets/imgs//card-berkeley.png')}>
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
              {this.state.duration}
            </Text>
          </ImageBackground>
        </View>
      </View>
    );
  }
}

StudyCardComponent.propTypes = {
  duration: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  joined: PropTypes.bool,
  interval: PropTypes.string,
  style: PropTypes.object,
}