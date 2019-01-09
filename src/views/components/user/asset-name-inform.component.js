import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, View, TouchableOpacity, Text, SafeAreaView, ScrollView,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { convertWidth } from 'src/utils';
import { constants } from 'src/configs';

export class AssetNameInform extends Component {
  static propTypes = {
    assetNames: PropTypes.array
  };

  constructor(props) {
    super(props);
  }

  gotoBitmarkList() {
    Actions.reset('user');
    // Actions.bitmarkList({ bitmarkType: 'bitmark_health_issuance' });
  }

  render() {
    return (
      <SafeAreaView style={styles.bodySafeView}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            <View style={[styles.content]}>
              <Text style={[styles.headerText]}>{global.i18n.t("AssetNameInform_headerText")}</Text>
              <Text style={[styles.description]}>{global.i18n.t("AssetNameInform_description")}</Text>
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
                {this.props.assetNames.map((assetName, index) => {
                  return <Text key={index} style={[styles.assetName]}>- {assetName}</Text>
                })}
              </ScrollView>
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
    paddingTop: convertWidth(16),
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
    fontFamily: 'AvenirNextW1G-Bold',
    letterSpacing: 0.4,
    fontSize: 36,
  },
  description: {
    fontFamily: 'AvenirNextW1G-Light',
    letterSpacing: 0.25,
    fontSize: 16,
    marginTop: 20,
  },
  assetName: {
    fontFamily: 'AvenirNextW1G-Medium',
    fontSize: 16,
    letterSpacing: 0.4,
    marginTop: 20,
  },
  lastBottomButtonArea: {
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
    fontFamily: 'AvenirNextW1G-Bold',
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
    letterSpacing: 0.75,
  },

});