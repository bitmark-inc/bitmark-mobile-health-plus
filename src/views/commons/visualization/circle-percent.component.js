import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, View, Text, Image
} from 'react-native';

import PercentageCircle from 'react-native-percentage-circle';


export class CirclePercentComponent extends Component {
  static propTypes = {
    percent: PropTypes.number,
    radius: PropTypes.number,
    negative: PropTypes.bool,
    style: PropTypes.any,
    imageSource: PropTypes.any,
    imageStyle: PropTypes.any
  };

  render() {
    let radius = this.props.radius;
    let percent = this.props.percent;
    let negative = this.props.negative;
    const TEXT_HEIGHT = 30;
    const BORDER_WIDTH = 3;

    return (
      <View style={[{width: radius * 2, height: radius * 2 + TEXT_HEIGHT}, this.props.style]}>
        {/*Text*/}
        <View style={[styles.textContainer, {width: '100%', height: TEXT_HEIGHT}]}>
          <Text style={[styles.text, {color: negative ? "#FF003C" : "#5FD855"}]}>{(negative ? '-' : '+') + `${percent}%`}</Text>
        </View>

        {/*Percentage Circle*/}
        <PercentageCircle radius={radius} percent={percent > 100 ? 100 : percent } borderWidth={BORDER_WIDTH} color={negative ? "#FF003C" : "#5FD855"} bgcolor={'transparent'} textStyle={[{color: 'transparent'}]}>
          {this.props.imageSource &&
          <Image style={this.props.imageStyle} source={this.props.imageSource}></Image>
          }
        </PercentageCircle>

        {/*Inner Circle*/}
        <View style={[styles.innerCircle, {width: (radius - BORDER_WIDTH) * 2, height: (radius - BORDER_WIDTH) * 2, borderRadius: (radius - BORDER_WIDTH) , bottom: BORDER_WIDTH, left: BORDER_WIDTH}]}></View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  innerCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)'
  },

  textContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },

  text: {
    fontFamily: 'Andale Mono',
    fontSize: 20,
    lineHeight: 20,
  }
});
