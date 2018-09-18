import React from "react";
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image
} from 'react-native';
import style from "./new-account.component.style";

export class NewAccountComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={style.body}>
        {/*LOGO*/}
        <View style={[style.logoArea]}>
          <Image style={style.appLogo} source={require('./../../../../assets/imgs/loading-logo.png')} />
        </View>

        {/*BUTTONS*/}
        <View style={[style.buttonsArea]}>
          <TouchableOpacity style={[style.button]} onPress={() => this.props.navigation.navigate('Legal')}>
            <Text style={[style.buttonText]}>CREATE NEW ACCOUNT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[style.button, style.lastBottomButton]} onPress={() => {
            this.props.navigation.navigate('SignIn');
          }}>
            <Text style={[style.buttonText, style.lastBottomButtonText]}>ACCESS EXISTING ACCOUNT</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

NewAccountComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }),
};