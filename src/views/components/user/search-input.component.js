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
    onSearchTermChange: () => { }
  };

  constructor(props) {
    super(props);
    this.state = {
      searchTerm: this.props.value || '',
      inputFocus: props.inputFocus,
      focusing: false,
    };
    this._keyboardDidHide = this._keyboardDidHide.bind(this);

    this.searchInput = null;
  }

  UNSAFE_componentWillMount() {
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }

  componentWillUnmount() {
    this.keyboardDidHideListener.remove();
  }

  onFocus() {
    this.setState({ focusing: true });
    this.props.setSearchFocus(true);
  }

  onBlur() {
    this.props.setSearchFocus(false);
  }

  _keyboardDidHide() {
    if (this.state.inputFocus) {
      this.setState({ inputFocus: false })
    }
  }

  render() {
    return (
      <View style={[styles.searchView, this.props.style]}>
        <View style={[styles.inputContainer]}>
          {/*SEARCH ICON*/}
          <Image style={styles.searchIcon} source={require('assets/imgs/search-icon.png')} />

          {/*SEARCH INPUT*/}
          <TextInput
            style={styles.textInput}
            ref={(input) => this.searchInput = input}
            onChangeText={(term) => this.updateSearch(term)}
            returnKeyType={this.props.returnKeyType}
            onSubmitEditing={this.props.onSubmitEditing}
            onFocus={this.onFocus.bind(this)}
            onBlur={this.onBlur.bind(this)}
            placeholder={this.props.placeholder}
            autoCorrect={false}
            autoCapitalize={'none'}
            type={'search'}
            value={this.state.searchTerm}
          >
          </TextInput>

          {/*CLOSE BUTTON*/}
          {this.state && this.state.searchTerm
            ? <TouchableOpacity onPress={() => {
              this.props.onSearchTermChange('');
              this.setState({
                searchTerm: ''
              })
            }}>
              <Image style={styles.searchCloseIcon} source={require('assets/imgs/search-close-icon.png')} />
            </TouchableOpacity>
            : null
          }
        </View>

        {/*CANCEL BUTTON*/}
        {this.state && this.state.focusing
          ? <View style={styles.clearButtonContainer}>
            <TouchableOpacity onPress={() => {
              this.props.onSearchTermChange('');
              this.props.setSearchFocus(false);
              this.searchInput.blur();
              this.setState({
                searchTerm: '',
                focusing: false
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

  searchCloseIcon: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
    marginRight: 5,
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
    marginLeft: 10
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
  setSearchFocus: PropTypes.func,
  returnKeyType: PropTypes.func,
  onSubmitEditing: PropTypes.func,
  throttle: PropTypes.number,
  value: PropTypes.string,
  placeholder: PropTypes.string,
};