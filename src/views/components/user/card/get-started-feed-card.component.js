import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image,
  StyleSheet,
} from 'react-native'

import { convertWidth } from 'src/utils';

export class GetStartedFeedCardComponent extends React.Component {
  static propTypes = {
    cardIconSource: PropTypes.any,
    cardHeader: PropTypes.string,
  };

  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={[styles.cardContainer]}>
        {/*TOP BAR*/}
        <View style={[styles.cardTopBar]}>
          <Text style={[styles.cardTitle]}>GET STARTED</Text>
          <Image style={styles.cardIcon} source={this.props.cardIconSource} />
        </View>

        {/*CONTENT*/}
        <View style={[styles.cardContent]}>
          <Text style={[styles.cardHeader]}>{this.props.cardHeader}</Text>
        </View>

        {/*BOTTOM BAR*/}
        <View style={[styles.cardBottomBar]}>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: '#FBC9D5',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    paddingBottom: 16,
  },
  cardTopBar: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardTitle: {
    marginTop: 16,
    fontFamily: 'AvenirNextW1G-Light',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.87)',
    letterSpacing: 1.5,
  },
  cardIcon: {
    width: 26,
    height: 33,
    resizeMode: 'contain'
  },
  cardContent: {
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
  },
  cardHeader: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 24,
    color: 'rgba(0, 0, 0, 0.87)'
  },
  cardBottomBar: {
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  }
});