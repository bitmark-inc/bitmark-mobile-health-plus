import React from 'react';
import PropTypes from 'prop-types';
import {
  View, TouchableOpacity, Image, Text
} from 'react-native';

import { BitmarkComponent } from './../../../../commons/components';

import propertyDetailStyle from './asset-image-content.componentstyle';
import defaultStyle from './../../../../commons/styles';
import { AppProcessor } from '../../../../processors';

// let ComponentName = 'AssetImageContentComponent';
export class AssetImageContentComponent extends React.Component {
  constructor(props) {
    super(props);
    let bitmarkId = this.props.navigation.state.params.bitmarkId;
    this.doGetScreenData(bitmarkId);
    this.state = {
      filePath: null,
    }
  }
  doGetScreenData(bitmarkId) {

    AppProcessor.doDownloadBitmark(bitmarkId).then(filePath => {
      console.log('doDownloadBitmark :', filePath);
      this.setState({ filePath });
    }).catch(error => {
      console.log('doDownloadBitmark  error :', error);
      this.props.navigation.goBack();
    });
  }


  render() {
    return (
      <BitmarkComponent
        backgroundColor='black'
        header={(<View style={[defaultStyle.header, { backgroundColor: 'black' }]}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={[defaultStyle.headerLeftIcon, { width: 16, height: 16 }]} source={require('./../../../../../assets/imgs/close-icon-white.png')} />
          </TouchableOpacity>
          <View style={defaultStyle.headerCenter}>
            <Text style={[defaultStyle.headerTitle, { color: 'white' }]}>HEALTH DATA</Text>
          </View>
          <TouchableOpacity style={defaultStyle.headerRight} />
        </View>)}
        content={(<View style={propertyDetailStyle.body}>
          {this.state.filePath && <View style={propertyDetailStyle.bodyContent}>
            <Image
              style={propertyDetailStyle.imageContent}
              source={{ uri: this.state.filePath }}
            />
            {/* <Image style={propertyDetailStyle.imageContent} source={require('./../../../../../assets/imgs/card-berkeley.png')} /> */}
          </View>}
        </View>)}
      />
    );
  }
}

AssetImageContentComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
    state: PropTypes.shape({
      params: PropTypes.shape({
        bitmarkId: PropTypes.string,
      }),
    }),
  }),
}