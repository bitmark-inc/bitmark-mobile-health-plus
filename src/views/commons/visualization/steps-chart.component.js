import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, View, Text, Dimensions,
} from 'react-native';

export class StepsChartComponent extends Component {
  static propTypes = {
    dataSource: PropTypes.any,
    height: PropTypes.number,
    style: PropTypes.any
  };

  constructor(props) {
    super(props);
  }

  populateChartData(dataSource, chartHeight) {
    chartHeight = chartHeight - 50;
    const CHART_UNIT = 100.0;

    let maxValue = 0;
    dataSource.forEach((item) => {
      if (item.value && (item.value > maxValue)) maxValue = item.value;
    });

    let maxUnit = maxValue / CHART_UNIT;
    let heightPerUnit =  chartHeight / maxUnit;

    let chartData = dataSource.map(item => {
      return {
        label: item.label,
        value: item.value,
        valueFontSize: maxValue > 9999 ? this.calculateFontSizeByScreenSize() : 10,
        isMissing: item.isMissing,
        isActive: item.isActive,
        height: item.isMissing ? 0 : (item.value / CHART_UNIT) * heightPerUnit
      }
    });

    return chartData;
  }

  calculateFontSizeByScreenSize() {
    let fontSize;
    let screenWidth = Dimensions.get('window').width;

    if (screenWidth > 375) {
      fontSize = 10;
    } else if (screenWidth > 320) {
      fontSize = 9;
    } else {
      fontSize = 7;
    }

    return fontSize;
  }

  render() {
    let chartHeight = this.props.height;
    let chartData = this.populateChartData(this.props.dataSource, chartHeight);

    return (
      <View style={[styles.chartContainer, {width: '100%', height: chartHeight}, this.props.style]}>
        {(chartData && chartData.length) ? (
          (chartData).map((item, index) => {
            return (
              <View key={index} style={[styles.barItemContainer, {marginLeft: index == 0 ? 0 : 4}]}>
                {!item.isMissing &&
                <Text style={[styles.topBarText, {fontSize: item.valueFontSize}]}>{item.value}</Text>
                }

                {!item.isMissing &&
                <View style={[styles.bar, {height: item.height}]}></View>
                }

                <View style={[styles.bottomBar]}>
                  {item.isActive ? (
                    <View style={[styles.circleContainer]}>
                      <Text style={[styles.axisXText, {color: '#FFFFFF', marginTop: 0, marginLeft: 2}]}>{item.label}</Text>
                    </View>
                  ) : (
                    <Text style={styles.axisXText}>{item.label}</Text>
                  )
                  }
                </View>
              </View>
            );
          })
        ) : null
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  chartContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },

  barItemContainer: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  bar: {
    width: '100%',
    backgroundColor: '#F5FBFF',
    borderTopWidth: 1,
    borderTopColor: '#0060F2'
  },

  bottomBar: {
    height: 25,
    justifyContent: 'center',
  },

  topBarText: {
    fontFamily: 'AvenirNextW1G-Light',
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.5,
    color: '#0060F2',
    textAlign: 'center',
    marginBottom: 5,
  },

  axisXText: {
    fontFamily: 'AvenirNextW1G-Light',
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.5,
    color: 'rgba(0, 0, 0, 0.87)',
    textAlign: 'center',
  },

  circleContainer: {
    width: 18,
    height: 18,
    borderRadius: 18/2,
    backgroundColor: '#0060F2',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
