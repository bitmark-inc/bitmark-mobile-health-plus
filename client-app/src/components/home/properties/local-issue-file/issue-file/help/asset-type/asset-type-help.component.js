import React from 'react';
import PropTypes from 'prop-types';
import { Text, View, TouchableOpacity, Image } from "react-native";
import defaultStyles from "../../../../../../../commons/styles";
import assetTypeHelpStyle from "./asset-type-help.component.style";
import applicationDetailStyle from "../../../../../account/application-detail/application-detail.component.style";
import { BitmarkComponent } from "../../../../../../../commons/components/bitmark";
import { config } from "../../../../../../../configs";

export class AssetTypeHelpComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <BitmarkComponent
        header={(<View style={applicationDetailStyle.header}>
          <TouchableOpacity style={defaultStyles.headerLeft} onPress={() => this.props.navigation.goBack()} >
            <Image style={defaultStyles.headerLeftIcon} source={require('./../../../../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
        </View>)}
        content={(
          <View style={assetTypeHelpStyle.content}>
            {/*Title*/}
            <Text style={assetTypeHelpStyle.title}>WHAT IS ASSET TYPE?</Text>

            {/*Description*/}
            <Text style={assetTypeHelpStyle.text}>
              Assets are private by default, so that only current bitmark holders can access the assets. You may also select to make an asset public, which means that anyone can access the asset, regardless of whether they are currently an owner. Note that
              <Text style={assetTypeHelpStyle.textBold}>
                {` you cannot change the asset type after it is registered on the blockchain. `}
              </Text>
              For example, you cannot change a private asset to a public asset or vice versa.
            </Text>

            <TouchableOpacity style={assetTypeHelpStyle.learnMore} onPress={() => {
              this.props.navigation.navigate('BitmarkWebView', {
                title: 'Bitmark Blockchain', sourceUrl: config.bitmark_web_site + '/resources/blockchain?env=app',
                isFullScreen: true
              })
            }}>
              <Text style={assetTypeHelpStyle.learnMoreText}>LEARN MORE »</Text>
            </TouchableOpacity>
          </ View>
        )}>
      </BitmarkComponent>
    )
  }
}

AssetTypeHelpComponent.propTypes = {
};

AssetTypeHelpComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
};