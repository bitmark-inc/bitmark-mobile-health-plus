import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, TouchableOpacity, Text, Image,
} from 'react-native';

import { config } from '../../configs';
import { Actions } from 'react-native-router-flux';
import { convertWidth, } from '../../utils';
import { constants } from '../../constants';

export class RecordImagesComponent extends Component {
  static propTypes = {
    images: PropTypes.array,
    issueImage: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = { type: 'combine' };
  }

  async continue() {
    if (this.state.type === 'combine') {
      Actions.orderCombineImages({ images: this.props.images, issueImage: this.props.issueImage });
    } else {
      for (let imageInfo of this.props.images) {
        let filePath = imageInfo.uri.replace('file://', '');
        this.props.issueImage(filePath, imageInfo.createdAt);
      }
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.body}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.button} onPress={Actions.pop}>
              <Image style={{ width: 20, height: 20, resizeMode: 'contain' }} source={require('../../../assets/imgs/back_icon_white.png')} />
            </TouchableOpacity>
            <Text style={styles.titleText}>Record types</Text>
            <Text />
          </View>
          <View style={{ flex: 1, padding: 20, }}>
            <TouchableOpacity style={styles.combineCheckbox} onPress={() => this.setState({ type: 'combine' })}>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <Image style={styles.typeIcon} source={require('../../../assets/imgs/record_combine_image_icon.png')} />
                <Text style={styles.typeText} >Combine all the photos into one document.</Text>
              </View>
              {this.state.type === 'combine' && <Image style={{ width: 30, height: 30, resizeMode: 'contain' }} source={require('../../../assets/imgs/checkbox_checked_icon.png')} />}
              {this.state.type !== 'combine' && <View style={{ width: 30, height: 30, borderWidth: 1, borderColor: 'white', borderRadius: 15, }} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.combineCheckbox} onPress={() => this.setState({ type: 'each' })}>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <Image style={styles.typeIcon} source={require('../../../assets/imgs/record_each_image_icon.png')} />
                <Text style={styles.typeText} >Each photo is a separate record.</Text>
              </View>
              {this.state.type === 'each' && <Image style={{ width: 30, height: 30, resizeMode: 'contain' }} source={require('../../../assets/imgs/checkbox_checked_icon.png')} />}
              {this.state.type !== 'each' && <View style={{ width: 30, height: 30, borderWidth: 1, borderColor: 'white', borderRadius: 15, }} />}
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.nextButton} onPress={this.continue.bind(this)}>
            <Text style={styles.nextButtonText}>NEXT</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'black',

  },
  header: {
    padding: 20, paddingTop: 20 + (config.isIPhoneX ? 44 : 22),
    width: '100%',
    flexDirection: 'row', justifyContent: 'space-between',
  },
  titleText: {
    fontSize: 18, fontWeight: '900', fontFamily: 'Avenir Black', color: 'white',
  },
  combineCheckbox: {
    width: '100%',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomColor: '#ADADAD', borderBottomWidth: 1,
    paddingBottom: 30,
    paddingTop: 30,
  },
  typeIcon: {
    width: 18, height: 24, resizeMode: 'contain'
  },
  typeText: {
    flex: 1,
    fontSize: 16, fontWeight: '900', fontFamily: 'Avenir Black', color: 'white',
    paddingLeft: 16, paddingRight: 16,
  },

  nextButton: {
    backgroundColor: '#FF4444', height: constants.buttonHeight,
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    width: convertWidth(335),
  },
  nextButtonText: {
    fontSize: 16, fontWeight: '900', fontFamily: 'Avenir Heavy', color: 'white',
  },

});