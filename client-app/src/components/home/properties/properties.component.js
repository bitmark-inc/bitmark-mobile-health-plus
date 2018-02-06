import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList, Image,
  Platform,
} from 'react-native';

import { config } from './../../../configs';
import { AppService } from "./../../../services";

import propertiesStyle from './properties.component.style';
import { androidDefaultStyle, iosDefaultStyle } from './../../../commons/styles';

let defaultStyle = Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
});


const SubTabs = {
  local: 'Yours',
  market: 'On Market',
  global: 'Global',
}
export class PropertiesComponent extends React.Component {
  constructor(props) {
    super(props);
    this.switchSubtab = this.switchSubtab.bind(this);
    this.state = {
      subtab: SubTabs.local,
      accountNumber: '',
      copyText: 'COPY',
      data: {
        localAssets: [],
        marketAssets: [],
      }
    };
    AppService.getUserBitamrk().then((data) => {
      this.setState({ data });
    }).catch((error) => {
      console.log('getUserBitamrk error :', error);
    });
  }

  switchSubtab(subtab) {
    if (subtab === SubTabs.local) {
      this.setState({ subtab, bitmarks: this.state.data.localAssets });
    } else if (subtab === SubTabs.market) {
      this.setState({ subtab, bitmarks: this.state.data.marketAssets });
    } else if (subtab === SubTabs.global) {
      let bitmarks = this.state.data.localAssets.concat(this.state.data.marketAssets);
      this.setState({ subtab, bitmarks });
    }
  }

  render() {
    return (
      <View style={propertiesStyle.body}>
        <View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft}></TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>Properties</Text>
          <TouchableOpacity style={defaultStyle.headerRight}></TouchableOpacity>
        </View>
        <View style={propertiesStyle.subTabArea}>
          <TouchableOpacity style={propertiesStyle.subTabButton} onPress={() => this.switchSubtab(SubTabs.local)}>
            <View style={propertiesStyle.subTabButtonArea}>
              <View style={propertiesStyle.subTabButtonTextArea}>
                <Text style={propertiesStyle.subTabButtonText}>{SubTabs.local}</Text>
              </View>
              <View style={[propertiesStyle.activeSubTabBar, { backgroundColor: this.state.subtab === SubTabs.local ? '#0060F2' : 'white' }]}></View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={propertiesStyle.subTabButton} onPress={() => this.switchSubtab(SubTabs.market)}>
            <View style={propertiesStyle.subTabButtonArea}>
              <View style={propertiesStyle.subTabButtonTextArea}>
                <Text style={propertiesStyle.subTabButtonText}>{SubTabs.market}</Text>
              </View>
              <View style={[propertiesStyle.activeSubTabBar, { backgroundColor: this.state.subtab === SubTabs.market ? '#0060F2' : 'white' }]}></View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={propertiesStyle.subTabButton} onPress={() => this.switchSubtab(SubTabs.global)}>
            <View style={propertiesStyle.subTabButtonArea}>
              <View style={propertiesStyle.subTabButtonTextArea}>
                <Text style={propertiesStyle.subTabButtonText}>{SubTabs.global}</Text>
              </View>
              <View style={[propertiesStyle.activeSubTabBar, { backgroundColor: this.state.subtab === SubTabs.global ? '#0060F2' : 'white' }]}></View>
            </View>
          </TouchableOpacity>
        </View>
        <ScrollView style={[propertiesStyle.scrollSubTabArea]}>
          <View style={propertiesStyle.contentSubTab}>
            <FlatList
              ref={(ref) => this.listViewElement = ref}
              extraData={this.state}
              data={this.state.bitmarks || []}
              renderItem={({ item }) => {
                return (<TouchableOpacity style={[propertiesStyle.assetRowArea,]} >
                  <Image style={propertiesStyle.assetImage} source={{ uri: config.preive_asset_url + '/' + item.key }} />
                  <View style={propertiesStyle.assetInfoArea}>
                    <Text style={propertiesStyle.assetCreatedDate} >{item.created_at}</Text>
                    <Text style={propertiesStyle.assetName} numberOfLines={1}>{item.name}</Text>
                    <Text style={propertiesStyle.assetCreator} numberOfLines={1}>{item.issuer}</Text>
                  </View>
                  <View style={propertiesStyle.assetBitmark}>
                    {(item.totalPending > 0) && <Text style={propertiesStyle.assetBitmarkPending}>Pending...({item.totalPending + '/' + item.bitmarks.length})</Text>}
                    {item.totalPending === 0 && <View style={propertiesStyle.assetBitmarkNormal}>
                      <Text style={propertiesStyle.assetBitamrksNumber}>{item.bitmarks.length}</Text>
                      <Image style={propertiesStyle.assetBitamrksDetail} source={require('./../../../../assets/imgs/next-icon.png')} />
                      <Image style={propertiesStyle.assetBitamrksDetail} source={require('./../../../../assets/imgs/next-icon.png')} />
                    </View>}
                  </View>
                </TouchableOpacity>)
              }}
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}

PropertiesComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
  screenProps: PropTypes.shape({
    logout: PropTypes.func,
  }),

}