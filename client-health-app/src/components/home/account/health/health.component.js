import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image
} from 'react-native';

import { BitmarkComponent } from '../../../../commons/components';

import defaultStyle from '../../../../commons/styles';
import style from './health.component.style';

export class HealthComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <BitmarkComponent
        backgroundColor='#F5F5F5'
        header={(<View style={defaultStyle.header}>
          <TouchableOpacity style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('./../../../../../assets/imgs/header_blue_icon.png')} />
          </TouchableOpacity>
          <Text style={defaultStyle.headerTitle}>iOS HEALTH</Text>
          <TouchableOpacity style={defaultStyle.headerRight} />
        </View>)}

        content={(<View style={style.body}>
          <TouchableOpacity style={[defaultStyle.itemContainer, style.itemContainer]} onPress={() => this.props.navigation.navigate('HealthDataSource')}>
            <Text style={defaultStyle.text}>View Data Type</Text>

            <Text style={defaultStyle.textAlignRight}>
              <Image style={defaultStyle.iconArrowRight} source={require('./../../../../../assets/imgs/arrow-right.png')} />
            </Text>
          </TouchableOpacity>

          <View style={style.textContainer}>
            <Text style={style.text}>Can:</Text>
            <Text style={style.text}>
              Extract data from the Health app and register property rights. Repeats weekly (Sunday 11AM).
            </Text>
          </View>
        </View >
        )}
      />
    );
  }
}

HealthComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func
  }),
};