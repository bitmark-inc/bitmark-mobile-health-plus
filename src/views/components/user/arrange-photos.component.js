import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, TouchableOpacity, Text, Image, ScrollView, SafeAreaView, KeyboardAvoidingView,
} from 'react-native';
import SortableGrid from 'react-native-sortable-grid';

import { Actions } from 'react-native-router-flux';
import { convertWidth } from 'src/utils';
import { ShadowTopComponent, ShadowComponent } from "src/views/commons";
import { config } from 'src/configs';


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
    };
  }

  changeData({ uri, index }) {
    uri = uri || this.state.uri;
    this.setState({ uri, index });
  }

  render() {
    return (<View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, }}  >
      <View style={{
        position: 'absolute', bottom: 10, right: 10, height: convertWidth(24), width: convertWidth(24),
        backgroundColor: 'rgba(255, 0, 60, 0.3)',
        alignItems: 'center', justifyContent: 'center',
        borderRadius: convertWidth(12),
        zIndex: 1,
      }}>
        <Text style={{ fontFamily: 'AvenirNextW1G-Bold', color: 'white', flex: 1, fontSize: 12, lineHeight: 20, marginTop: 1 }}>{this.state.index + 1}</Text>
      </View>
      <Image style={{ width: convertWidth(100), height: convertWidth(100), resizeMode: 'cover', borderRadius: 4 }} source={{ uri: this.state.uri }} />
    </View>);
  }
}

export class ArrangePhotosComponent extends Component {
  static propTypes = {
    images: PropTypes.array,
    doIssueImage: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = { scrollEnabled: true, itemOrder: null };
    this.itemOrderImageRefs = {};
  }

  continue() {
    let newImages = [];
    if (this.state.itemOrder) {
      for (let item of this.state.itemOrder) {
        newImages.push(this.props.images[item.key]);
      }
    } else {
      newImages = this.props.images;
    }

    Actions.editIssue({ images: newImages, doIssueImage: this.props.doIssueImage });
  }

  newOrder({ itemOrder }) {
    this.setState({ scrollEnabled: true, itemOrder: itemOrder });
    for (let index in this.itemOrderImageRefs) {
      this.itemOrderImageRefs[itemOrder[index].key].changeData({ index: itemOrder[index].order })
    }
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>

        {/*HEADER*/}
        <View style={[styles.header]}>
          {/*Back icon*/}
          <TouchableOpacity style={{ paddingLeft: convertWidth(16), paddingRight: 4, }} onPress={Actions.pop}>
            <Image style={{ width: 20, height: 20, resizeMode: 'contain' }} source={require('assets/imgs/back-icon-black.png')} />
          </TouchableOpacity>
          {/*Title*/}
          <Text style={styles.titleText}>Edit record details</Text>

          <TouchableOpacity style={{ paddingRight: convertWidth(16) }} onPress={this.continue.bind(this)}>
            <Text style={styles.headerRightText}>NEXT</Text>
          </TouchableOpacity>
        </View>

        {/*CONTENT*/}
        <KeyboardAvoidingView behavior="padding" enabled style={styles.body} keyboardVerticalOffset={this.state.inputtingTag ? (88 + config.isIPhoneX ? 44 : 0) : 0} >
          <ScrollView style={{ flex: 1, width: '100%', }} contentContainerStyle={{
            flexGrow: 1,
            paddingLeft: convertWidth(16), paddingRight: convertWidth(16), paddingTop: 5,
          }}>
            <ShadowComponent style={{ margin: 2 }}>
              <View style={[styles.section]}>
                {/*Top bar*/}
                <ShadowTopComponent style={[styles.topBar]}>
                  <Text style={[styles.sectionTitle]}>ATTACHED DOCUMENTS</Text>
                </ShadowTopComponent>

                {/*Content*/}
                <View style={[styles.contentContainer, {paddingBottom: 32}]}>
                  <Text style={styles.introductionTitle}>Arrange the photos</Text>
                  <View style={[{flexDirection: 'row', width: '100%', alignItems: 'center', marginTop: 5}]}>
                    <Image style={[styles.arrangeIcon, {marginRight: 5}]} source={require('assets/imgs/arrange-icon.png')} />
                    <Text style={styles.introductionDescription}>Drag and drop to rearrange photos.</Text>
                  </View>

                  {/*Images*/}
                  <ScrollView contentContainerStyle={{ flexGrow: 1, marginTop: 25, }} scrollEnabled={this.state.scrollEnabled}>
                    <SortableGrid
                      style={{ flex: 1, width: convertWidth(305), }}
                      itemsPerRow={3}
                      onDragRelease={this.newOrder.bind(this)}
                      onDragStart={() => this.setState({ scrollEnabled: false })} >
                      {
                        this.props.images.map((imageInfo, index) => {
                          return (<ItemOrderImageComponent uri={imageInfo.uri} index={index} key={index} ref={(ref) => {
                            if (this.state.itemOrder) {
                              this.itemOrderImageRefs[this.state.itemOrder[index].key] = ref;
                            } else {
                              this.itemOrderImageRefs[index] = ref
                            }
                          }} />);
                        })
                      }
                    </SortableGrid>
                  </ScrollView>
                </View>
              </View>
            </ShadowComponent>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1, flexDirection: 'column', alignItems: 'center',
    backgroundColor: 'white',
  },
  header: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRightText: {
    fontSize: 18,
    fontFamily: 'AvenirNextW1G-Bold',
    textAlign: 'right',
    color: '#FF003C',
  },
  titleText: {
    fontSize: 20,
    fontFamily: 'AvenirNextW1G-Bold', textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  section: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
  },
  topBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',
    height: 40,
  },
  sectionTitle: {
    paddingLeft: convertWidth(16), paddingRight: convertWidth(16),
    fontSize: 10,
    fontFamily: 'AvenirNextW1G-Bold',
    letterSpacing: 1.5,
    color: '#000000'
  },
  contentContainer: {
    width: '100%',
    padding: convertWidth(16),
  },
  introductionTitle: {
    fontSize: 18,
    fontFamily: 'AvenirNextW1G-Bold',
    color: 'rgba(0, 0, 0, 0.87)'
  },
  introductionDescription: {
    fontSize: 14,
    fontFamily: 'AvenirNextW1G-Regular',
    letterSpacing: 0.25,
    color: 'rgba(0, 0, 0, 0.6)',
    marginTop: 6,
  },
  arrangeIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain'
  },
});