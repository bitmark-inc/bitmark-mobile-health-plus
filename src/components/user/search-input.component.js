import PropTypes from 'prop-types';
import React, { Component } from 'react'
import {
  Keyboard,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  Image, StyleSheet
} from 'react-native';

export class SearchInputComponent extends Component {
  static defaultProps = {
    throttle: 200,
    onSearchTermChange: () => {}
  };

  constructor(props) {
    super(props);
    this.state = {
      searchTerm: this.props.value || '',
      inputFocus: props.inputFocus,
    };
    this._keyboardDidHide = this._keyboardDidHide.bind(this)
  }

  UNSAFE_componentWillMount() {
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }

  componentWillUnmount() {
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidHide() {
    if (this.state.inputFocus) {
      this.setState({inputFocus: false})
    }
  }

  render() {
    return (
      <View style={[styles.searchView, this.props.style]}>
        <View style={[styles.inputContainer]}>
          {/*SEARCH ICON*/}
          <Image style={styles.searchIcon} source={require('../../../assets/imgs/search-icon.png')}/>

          {/*SEARCH INPUT*/}
          <TextInput
            style={styles.textInput}
            onChangeText={(term) => this.updateSearch(term)}
            returnKeyType={this.props.returnKeyType}
            onSubmitEditing={this.props.onSubmitEditing}
            placeholder={this.props.placeholder}
            autoCorrect={false}
            autoCapitalize={false}
            type={'search'}
            value={this.state.searchTerm}
          >
          </TextInput>
        </View>

        {/*CANCEL BUTTON*/}
        {this.state && this.state.searchTerm
          ? <View style={styles.clearButtonContainer}>
            <TouchableOpacity onPress={() => {
              this.props.onSearchTermChange('');
              this.setState({
                searchTerm: ''
              })
            }}>
              <Text style={styles.clearButtonText}>{global.i18n.t("SearchInputComponent_cancel")}</Text>
            </TouchableOpacity>
          </View>
          : null
        }
      </View>
    )
  }

  updateSearch(searchTerm) {
    this.setState({
      searchTerm: searchTerm
    }, () => {
      if (this._throttleTimeout) {
        clearTimeout(this._throttleTimeout)
      }

      this._throttleTimeout = setTimeout(
        () => this.props.onSearchTermChange(searchTerm),
        this.props.throttle
      )
    })
  }
}

const styles = StyleSheet.create({
  searchView: {
    flexDirection: 'row'
  },
  inputContainer: {
    height: 35,
    padding: 10,
    paddingTop: 5,
    paddingBottom: 5,
    flexDirection: 'row',
    borderColor: '#CCC',
    borderWidth: 1,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    flex: 1
  },

  searchIcon: {
    width: 13,
    height: 13,
    resizeMode: 'contain',
    marginRight: 10,
  },

  textInput: {
    fontFamily: 'Avenir medium',
    fontSize: 14,
    flex: 1
  },

  clearButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5
  },

  clearButtonText: {
    fontFamily: 'Avenir medium',
    fontSize: 14,
    color: '#0060F2'
  }
});

SearchInputComponent.propTypes = {
  style: PropTypes.object,
  inputFocus: PropTypes.bool,
  onSearchTermChange: PropTypes.func,
  returnKeyType: PropTypes.func,
  onSubmitEditing: PropTypes.func,
  throttle: PropTypes.number,
  value: PropTypes.string,
  placeholder: PropTypes.placeholder,
};