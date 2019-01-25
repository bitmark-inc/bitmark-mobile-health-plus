import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, View, Text, Image
} from 'react-native';

import PercentageCircle from 'react-native-percentage-circle';
import { numberWithCommas, percentToDegree } from "src/utils";


export class CirclePercentComponent extends Component {
  static propTypes = {
    percent: PropTypes.number,
    value: PropTypes.any,
    bottomText: PropTypes.string,
    radius: PropTypes.number,
    style: PropTypes.any,
    imageSource: PropTypes.any,
    imageStyle: PropTypes.any
  };

  render() {
    let radius = this.props.radius;
    let percent = this.props.percent;
    let value = this.props.value;
    const TOP_TEXT_HEIGHT = 30;
    const BOTTOM_TEXT_HEIGHT = 25;
    const TEXT_HEIGHT = TOP_TEXT_HEIGHT + BOTTOM_TEXT_HEIGHT;
    const BORDER_WIDTH = 3;

    // Calculate transformation
    let rotationDegree;
    if (percent > 100) {
      let overPercent = percent % 100;
      rotationDegree = percentToDegree(overPercent);
      // Trick to create the break
      percent = 100;
    }

    return (
      <View style={[{width: radius * 2, height: radius * 2 + TEXT_HEIGHT}, this.props.style]}>
        {/*Text*/}
        <View style={[styles.textContainer, {width: '100%', height: TOP_TEXT_HEIGHT}]}>
          <Text style={[styles.text, {color: "#0060F2"}]}>{numberWithCommas(value)}</Text>
        </View>

        {/*Percentage Circle*/}
        <View>
          <PercentageCircle radius={radius} percent={percent} borderWidth={BORDER_WIDTH} color={"#0060F2"} bgcolor={'transparent'} textStyle={[{color: 'transparent'}]}>
            {this.props.imageSource &&
            <Image style={[this.props.imageStyle]} source={this.props.imageSource}></Image>
            }
          </PercentageCircle>
        </View>

        {/*The Break*/}
        {rotationDegree &&
        <View style={[{transform: [{ rotate: `${rotationDegree}deg`}]}, {position: 'absolute', top: TOP_TEXT_HEIGHT}]}>
          <PercentageCircle radius={radius + 0.2} percent={1} borderWidth={BORDER_WIDTH} color={"#FFFFFF"} bgcolor={'transparent'} innerColor={'transparent'} textStyle={[{color: 'transparent'}]}>
            {this.props.imageSource &&
            <Image style={[this.props.imageStyle, {transform: [{ rotate: `${-rotationDegree}deg`}]}]} source={this.props.imageSource}></Image>
            }
          </PercentageCircle>
        </View>
        }

        {/*Inner Circle*/}
        <View style={[styles.innerCircle, {width: (radius - BORDER_WIDTH) * 2, height: (radius - BORDER_WIDTH) * 2, borderRadius: (radius - BORDER_WIDTH) , bottom: BORDER_WIDTH + BOTTOM_TEXT_HEIGHT, left: BORDER_WIDTH}]}></View>

        {/*Bottom*/}
        <View style={[styles.bottomArea, {width: '100%', height: BOTTOM_TEXT_HEIGHT}]}>
          <Text style={[styles.bottomText]}>{this.props.bottomText}</Text>
        </View>
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
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.5,
  },

  bottomArea: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  bottomText: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.5,
    color: '#A3A9B3'
  },
});
