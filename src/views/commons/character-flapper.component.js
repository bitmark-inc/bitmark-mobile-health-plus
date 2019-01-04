import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, Animated,
} from 'react-native';

let charString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export class CharacterFlapperComponent extends Component {
  static propTypes = {
    char: PropTypes.string,
    charStyle: PropTypes.any,
  }
  constructor(props) {
    super(props);
    this.loadFirstHalfFlaperAnimation = this.loadFirstHalfFlaperAnimation.bind(this);
    this.loadSecondHalfFlaperAnimation = this.loadSecondHalfFlaperAnimation.bind(this);
    this.loadChar = this.loadChar.bind(this);
    this.changeToChar = this.changeToChar.bind(this);
    this.state = {
      char: this.props.char,
      finalChar: this.props.char,
      rotate: new Animated.Value(0),
      index: 0,
    };
  }

  componentDidMount() {
    this.changeToChar('H');
  }

  changeToChar(finalChar) {
    let finalIndex = charString.indexOf(finalChar);
    if (finalChar >= 0) {

      let changeText = async (index) => {
        if (index < charString.length) {
          await this.loadChar(charString[index]);
          if (index !== finalIndex) {
            changeText(index === (charString.length - 1) ? 0 : (index + 1));
          }
        }
      };
      let index = charString.indexOf(this.state.char);
      changeText(index === (charString.length - 1) ? 0 : (index + 1));
    }
  }

  async loadChar(char) {
    await this.loadFirstHalfFlaperAnimation();
    this.setState({ char });
    await this.loadSecondHalfFlaperAnimation();
  }

  loadFirstHalfFlaperAnimation() {
    return new Promise((resolve) => {
      Animated.spring(this.state.rotate, {
        toValue: 90,
        duration: 10,
      }).start(resolve);
    })

  }
  loadSecondHalfFlaperAnimation() {
    return new Promise((resolve) => {
      Animated.spring(this.state.rotate, {
        toValue: 360,
        duration: 30,
      }).start(resolve);
    });
  }

  loadFlapper(finalChar) {
    finalChar = finalChar || this.props.char;
    this.setState({ finalChar });
  }

  render() {
    let rotate = this.state.rotate.interpolate({
      inputRange: [0, 360],
      outputRange: ["0deg", "360deg"]
    });
    return (
      <View style={styles.bodyContent}>
        <Animated.Text style={[styles.char, this.props.charStyle, {
          transform: [
            { rotateX: rotate }
          ]
        }]}>{this.state.char}</Animated.Text>
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
    fontSize: 50,
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