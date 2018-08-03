import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, FlatList,
  Image,
} from 'react-native';

import styles from './bitmark-auto-complete.component.style';

export class BitmarkAutoCompleteComponent extends React.Component {
  static statuses = {
    done: 'done',
    inputting: 'inputting'
  }
  constructor(props) {
    super(props);
    this.selectText = this.selectText.bind(this);
    this.doFilter = this.doFilter.bind(this);
    this.filter = this.filter.bind(this);
    this.onDone = this.onDone.bind(this);
    this.setStatus = this.setStatus.bind(this);

    this.state = {
      dataSource: this.props.dataSource || [],
      inputtedText: '',
    }
  }
  // ==========================================================================================
  // ==========================================================================================
  doFilter(dataSource, text) {
    let tempDataSource = [];
    if (text) {
      dataSource.forEach((word, key) => {
        if (word.toLowerCase().indexOf(text.toLowerCase()) === 0) {
          tempDataSource.push({ key, word });
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

  onDone() {
    if (this.props.onDone) {
      this.props.onDone();
    }
  }

  setStatus(status) {
    this.setState({ status });
  }
  filter(text) {
    this.setState({ inputtedText: text });
    this.doFilter(this.props.dataSource, text);
  }
  // ==========================================================================================
  render() {
    return (
      <View style={styles.selectionArea}>
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
              return (<TouchableOpacity style={styles.selectionItem} onPress={() => this.selectText(item.word, item.key)}>
                <Text style={[styles.selectionItemText, { color: this.state.selectedIndex === item.key ? 'blue' : 'gray' }]}>{item.word}</Text>
              </TouchableOpacity>)
            }}
          />
        </View>}
        <TouchableOpacity style={styles.doneButton} onPress={this.onDone} disabled={this.state.status !== BitmarkAutoCompleteComponent.statuses.done}>
          <Text style={[styles.doneButtonText, { color: this.state.status === BitmarkAutoCompleteComponent.statuses.done ? '#0060F2' : 'gray' }]}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

BitmarkAutoCompleteComponent.propTypes = {
  goToNextInputField: PropTypes.func,
  goToPrevInputField: PropTypes.func,
  onSelectWord: PropTypes.func,
  dataSource: PropTypes.array,
  onDone: PropTypes.func,
};