import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Image, Text, Share
} from 'react-native';

import { BitmarkComponent } from './../../../../commons/components';

import style from './asset-image-content.component.style';
import defaultStyle from './../../../../commons/styles';
import { AppProcessor } from '../../../../processors';
import { EventEmitterService } from '../../../../services';
import { BitmarkOneTabButtonComponent } from '../../../../commons/components/bitmark-button';

// let ComponentName = 'AssetImageContentComponent';
export class AssetImageContentComponent extends React.Component {
  constructor(props) {
    super(props);
    let bitmarkId = this.props.navigation.state.params.bitmarkId;
    let assetName = this.props.navigation.state.params.assetName;
    this.doGetScreenData(bitmarkId);
    this.state = {
      filePath: null,
      assetName
    }
  }

  doGetScreenData(bitmarkId) {
    AppProcessor.doDownloadBitmark(bitmarkId, {
      indicator: true, title: 'Preparing your data...'
    }).then(filePath => {
      this.setState({ filePath });
    }).catch(error => {
      console.log('doDownloadBitmark  error :', error);
      this.props.navigation.goBack();
    });
  }

  saveAsset(filePath) {
    EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, true);
    Share.share({ title: this.state.assetName, url: filePath })
      .then((data) => {
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
        console.log('data:', data);
      })
      .catch((error) => {
        EventEmitterService.emit(EventEmitterService.events.APP_PROCESSING, false);
        console.log('error:', error);
      });
  }

  render() {
    return (
      <BitmarkComponent
        backgroundColor='black'
        header={(<View style={[defaultStyle.header, { backgroundColor: 'black' }]}>
          <BitmarkOneTabButtonComponent style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={[defaultStyle.headerLeftIcon, { width: 16, height: 16 }]} source={require('./../../../../../assets/imgs/close-icon-white.png')} />
          </BitmarkOneTabButtonComponent>
          <View style={defaultStyle.headerCenter}>
            <Text style={[defaultStyle.headerTitle, { color: 'white' }]}>CAPTURED ASSET</Text>
          </View>
          <BitmarkOneTabButtonComponent style={[defaultStyle.headerRight, style.headerRight]} onPress={() => this.saveAsset(this.state.filePath)}>
            <Text style={[defaultStyle.headerRightText, { color: 'white' }]}>Download</Text>
          </BitmarkOneTabButtonComponent>
        </View>)}
        content={(<View style={style.body}>
          {this.state.filePath &&
            <View style={style.bodyContent}>
              <View style={style.imageContainer}>
                <Image
                  style={style.imageContent}
                  source={{ uri: this.state.filePath }}
                />
              </View>
            </View>
          }
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
        assetName: PropTypes.string,
      }),
    }),
  }),
}