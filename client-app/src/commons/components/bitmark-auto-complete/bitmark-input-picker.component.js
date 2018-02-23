import React from 'react';
import PropTypes from 'prop-types';
import {
  TouchableOpacity, Text
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Autocomplete from 'react-native-autocomplete-input';
import { BitmarkDialogComponent } from './../bitmark-dialog';
import inputPickerStyle from './bitmark-input-picker.component.style';


export class BitmarkInputPickerComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeText = this.onChangeText.bind(this);

    this.state = {
      data: this.props.data,
      query: ''
    }
  }

  onChangeText(text) {

    this.setState({
      query: text,
    })
  }
  render() {
    let data = this.state.query ? this.props.data.filter(item => {
      return item.toLocaleLowerCase().indexOf(this.state.query.toLocaleLowerCase()) >= 0;
    }) : this.props.data;
    return (
      <BitmarkDialogComponent>
        <KeyboardAwareScrollView style={inputPickerStyle.content}>
          <Autocomplete
            scrollable={true}
            style={{ width: 100, marginTop: 10, }}
            containerStyle={{ borderWidth: 0 }}
            inputContainerStyle={{}}
            listContainerStyle={{ borderWidth: 0 }}
            data={data}
            defaultValue={this.state.query}
            onChangeText={text => this.setState({ query: text })}
            renderItem={item => (
              <TouchableOpacity
                style={{}}
                onPress={() => this.setState({ query: item })}>
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </KeyboardAwareScrollView>
      </BitmarkDialogComponent>
    );
  }
}
BitmarkInputPickerComponent.propTypes = {
  data: PropTypes.array,
}