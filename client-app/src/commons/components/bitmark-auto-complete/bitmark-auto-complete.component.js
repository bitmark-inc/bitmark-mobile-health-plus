

import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image, ListView,
  Keyboard,
  Dimensions,
} from 'react-native';

const ListViewDataSource = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
const currentSize = Dimensions.get('window');
import acStyles from './bitmark-auto-complete.component.style';

export class BitmarkAutoCompleteComponent extends React.Component {
  constructor(props) {
    super(props);

    this.onKeyboardDidShow = this.onKeyboardDidShow.bind(this);
    this.onKeyboardWillHide = this.onKeyboardWillHide.bind(this);

    this.state = {
      topKeyboardPosition: currentSize.height,
      dataSource: this.props.dataSource,
      isDone: this.props.isDone
    };
  }
  // ==========================================================================================
  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.onKeyboardDidShow);
    this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this.onKeyboardWillHide)
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ dataSource: nextProps.dataSource, isDone: nextProps.isDone });
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardWillHideListener.remove();
  }
  // ==========================================================================================

  onKeyboardDidShow(keyboardEvent) {
    this.setState({ topKeyboardPosition: keyboardEvent.endCoordinates.height });
  }

  onKeyboardWillHide() {
    this.setState({ topKeyboardPosition: currentSize.height, });
  }
  // ==========================================================================================
  render() {
    return (
      <View style={[acStyles.topKeyboard, { bottom: this.state.topKeyboardPosition }]}>
        <TouchableOpacity style={acStyles.previousButton}
          onPress={() => this.props.onBack()}
        >
          <Image style={acStyles.previousButtonIcon}
            source={require('./../../../../assets/imgs/arrow_up_enable.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={acStyles.nextButton}
          onPress={() => this.props.onNext()}
        >
          <Image style={acStyles.nextButtonIcon}
            source={require('./../../../../assets/imgs/arrow_down_enable.png')} />
        </TouchableOpacity>

        <View style={acStyles.listAutoCompleted}>
          <ListView
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            horizontal={true}
            dataSource={ListViewDataSource.cloneWithRows(this.state.dataSource)}
            enableEmptySections={true}
            renderRow={(text) => {
              return (<TouchableOpacity style={{
                paddingLeft: 4,
                paddingRight: 4,
              }} onPress={() => { this.props.onSubmit(text) }}><Text style={{ marginLeft: 5 }}>{text}</Text></TouchableOpacity>)
            }}
          />
        </View>

        <TouchableOpacity style={[acStyles.doneInputButton]} onPress={() => this.props.checkInputtedWords()} disabled={!this.state.isDone}>
          <Text style={[acStyles.doneInputButtonText, { color: this.state.isDone ? '#0060F2' : '#D4D4D4' }]}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

BitmarkAutoCompleteComponent.propTypes = {
  dataSource: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  checkInputtedWords: PropTypes.func.isRequired,
  isDone: PropTypes.bool.isRequired,
  onKeyboardShowHide: PropTypes.func.isRequired,
};