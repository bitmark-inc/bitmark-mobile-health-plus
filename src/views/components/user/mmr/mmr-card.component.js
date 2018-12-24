import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, Text, Image
} from 'react-native';
import { convertWidth } from 'src/utils';


export class MMRCardComponent extends Component {
  static propTypes = {

  };
  render() {
    return (
      <View style={styles.body}>
        <View style={styles.bodyContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTitle}>GET STARTED</Text>
            <Image style={styles.cardHeaderImage} source={require('assets/imgs/mmr_setup_icon.png')} />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    width: convertWidth(344), minHeight: 224,
    shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.2, shadowColor: '#000000', shadowRadius: 5,
    borderWidth: 1, borderRadius: 4, borderColor: '#F4F2EE',
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    width: "100%",
    backgroundColor: 'white',
    padding: convertWidth(16), paddingBottom: convertWidth(20),
  },
  cardHeader: {
    flexDirection: 'row',
    height: 40,
  },
  cardHeaderTitle: {

  },
  cardHeaderImage: {
    width: 34, height: '100%', resizeMode: 'contain'
  }

});
