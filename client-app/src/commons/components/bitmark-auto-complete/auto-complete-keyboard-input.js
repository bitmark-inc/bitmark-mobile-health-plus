import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, FlatList, TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Animated,
  Image,
} from 'react-native';

let deviceSize = Dimensions.get('window');

import styles from './auto-complete-keyboard-input.style';

export class AutoCompleteKeyboardInput extends React.Component {
  static statuses = {
    done: 'done',
    inputing: 'inputing'
  }
  constructor(props) {
    super(props);
    this.onKeyboardWillShow = this.onKeyboardWillShow.bind(this);
    this.onKeyboardDidShow = this.onKeyboardDidShow.bind(this);
    this.onKeyboardWillHide = this.onKeyboardWillHide.bind(this);
    this.onKeyboardDidHide = this.onKeyboardDidHide.bind(this);
    this.onKeyboardWillChangeFrame = this.onKeyboardWillChangeFrame.bind(this);
    this.onKeyboardDidChangeFrame = this.onKeyboardDidChangeFrame.bind(this);

    this.selectText = this.selectText.bind(this);

    this.doDisplayExtensionArea = this.doDisplayExtensionArea.bind(this);
    this.doHideExtensionArea = this.doHideExtensionArea.bind(this);
    this.doFilter = this.doFilter.bind(this);

    this.showKeyboardInput = this.showKeyboardInput.bind(this);
    this.hideKeyboardInput = this.hideKeyboardInput.bind(this);
    this.state = {
      dataSource: this.props.dataSource || [],
      opacity: new Animated.Value(0),
      extBottom: new Animated.Value(0),
      keyboardHeight: 0,
      inputtedText: '',
      realInputtedText: '',
      selectedIndex: -1,
    }
  }
  // ==========================================================================================
  componentDidMount() {
    this.keyboardWillShow = Keyboard.addListener('keyboardWillShow', this.onKeyboardWillShow)
    this.keyboardDidShow = Keyboard.addListener('keyboardDidShow', this.onKeyboardDidShow)
    this.keyboardWillHide = Keyboard.addListener('keyboardWillHide', this.onKeyboardWillHide)
    this.keyboardDidHide = Keyboard.addListener('keyboardDidHide', this.onKeyboardDidHide)
    this.keyboardWillChangeFrame = Keyboard.addListener('keyboardWillChangeFrame', this.onKeyboardWillChangeFrame)
    this.keyboardDidChangeFrame = Keyboard.addListener('keyboardDidChangeFrame', this.onKeyboardDidChangeFrame)
    this.mounted = true;
  }
  componentWillUnmount() {
    this.mounted = false;
    this.keyboardWillShow.remove();
    this.keyboardDidShow.remove();
    this.keyboardWillHide.remove();
    this.keyboardDidHide.remove();
    this.keyboardWillChangeFrame.remove();
    this.keyboardDidChangeFrame.remove();
  }
  // ==========================================================================================
  doDisplayExtensionArea() {
    let listAnimations = [Animated.spring(this.state.extBottom, {
      toValue: this.state.keyboardHeight / (this.props.appScale || 1),
      duration: 100,
    })];
    if (this.props.onlyDisplayWhenCalled) {
      listAnimations.push(Animated.spring(this.state.opacity, {
        toValue: 1,
        duration: 2000,
      }));
    }
    Animated.parallel(listAnimations).start();
  }
  doHideExtensionArea() {
    let listAnimations = [Animated.spring(this.state.extBottom, {
      toValue: 0,
      duration: 1000,
    })];
    if (this.props.onlyDisplayWhenCalled) {
      listAnimations.push(Animated.spring(this.state.opacity, {
        toValue: 0,
        duration: 1000,
      }));
    }
    Animated.parallel(listAnimations).start();
  }
  doFilter(dataSource, text) {
    let tempDataSource = [];
    if (text) {
      let index = 0;
      dataSource.forEach(word => {
        if ((this.props.caseSensitive && ((word || '').indexOf(text) >= 0)) ||
          (!this.props.caseSensitive && ((word || '').toLocaleLowerCase().indexOf(text.toLocaleLowerCase()) >= 0))) {
          tempDataSource.push({ key: index, word: word });
          index++;
        }
      });
    }
    this.setState({ dataSource: tempDataSource });
  }
  selectText(text, index) {
    if (index >= 0 && index < this.state.dataSource.length) {
      this.listViewElement.scrollToIndex({ animated: true, index: index, viewPosition: 1 });
    }
    this.setState({
      inputtedText: text,
      selectedIndex: index,
    });
    if (this.props.onSelectWord) {
      this.props.onSelectWord(text);
    }
  }
  // ==========================================================================================
  onKeyboardWillShow(keyboardEvent) {
    if (this.props.onKeyboardWillShow) {
      this.props.onKeyboardDidShow(keyboardEvent);
    }
  }
  onKeyboardDidShow(keyboardEvent) {
    this.setState({ keyboardHeight: keyboardEvent.endCoordinates.height });
    this.doDisplayExtensionArea();
    if (this.props.onKeyboardDidShow) {
      this.props.onKeyboardDidShow(keyboardEvent);
    }
  }
  onKeyboardWillHide(keyboardEvent) {
    this.setState({ keyboardHeight: deviceSize.height });
    this.doHideExtensionArea();
    if (this.props.onKeyboardWillHide) {
      this.props.onKeyboardWillHide(keyboardEvent);
    }
  }
  onKeyboardDidHide(keyboardEvent) {
    if (this.props.onKeyboardDidHide) {
      this.props.onKeyboardDidHide(keyboardEvent);
    }
  }
  onKeyboardWillChangeFrame(keyboardEvent) {
    if (this.props.onKeyboardWillChangeFrame) {
      this.props.onKeyboardWillChangeFrame(keyboardEvent);
    }
  }
  onKeyboardDidChangeFrame(keyboardEvent) {
    if (this.props.onKeyboardDidChangeFrame) {
      this.props.onKeyboardDidChangeFrame(keyboardEvent);
    }
  }

  // ==========================================================================================
  showKeyboardInput(defaultValue) {
    if (!this.mounted) {
      return setTimeout(() => {
        this.showKeyboardInput(defaultValue);
      }, 200);
    }
    this.setState({ inputtedText: defaultValue });
    if (this.textInputElement) {
      this.textInputElement.focus();
    }
  }
  hideKeyboardInput() {
    Keyboard.dismiss();
  }

  setStatus(status) {
    this.setState({ status });
  }

  // ==========================================================================================
  setTextInputElement(textInputElement) {
    this.textInputElement = textInputElement;
  }
  filter(text) {
    this.setState({ inputtedText: text });
    this.doFilter(this.props.dataSource, text);
  }
  // ==========================================================================================
  render() {
    return (
      <TouchableWithoutFeedback>
        <Animated.View style={[styles.extArea, this.props.style, {
          zIndex: this.props.zIndexExt || 100,
          bottom: this.state.extBottom,
          opacity: this.props.onlyDisplayWhenCalled ? this.state.opacity : new Animated.Value(1),
        }]}>
          <View style={[styles.selectionArea, this.selectionAreaStyle]}>
            <TouchableOpacity style={styles.nextButton} onPress={this.props.goToNextInputField}>
              <Image style={styles.nextButtonImage} source={require('./../../../../assets/imgs/arrow_down_enable.png')} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.prevButton} onPress={this.props.goToPrevInputField}>
              <Image style={styles.prevButtonImage} source={require('./../../../../assets/imgs/arrow_up_enable.png')} />
            </TouchableOpacity>
            {this.props.dataSource && !!this.state.inputtedText && <View style={[styles.selectionList]}>
              <FlatList
                ref={(ref) => this.listViewElement = ref}
                keyboardShouldPersistTaps="handled"
                horizontal={true}
                extraData={this.state}
                data={this.state.dataSource}
                renderItem={({ item }) => {
                  return (<TouchableOpacity style={[styles.selectionItem, this.props.selectionItemStyle]} onPress={() => this.selectText(item.word, item.key)}>
                    <Text style={[styles.selectionItemText, { color: this.state.selectedIndex === item.key ? (this.props.selectedColor || 'blue') : (this.props.unSelectedColor || 'gray') }]}>{item.word}</Text>
                  </TouchableOpacity>)
                }}
              />
            </View>}
            <TouchableOpacity style={styles.doneButton} onPress={this.hideKeyboardInput} disabled={this.state.status !== AutoCompleteKeyboardInput.statuses.done}>
              <Text style={[styles.doneButtonText, { color: this.state.status === AutoCompleteKeyboardInput.statuses.done ? '#0060F2' : 'gray' }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
}

AutoCompleteKeyboardInput.propTypes = {
  children: PropTypes.array,
  onKeyboardWillShow: PropTypes.func,
  onKeyboardDidShow: PropTypes.func,
  onKeyboardWillHide: PropTypes.func,
  onKeyboardDidHide: PropTypes.func,
  onKeyboardWillChangeFrame: PropTypes.func,
  onKeyboardDidChangeFrame: PropTypes.func,
  goToNextInputField: PropTypes.func,
  goToPrevInputField: PropTypes.func,

  style: PropTypes.object,
  inputAreaStyle: PropTypes.object,
  textInputStyle: PropTypes.object,
  selectionAreaStyle: PropTypes.object,
  selectionItemStyle: PropTypes.object,
  selectedColor: PropTypes.object,
  unSelectedColor: PropTypes.object,

  onSelectWord: PropTypes.func,

  appScale: PropTypes.number,
  hideInputArea: PropTypes.bool,
  onlyDisplayWhenCalled: PropTypes.bool,
  caseSensitive: PropTypes.bool,
  dataSource: PropTypes.array,
  zIndexExt: PropTypes.number,
};