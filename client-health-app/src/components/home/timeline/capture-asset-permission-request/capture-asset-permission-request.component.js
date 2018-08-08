import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Linking, Image
} from 'react-native';

import style from './capture-asset-permission-request.component.style';
import {BitmarkComponent} from "../../../../commons/components/";
import defaultStyle from "../../../../commons/styles";


export class CaptureAssetPermissionRequestComponent extends React.Component {
  constructor(props) {
    super(props);
    let type = this.props.navigation.state.params.type;

    this.state = {type};
  }

  componentDidMount() {

  }

  openAppSettings() {
    Linking.openURL('app-settings:');
  }

  render() {
    return (
      <BitmarkComponent
        header={(<View style={[defaultStyle.header, { backgroundColor: 'white' }]}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => { this.props.navigation.goBack() }}>
            <Image style={defaultStyle.headerLeftIcon} source={require('../../../../../assets/imgs/close-blue-icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle}></Text>
          <TouchableOpacity style={defaultStyle.headerRight}>
          </TouchableOpacity>
        </View>)}
        content={(
          <View style={style.body}>
            <View style={style.content}>
              <Text style={style.title}>CAPTURE ASSET</Text>
              <Text style={style.text_1}>{`Grant ${this.state.type} access for Bitmark Health to capture asset.`}</Text>
              <Text style={style.text_2}>Save a document or file into your Health data. (Your asset will be encrypted.)</Text>
              <TouchableOpacity onPress={this.openAppSettings.bind(this)}>
                <Text style={style.link}>{`Enable ${this.state.type.substring(0, 1).toUpperCase() + this.state.type.substring(1)} Access`}</Text>
              </TouchableOpacity>
            </View>
            <View style={style.content}></View>
          </View>
        )}
      />
    );
  }
}

CaptureAssetPermissionRequestComponent.propTypes = {
  screenProps: PropTypes.shape({
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
    type: PropTypes.string
  })
};