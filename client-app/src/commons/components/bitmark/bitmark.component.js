import React from 'react';
import PropTypes from 'prop-types';
import { merge } from 'lodash';
import ReactNative from 'react-native';
const {
  View, ScrollView,
  Dimensions,
  StatusBarIOS,
  NativeModules,
  Keyboard,
  Animated,
} = ReactNative;
import styles from './bitmark.component.style';
import { ios } from './../../../configs';

const { StatusBarManager } = NativeModules;

const currentSize = Dimensions.get('window');

export class BitmarkComponent extends React.Component {
  constructor(props) {
    super(props);
    this.statusBarChanged = this.statusBarChanged.bind(this);
    this.getAppHeight = this.getAppHeight.bind(this);
    this.refresh = this.refresh.bind(this);
    this.getContentHeight = this.getContentHeight.bind(this);
    this.onKeyboardWillShow = this.onKeyboardWillShow.bind(this);
    this.onKeyboardDidShow = this.onKeyboardDidShow.bind(this);
    this.onKeyboardDidHide = this.onKeyboardDidHide.bind(this);
    this.setFocusElement = this.setFocusElement.bind(this);
    this.doScroll = this.doScroll.bind(this);

    let headerHeight = !this.props.header ? 0 : (this.props.headerHeight || (ios.constant.headerSize.height - ios.constant.headerSize.paddingTop));
    let footerHeight = !this.props.footer ? 0 : (this.props.footerHeight || ios.constant.bottomTabsHeight + ios.constant.blankFooter);
    let keyboardExternalHeight = this.props.keyboardExternal ? (this.props.headerHeight || ios.constant.autoCompleteHeight) : 0;
    let statusBarHeight = 0;
    let bodyHeight = currentSize.height - ios.constant.headerSize.paddingTop;
    let contentHeight = bodyHeight - headerHeight - footerHeight;
    this.state = {
      contentHeightAnimation: new Animated.Value(contentHeight + footerHeight),
      contentHeight,
      headerHeight,
      footerHeight,
      statusBarHeight,
      keyboardHeight: 0,
      keyboardY: currentSize.height,
      keyboardExternalHeight,
      keyboardExternalOpacity: new Animated.Value(0),
      keyboardExternalBottom: new Animated.Value(0),
      bodyHeight,
    };
    this.scrollYPosition = 0;
  }

  componentDidMount() {
    StatusBarIOS.addListener('statusBarFrameWillChange', this.statusBarChanged);
    this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this.onKeyboardWillShow);
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.onKeyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.onKeyboardDidHide);
    this.refresh();
  }

  componentWillUnmount() {
    StatusBarIOS.removeListener('statusBarFrameWillChange', this.statusBarChanged);
    this.keyboardWillShowListener.remove();
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }
  onKeyboardWillShow(event) {
    if (event.easing === 'keyboard') {
      this.oldScrollYPosition = this.scrollYPosition;
    }
  }
  onKeyboardDidShow(keyboardEvent) {
    if (keyboardEvent.easing !== 'keyboard') {
      return;
    }
    console.log('onKeyboardDidShow :', keyboardEvent);
    let keyboardHeight = keyboardEvent.endCoordinates.height;
    let keyboardY = keyboardEvent.endCoordinates.screenY;
    let contentHeight = this.state.bodyHeight - this.state.headerHeight - this.state.keyboardExternalHeight - keyboardHeight;
    this.setState({ keyboardHeight, keyboardY, contentHeight });
    this.doScroll(keyboardHeight, keyboardY, contentHeight);
  }

  onKeyboardDidHide() {
    let keyboardHeight = 0;
    let contentHeight = this.state.bodyHeight - this.state.headerHeight - this.state.footerHeight;
    this.setState({ keyboardHeight, contentHeight });
    this.doScroll(keyboardHeight, null, contentHeight);
  }

  statusBarChanged(statusbarData) {
    let statusBarHeight = statusbarData.frame.height - ios.constant.headerSize.paddingTop;
    let bodyHeight = statusBarHeight ? (currentSize.height - statusbarData.frame.height) : (currentSize.height - ios.constant.headerSize.paddingTop);
    let contentHeight = bodyHeight - this.state.headerHeight - Math.max(this.state.footerHeight, this.state.keyboardHeight ? this.state.keyboardExternalHeight : 0) - this.state.keyboardHeight;
    let statusBarHeightChange = this.state.contentHeight - contentHeight;
    this.setState({ bodyHeight, contentHeight, statusBarHeight });
    this.doScroll(this.state.keyboardHeight, this.state.keyboardY, contentHeight, statusBarHeightChange);
  }

  async doScroll(keyboardHeight, keyboardY, contentHeight, statusBarHeightChange) {
    statusBarHeightChange = statusBarHeightChange || 0;
    let oldScrollYPosition = this.oldScrollYPosition || 0;

    let listAnimations = [];
    listAnimations.push(Animated.spring(this.state.contentHeightAnimation, {
      toValue: contentHeight + this.state.footerHeight,
      duration: 200,
    }));
    listAnimations.push(Animated.spring(this.state.keyboardExternalBottom, {
      toValue: keyboardHeight,
      duration: 200,
    }));
    if (keyboardHeight > 0) {
      listAnimations.push(Animated.spring(this.state.keyboardExternalOpacity, {
        toValue: 1,
        duration: 200,
      }));
    } else {
      listAnimations.push(Animated.spring(this.state.keyboardExternalOpacity, {
        toValue: 0,
        duration: 200,
      }));
    }
    Animated.parallel(listAnimations).start();

    if (keyboardHeight > 0) {
      if (statusBarHeightChange === 0 && this.focusedElement) {
        this.focusedElement.measureInWindow((x, y, width, height) => {
          if (this.scrollRef && ((y + height) > (keyboardY - Math.max(this.state.keyboardExternalHeight, this.state.footerHeight)))) {
            let focusedElementYPosition = oldScrollYPosition + y + height - keyboardY + this.state.footerHeight + statusBarHeightChange + Math.max(this.state.keyboardExternalHeight, this.state.footerHeight);
            this.scrollRef.scrollTo({ x: 0, y: focusedElementYPosition, animated: true });
            this.oldScrollYPosition = focusedElementYPosition;
          }
        });
      } else if (this.scrollRef && statusBarHeightChange !== 0) {
        this.scrollRef.scrollTo({ x: 0, y: this.scrollYPosition + statusBarHeightChange, animated: true });
      }
    }
  }

  getAppHeight() {
    return this.state.contentHeight;
  }

  getContentHeight() {
    return this.state.contentHeight;
  }

  refresh() {
    setTimeout(() => {
      StatusBarManager.getHeight(result => {
        let statusBarHeight = ios.config.isIPhoneX ? 0 : (result.height - ios.constant.headerSize.paddingTop);
        let bodyHeight = statusBarHeight ? (currentSize.height - result.height) : (currentSize.height - ios.constant.headerSize.paddingTop);
        let contentHeight = bodyHeight - this.state.headerHeight - this.state.footerHeight;
        this.setState({ bodyHeight, contentHeight, statusBarHeight });
        Animated.spring(this.state.contentHeightAnimation, {
          toValue: contentHeight + this.state.footerHeight,
          duration: 200,
        }).start();
      });
    }, 500)

  }

  setFocusElement(element) {
    this.focusedElement = element;
    this.doScroll(this.state.keyboardHeight, this.state.keyboardY, this.state.contentHeight);
  }

  render() {
    let mainStyle = {
      flex: 1,
      position: "absolute",
      top: 0,
      width: currentSize.width,
      height: currentSize.height,
      backgroundColor: "#F5F5F5",
      // borderWidth: 4, borderColor: 'red',
      zIndex: 0,
    };
    mainStyle = merge({}, mainStyle, this.props.mainStyle);
    if (this.props.backgroundColor) {
      mainStyle = merge(mainStyle, { backgroundColor: this.props.backgroundColor });
    }
    return (
      <View style={mainStyle}>
        <View style={[styles.body, {
          top: ios.constant.headerSize.paddingTop,
          height: this.state.bodyHeight,
          // borderWidth: 2, borderColor: 'red',
        }]}>
          {this.state.headerHeight > 0 && <View style={[styles.header, {
            height: this.state.headerHeight,
            // borderWidth: 2, borderColor: 'red',
          }]}>
            {this.props.header}
          </View>}

          <Animated.View style={[styles.contentFooter, {
            height: this.state.contentHeightAnimation,
            top: this.state.headerHeight,
            paddingBottom: this.state.footerHeight,
            // borderWidth: 2, borderColor: 'blue'
          }]}
          >
            <View style={[styles.content, {
              // borderWidth: 2, borderColor: 'red',
            }, this.props.contentContainerStyle]}>
              {this.props.contentInScroll &&
                <ScrollView ref={ref => this.scrollRef = ref} scrollEventThrottle={16} onScroll={(event) => {
                  this.scrollYPosition = event.nativeEvent.contentOffset.y;
                  if (this.state.keyboardHeight) {
                    this.oldScrollYPosition = this.scrollYPosition;
                  }
                  // console.log('this.scrollYPosition :', this.scrollYPosition);
                }}>
                  {this.props.content}
                </ScrollView>}
              {!this.props.contentInScroll && this.props.content}
            </View>

            {this.state.footerHeight > 0 && this.state.keyboardHeight === 0 && <View style={[styles.footer, {
              height: this.state.footerHeight,
              // borderWidth: 2, borderColor: 'red',
            }]}>{this.props.footer}</View>}
          </Animated.View>

          {
            this.state.keyboardExternalHeight > 0 && this.state.keyboardHeight > 0 && <Animated.View style={[styles.keyboardExternal, {
              height: this.state.keyboardExternalHeight,
              bottom: this.state.keyboardExternalBottom,
              opacity: this.state.keyboardExternalOpacity,
              // borderWidth: 2, borderColor: 'red',
            }]}>
              {this.props.keyboardExternal}
            </Animated.View>
          }
        </View>
      </View>
    );
  }
}

BitmarkComponent.propTypes = {
  backgroundColor: PropTypes.string,
  mainStyle: PropTypes.object,

  header: PropTypes.any,
  headerHeight: PropTypes.number,

  contentInScroll: PropTypes.bool,
  contentContainerStyle: PropTypes.object,
  content: PropTypes.any.isRequired,

  footer: PropTypes.any,
  footerHeight: PropTypes.number,

  keyboardExternalHeight: PropTypes.number,

  keyboardExternal: PropTypes.any,
}