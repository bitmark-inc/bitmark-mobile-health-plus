import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, Animated, TouchableOpacity, Text
} from 'react-native';

let charString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export class CharacterFlapperComponent extends Component {
  static propTypes = {
    char: PropTypes.string,
    charStyle: PropTypes.any,
  }
  constructor(props) {
    super(props);
    this.loadFlaperAnimation = this.loadFlaperAnimation.bind(this);
    this.loadChar = this.loadChar.bind(this);
    this.loadFlapper = this.loadFlapper.bind(this);
    this.state = {
      char: this.props.char,
      rotate: new Animated.Value(0),
      index: 0,
    };
  }

  async loadChar(char) {
    this.setState({ char });
    await this.loadFlaperAnimation();
  }

  loadFlaperAnimation() {
    return new Promise((resolve) => {
      Animated.spring(this.state.rotate, {
        toValue: this.state.rotate.__getValue() === 360 ? 0 : 360,
        speed: 2
      }).start(resolve);
    })
  }

  async loadFlapper(finalChar) {
    let randomChars = [];
    // randomChars.push(charString[Math.floor(Math.random() * 26)]);
    randomChars.push(finalChar);
    let changeText = async (index) => {
      if (index < randomChars.length) {
        await this.loadChar(randomChars[index]);
        await changeText(index + 1);
      }
    };
    this.loadFlaperAnimation();
    await changeText(0);
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
            { rotateX: rotate },
          ]
        }]}>{this.state.char}</Animated.Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bodyContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  char: {
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
        <CharacterFlapperComponent ref={ref => this.refFlapper = ref} char={'A'} />
        <TouchableOpacity style={{
          marginTop: 200, width: '100%',
          alignContent: 'center', justifyContent: 'center',
          borderWidth: 1,
        }} onPress={() => this.refFlapper.loadFlapper(charString[Math.floor(Math.random() * 26)])}>
          <Text style={{ textAlign: 'center' }}>Test</Text>
        </TouchableOpacity>
      </View>
    );
  }
}