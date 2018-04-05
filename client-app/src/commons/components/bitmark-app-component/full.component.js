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
import styles from './full.component.style';
import { ios } from './../../../configs';

const { StatusBarManager } = NativeModules;

const currentSize = Dimensions.get('window');

export class FullComponent extends React.Component {
  constructor(props) {
    super(props);
    this.statusBarChanged = this.statusBarChanged.bind(this);
    this.getAppHeight = this.getAppHeight.bind(this);
    this.refresh = this.refresh.bind(this);
    this.getContentHeight = this.getContentHeight.bind(this);
    this.onkeyboardWillShow = this.onkeyboardWillShow.bind(this);
    this.onkeyboardDidShow = this.onkeyboardDidShow.bind(this);
    this.onkeyboardDidHide = this.onkeyboardDidHide.bind(this);
    this.setForcusElement = this.setForcusElement.bind(this);
    this.doScroll = this.doScroll.bind(this);

    let headerHeight = !this.props.header ? 0 : (this.props.headerHeight || (ios.constant.headerSize.height - ios.constant.headerSize.paddingTop));
    let footerHeight = !this.props.footer ? 0 : (this.props.footerHeight || ios.constant.bottomTabsHeight + ios.constant.blankFooter);
    let keyboardExtenalHeight = this.props.keyboardExtenal ? (this.props.headerHeight || ios.constant.autoCompleteHeight) : 0;
    let statusBarHeight = 0;
    let bodyHeight = currentSize.height - ios.constant.headerSize.paddingTop;
    let conntentHeight = bodyHeight - headerHeight - footerHeight;
    this.state = {
      conntentHeightAnimation: new Animated.Value(conntentHeight + footerHeight),
      conntentHeight,
      headerHeight,
      footerHeight,
      statusBarHeight,
      keyboardHeight: 0,
      keyboardY: currentSize.height,
      keyboardExtenalHeight,
      keyboardExtenalOpacity: new Animated.Value(0),
      keyboardExtenalBottom: new Animated.Value(0),
      bodyHeight,
    };
    this.scrollYPosition = 0;
  }

  componentDidMount() {
    StatusBarIOS.addListener('statusBarFrameWillChange', this.statusBarChanged);
    this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this.onkeyboardWillShow);
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.onkeyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.onkeyboardDidHide);
    this.refresh();
  }

  componentWillUnmount() {
    StatusBarIOS.removeListener('statusBarFrameWillChange', this.statusBarChanged);
    this.keyboardWillShowListener.remove();
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }
  onkeyboardWillShow(event) {
    if (event.easing === 'keyboard') {
      this.oldScrollYPosition = this.scrollYPosition;
    }
  }
  onkeyboardDidShow(keyboardEvent) {
    if (keyboardEvent.easing !== 'keyboard') {
      return;
    }
    console.log('onkeyboardDidShow :', keyboardEvent);
    let keyboardHeight = keyboardEvent.endCoordinates.height;
    let keyboardY = keyboardEvent.endCoordinates.screenY;
    let conntentHeight = this.state.bodyHeight - this.state.headerHeight - Math.max(this.state.footerHeight, this.state.keyboardExtenalHeight) - keyboardHeight;
    this.setState({ keyboardHeight, keyboardY, conntentHeight });
    this.doScroll(keyboardHeight, keyboardY, conntentHeight);
  }

  onkeyboardDidHide() {
    let keyboardHeight = 0;
    let conntentHeight = this.state.bodyHeight - this.state.headerHeight - this.state.footerHeight;
    this.setState({ keyboardHeight, conntentHeight });
    this.doScroll(keyboardHeight, null, conntentHeight);
  }

  statusBarChanged(statusbarData) {
    let statusBarHeight = statusbarData.frame.height - ios.constant.headerSize.paddingTop;
    let bodyHeight = statusBarHeight ? (currentSize.height - statusbarData.frame.height) : (currentSize.height - ios.constant.headerSize.paddingTop);
    let conntentHeight = bodyHeight - this.state.headerHeight - Math.max(this.state.footerHeight, this.state.keyboardHeight ? this.state.keyboardExtenalHeight : 0) - this.state.keyboardHeight;
    let statusBarHeightChange = this.state.conntentHeight - conntentHeight;
    this.setState({ bodyHeight, conntentHeight, statusBarHeight });
    this.doScroll(this.state.keyboardHeight, this.state.keyboardY, conntentHeight, statusBarHeightChange);
  }

  async doScroll(keyboardHeight, keyboardY, conntentHeight, statusBarHeightChange) {
    statusBarHeightChange = statusBarHeightChange || 0;
    let oldScrollYPosition = this.oldScrollYPosition || 0;

    let listAnimations = [];
    listAnimations.push(Animated.spring(this.state.conntentHeightAnimation, {
      toValue: conntentHeight + this.state.footerHeight,
      duration: 200,
    }));
    listAnimations.push(Animated.spring(this.state.keyboardExtenalBottom, {
      toValue: keyboardHeight,
      duration: 200,
    }));
    if (keyboardHeight > 0) {
      listAnimations.push(Animated.spring(this.state.keyboardExtenalOpacity, {
        toValue: 1,
        duration: 200,
      }));
    } else {
      listAnimations.push(Animated.spring(this.state.keyboardExtenalOpacity, {
        toValue: 0,
        duration: 200,
      }));
    }
    Animated.parallel(listAnimations).start();

    if (keyboardHeight > 0) {
      if (statusBarHeightChange === 0 && this.forcsedElement) {
        this.forcsedElement.measureInWindow((x, y, width, height) => {
          if (this.scrollRef && ((y + height) > (keyboardY - Math.max(this.state.keyboardExtenalHeight, this.state.footerHeight)))) {
            let forcsedElementYPosition = oldScrollYPosition + y + height - keyboardY + this.state.footerHeight + statusBarHeightChange + Math.max(this.state.keyboardExtenalHeight, this.state.footerHeight);
            this.scrollRef.scrollTo({ x: 0, y: forcsedElementYPosition, animated: true });
          }
        });
      } else if (this.scrollRef && statusBarHeightChange !== 0) {
        this.scrollRef.scrollTo({ x: 0, y: this.scrollYPosition + statusBarHeightChange, animated: true });
      }
    }
  }

  getAppHeight() {
    return this.state.conntentHeight;
  }

  getContentHeight() {
    return this.state.conntentHeight;
  }

  refresh() {
    setTimeout(() => {
      StatusBarManager.getHeight(result => {
        let statusBarHeight = ios.config.isIPhoneX ? 0 : (result.height - ios.constant.headerSize.paddingTop);
        let bodyHeight = statusBarHeight ? (currentSize.height - result.height) : (currentSize.height - ios.constant.headerSize.paddingTop);
        let conntentHeight = bodyHeight - this.state.headerHeight - this.state.footerHeight;
        this.setState({ bodyHeight, conntentHeight, statusBarHeight });
        Animated.spring(this.state.conntentHeightAnimation, {
          toValue: conntentHeight + this.state.footerHeight,
          duration: 200,
        }).start();
      });
    }, 500)

  }

  setForcusElement(element) {
    this.forcsedElement = element;
    this.doScroll(this.state.keyboardHeight, this.state.keyboardY, this.state.conntentHeight);
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
            height: this.state.conntentHeightAnimation,
            top: this.state.headerHeight,
            paddingBottom: this.state.footerHeight,
            // borderWidth: 2, borderColor: 'blue'
          }]}
          >
            <View style={[styles.content, {
              // borderWidth: 2, borderColor: 'red',
            }, this.props.contentConatainerStyle]}>
              {this.props.contentInScroll &&
                <ScrollView ref={ref => this.scrollRef = ref} scrollEventThrottle={16} onScroll={(event) => {
                  this.scrollYPosition = event.nativeEvent.contentOffset.y;
                  // console.log('this.scrollYPosition :', this.scrollYPosition);
                }}>
                  {this.props.content}
                </ScrollView>}
              {!this.props.contentInScroll && this.props.content}
            </View>

            {this.state.footerHeight > 0 && <View style={[styles.footer, {
              height: this.state.footerHeight,
              // borderWidth: 2, borderColor: 'red',
            }]}>{this.props.footer}</View>}
          </Animated.View>

          {
            this.state.keyboardExtenalHeight > 0 && this.state.keyboardHeight > 0 && <Animated.View style={[styles.keyboardExtenal, {
              height: this.state.keyboardExtenalHeight,
              bottom: this.state.keyboardExtenalBottom,
              opacity: this.state.keyboardExtenalOpacity,
              // borderWidth: 2, borderColor: 'red',
            }]}>
              {this.props.keyboardExtenal}
            </Animated.View>
          }
        </View>
      </View>
    );
  }
}

FullComponent.propTypes = {
  backgroundColor: PropTypes.string,
  mainStyle: PropTypes.object,

  header: PropTypes.any,
  headerHeight: PropTypes.number,

  contentInScroll: PropTypes.bool,
  contentConatainerStyle: PropTypes.object,
  content: PropTypes.any.isRequired,

  footer: PropTypes.any,
  footerHeight: PropTypes.number,

  keyboardExtenalHeight: PropTypes.number,
  keyboardExtenal: PropTypes.any,
}