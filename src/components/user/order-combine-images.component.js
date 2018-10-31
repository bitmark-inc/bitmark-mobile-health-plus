import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, TouchableOpacity, Text, Image, ScrollView,
} from 'react-native';
import SortableGrid from 'react-native-sortable-grid';

import { config } from '../../configs';
import { Actions } from 'react-native-router-flux';
import { convertWidth, } from '../../utils';
import { constants } from '../../constants';
import { AppProcessor } from '../../processors';
import { EventEmitterService } from '../../services';
import moment from 'moment';

export class OrderCombineImagesComponent extends Component {
  static propTypes = {
    images: PropTypes.array,
    doIssueImage: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = { type: 'combine', scrollEnabled: true, itemOrder: null, };
  }

  async continue() {
    let newImages = [];
    if (this.state.itemOrder) {
      for (let item of this.state.itemOrder) {
        newImages.push(this.props.images[item.key]);
      }
    } else {
      newImages = this.props.images;
    }

    AppProcessor.doCombineImages(newImages).then((filePath) => {
      this.props.doIssueImage([{ uri: `file://${filePath}`, createAt: moment() }]);
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    })
  }

  newOrder({ itemOrder }) {
    this.setState({ scrollEnabled: true, itemOrder: itemOrder });
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.body}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.button} onPress={Actions.pop}>
              <Image style={{ width: 20, height: 20, resizeMode: 'contain' }} source={require('../../../assets/imgs/back_icon_white.png')} />
            </TouchableOpacity>
            <Text style={styles.titleText}>{i18n.t('OrderCombineImagesComponent_titleText')}</Text>
            <Text />
          </View>
          <View style={{ flex: 1, padding: 20, paddingTop: 0, }}>
            <Text style={styles.message}>{i18n.t('OrderCombineImagesComponent_message')}</Text>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} scrollEnabled={this.state.scrollEnabled}>

              <SortableGrid
                style={{ flex: 1, width: convertWidth(375), }}
                itemsPerRow={3}
                onDragRelease={this.newOrder.bind(this)}
                onDragStart={() => this.setState({ scrollEnabled: false })} >
                {
                  this.props.images.map((imageInfo, index) =>
                    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, }} key={index} >
                      <Image style={{ width: convertWidth(109), height: convertWidth(109), resizeMode: 'contain' }} source={{ uri: imageInfo.uri }} />
                    </View>
                  )
                }
              </SortableGrid>
            </ScrollView>

          </View>
          <TouchableOpacity style={styles.nextButton} onPress={this.continue.bind(this)}>
            <Text style={styles.nextButtonText}>{i18n.t('OrderCombineImagesComponent_nextButtonText')}</Text>
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
  message: {
    width: convertWidth(375), textAlign: 'center',
    fontSize: 16, fontWeight: '300', fontFamily: 'Avenir Light', color: 'white',
    marginBottom: 10,
  },

  nextButton: {
    backgroundColor: '#FF4444', height: constants.buttonHeight,
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    width: convertWidth(335),
    marginBottom: config.isIPhoneX ? 44 : 20,
  },
  nextButtonText: {
    fontSize: 16, fontWeight: '900', fontFamily: 'Avenir Heavy', color: 'white',
  },

});