import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, View, TouchableOpacity, Text, SafeAreaView,
} from 'react-native';

import { convertWidth } from '../../utils';
import { config } from '../../configs';
import { constants } from '../../constants';
import { Actions } from 'react-native-router-flux';

export class AssetNameInform extends Component {
  static propTypes = {
    assetNames: PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  gotoBitmarkList() {
    Actions.bitmarkList({ bitmarkType: 'bitmark_health_issuance' });
  }

  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            <View style={[styles.content]}>
              <Text style={[styles.headerText]}>{global.i18n.t("AssetNameInform_headerText")}</Text>
              <Text style={[styles.description]}>{global.i18n.t("AssetNameInform_description")}</Text>
              {this.props.assetNames.map((assetName, index) => {
                return <Text key={index} style={[styles.assetName]}>- {assetName}</Text>
              })}
            </View>
            <View style={styles.lastBottomButtonArea}>
              <TouchableOpacity style={styles.lastBottomButton} onPress={this.gotoBitmarkList.bind(this)}>
                <Text style={styles.lastBottomButtonText}>{global.i18n.t("AssetNameInform_view")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  bodySafeView: {
    flex: 1,
    backgroundColor: 'white',
  },
  body: {
    padding: convertWidth(16),
    paddingTop: convertWidth(16) + (config.isIPhoneX ? constants.iPhoneXStatusBarHeight : 0),
    flex: 1,
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: "#FF4444",
    width: "100%",
    padding: convertWidth(20),
    paddingTop: convertWidth(15),
  },
  content: {
    flex: 1
  },
  headerText: {
    fontFamily: 'Avenir black',
    fontSize: 36,
    fontWeight: '900'
  },
  description: {
    fontFamily: 'Avenir light',
    fontSize: 16,
    fontWeight: '300',
    marginTop: 20,
  },
  assetName: {
    fontFamily: 'Avenir medium',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 20,
  },
  lastBottomButtonArea: {
    padding: convertWidth(20),
  },
  lastBottomButton: {
    height: constants.buttonHeight,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4444',
  },
  lastBottomButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white',
  },

});