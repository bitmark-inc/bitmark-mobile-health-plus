import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image,
  StyleSheet,
} from 'react-native'

import { convertWidth } from 'src/utils';

export class GetStartedCardComponent extends React.Component {
  static propTypes = {
    cardIconSource: PropTypes.any,
    cardHeader: PropTypes.string,
    cardText: PropTypes.string,
    cardTopBarStyle: PropTypes.any,
    isStickCard: PropTypes.bool,
    cardNextIconSource: PropTypes.any,
  };

  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={[styles.cardContainer]}>
        {/*TOP BAR*/}
        <View style={[styles.cardTopBar, this.props.cardTopBarStyle]}>
          <Text style={[styles.cardTitle]}>GET STARTED</Text>
          <Image style={styles.cardIcon} source={this.props.cardIconSource} />
        </View>

        {/*CONTENT*/}
        <View style={[styles.cardContent]}>
          <Text style={[styles.cardHeader]}>{this.props.cardHeader}</Text>
          <Text style={[styles.cardText]}>{this.props.cardText}</Text>
        </View>

        {/*BOTTOM BAR*/}
        {this.props.isStickCard &&
          <View style={[styles.cardBottomBar]}>
            <Image style={styles.cardNextIcon} source={this.props.cardNextIconSource} />
          </View>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: 255,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: '#F4F2EE',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    paddingBottom: 16,
  },
  cardTopBar: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
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
    flex: 1,
    marginTop: 16,
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
  },
  cardHeader: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 24,
    lineHeight: 36,
    color: 'rgba(0, 0, 0, 0.87)',
    letterSpacing: 0.15,
  },
  cardText: {
    marginTop: 10,
    fontFamily: 'AvenirNextW1G-Regular',
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    letterSpacing: 0.25,
  },
  cardBottomBar: {
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  cardNextIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  }
});