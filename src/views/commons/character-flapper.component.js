import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, Text, Animated,
} from 'react-native';

let charString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export class CharacterFlapperComponent extends Component {
  static propTypes = {
    char: PropTypes.string,
    charStyle: PropTypes.any,
  }
  constructor(props) {
    super(props);
    this.state = {
      char: this.props.char,
      finalChar: this.props.char,
      rotate: Animated.Value(0)
    };
  }

  componentDidMount() {

  }

  loadChar(char) {
    this.setState({ char });
  }

  loadFirstHalfFlaperAnimation() {

  }
  loadSecondHalfFlaperAnimation() {

  }

  loadFlapper(finalChar) {
    finalChar = finalChar || this.props.char;
    this.setState({ finalChar });
  }

  render() {
    return (
      <View style={styles.bodyContent}>
        <Animated.View style={{
          transform: [
            { scale: this.state.scale },
            {
              rotate: this.state.rotate.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "360deg"]
              })
            },
          ]
        }}>
          <Text style={[styles.char, this.props.charStyle]}>{this.state.char}</Text>
        </Animated.View >
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bodyContent: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  char: {
    fontWeight: '900',
  }
});

export class TestCharacterFlapperComponent extends Component {
  static propTypes = {
    char: PropTypes.string,
    charStyle: PropTypes.any,
  }
  render() {
    return (
      <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center', }}>
        <CharacterFlapperComponent char={'A'} />
      </View>
    );
  }
}