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


class ItemOrderImageComponent extends Component {
  static propTypes = {
    uri: PropTypes.string,
    index: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.state = {
      index: this.props.index,
      uri: this.props.uri,
    }
  }

  changeData({ uri, index }) {
    uri = uri || this.state.uri;
    this.setState({ uri, index });
  }

  render() {
    return (<View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, }}  >
      <View style={{
        position: 'absolute', bottom: 10, right: 10, height: convertWidth(15), width: convertWidth(15),
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        alignItems: 'center', justifyContent: 'center',
        borderRadius: convertWidth(7.5), borderWidth: 1, borderColor: 'rgba(0,0,0,0)',
        zIndex: 1,
      }}>
        <Text style={{ color: 'white', flex: 1, fontSize: 10, }}> {this.state.index + 1}</Text>
      </View>
      <Image style={{ width: convertWidth(109), height: convertWidth(109), resizeMode: 'cover' }} source={{ uri: this.state.uri }} />
    </View>);
  }
}

export class OrderCombineImagesComponent extends Component {
  static propTypes = {
    images: PropTypes.array,
    doIssueImage: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = { type: 'combine', scrollEnabled: true, itemOrder: null, };
    this.itemOrderImageRefs = {};
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
      this.props.doIssueImage([{ uri: `file://${filePath}`, createAt: moment() }], newImages);
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    })
  }

  newOrder({ itemOrder }) {
    this.setState({ scrollEnabled: true, itemOrder: itemOrder });
    for (let index in this.itemOrderImageRefs) {
      this.itemOrderImageRefs[index].changeData({ index: parseInt(itemOrder[index].key) })
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
                  this.props.images.map((imageInfo, index) => {
                    return (<ItemOrderImageComponent uri={imageInfo.uri} index={index} key={index} ref={(ref) => this.itemOrderImageRefs[index] = ref} />);
                  })
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
    fontSize: 18, fontWeight: '900', fontFamily: config.localization.startsWith('vi') ? null : 'Avenir Black', color: 'white',
  },
  message: {
    width: convertWidth(375), textAlign: 'center',
    fontSize: 16, fontWeight: '300', fontFamily: config.localization.startsWith('vi') ? null : 'Avenir Light', color: 'white',
    marginBottom: 10,
  },

  nextButton: {
    backgroundColor: '#FF4444', height: constants.buttonHeight,
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    width: convertWidth(335),
    marginBottom: config.isIPhoneX ? 44 : 20,
  },
  nextButtonText: {
    fontSize: 16, fontWeight: '900', fontFamily: config.localization.startsWith('vi') ? null : 'Avenir Heavy', color: 'white',
  },

});