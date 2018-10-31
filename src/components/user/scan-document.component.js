import React from 'react';
import PropTypes from 'prop-types';
import DocumentScanner from 'react-native-document-scanner';

import {
  View, SafeAreaView, Image,
  StyleSheet,
} from 'react-native';
import { convertWidth } from '../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';

export class ScanDocumentComponent extends React.Component {
  static propTypes = {
    token: PropTypes.string,
  };
  constructor(props) {
    super(props);

  }


  render() {
    return (<SafeAreaView style={styles.bodySafeView}>
      <View style={styles.body}>
        {(!this.state || !this.state.croppedImage) && <DocumentScanner
          style={{ flex: 1, }}
          onPictureTaken={data => this.setState(data)}
          overlayColor="rgba(255,130,0, 0.7)"
          enableTorch={false}
          brightness={0.3}
          saturation={1}
          contrast={1.1}
          quality={0.5}
          onRectangleDetect={({ stableCounter, lastDetectionType }) => console.log('onRectangleDetect :', stableCounter, lastDetectionType)}
          detectionCountBeforeCapture={5}
          detectionRefreshRateInMS={50}
        />}
        {this.state && this.state.croppedImage && <Image style={{ flex: 1, }} source={{ uri: this.state.croppedImage }} />}
      </View>
    </SafeAreaView>);
  }
}

const styles = StyleSheet.create({
  bodySafeView: {
    flex: 1,
    backgroundColor: 'white',
  },
  body: {
    padding: convertWidth(16),
    paddingTop: convertWidth(16) + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
    flex: 1,
  },

});
