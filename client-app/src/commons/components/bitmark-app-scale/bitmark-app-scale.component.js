import React from 'react';
import PropTypes from 'prop-types';
import ReactNative from 'react-native';
const {
  View,
  Dimensions,
  StatusBarIOS,
  NativeModules,
  Platform,
} = ReactNative;

import styles from './bitmark-app-scale.component.style';
import { ios, android } from './../../../configs';

const { StatusBarManager } = NativeModules;

const designSize = Platform.select({
  ios: ios.constant.defaultWindowSize,
  android: android.constant.defaultWindowSize,
});
const currentSize = Dimensions.get('window');

class IOSAppScaleComponent extends React.Component {
  constructor(props) {
    super(props);
    this.generateScaling = this.generateScaling.bind(this);
    this.statusBarChanged = this.statusBarChanged.bind(this);
    this.refreshScaling = this.refreshScaling.bind(this);

    this.state = this.generateScaling(ios.config.isIPhoneX ? 0 : 20);
    this.refreshScaling();
  }

  componentDidMount() {
    StatusBarIOS.addListener('statusBarFrameWillChange', this.statusBarChanged);
  }

  componentWillUnmount() {
    StatusBarIOS.removeListener('statusBarFrameWillChange', this.statusBarChanged);
  }

  statusBarChanged(statusbarData) {
    this.setState(this.generateScaling(statusbarData.frame.height));
  }

  refreshScaling() {
    StatusBarManager.getHeight(result => {
      let statusBarHeight = ios.config.isIPhoneX ? 0 : result.height;
      this.setState(this.generateScaling(statusBarHeight));
    });
  }

  generateScaling(statusBarHeight) {
    statusBarHeight = statusBarHeight || 20;
    let realCurrentHeight = currentSize.height - statusBarHeight + 20;
    let scale = Math.min(currentSize.width / designSize.width, realCurrentHeight / designSize.height);
    return {
      scale: scale,
      translateY: (realCurrentHeight - designSize.height) / (2 * scale),
      translateX: (currentSize.width - designSize.width) / (2 * scale),
    }
  }
  render() {
    const childrenWithProps = React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child, { refreshScaling: this.refreshScaling })
    });
    return (
      <View style={styles.body}>
        <View style={{
          height: designSize.height,
          width: designSize.width,
          transform: [
            { scale: this.state.scale },
            { translateY: this.state.translateY },
            { translateX: this.state.translateX },
          ],
        }} >
          {childrenWithProps}
        </View>
      </View>
    );
  }
}

IOSAppScaleComponent.propTypes = {
  children: PropTypes.object,
}

// TODO
class AndroidAppScaleComponent extends React.Component {
  constructor(props) {
    super(props);
    this.refreshScaling();
  }

  refreshScaling() {
    //TODO
  }
  render() {
    const childrenWithProps = React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child, { refreshScaling: this.refreshScaling })
    });
    return (
      <View style={styles.body}>
        {childrenWithProps}
      </View>
    );
  }
}

AndroidAppScaleComponent.propTypes = {
  children: PropTypes.object,
}

let AppScaleComponent = Platform.select({
  ios: IOSAppScaleComponent,
  android: AndroidAppScaleComponent
});

export { AppScaleComponent };