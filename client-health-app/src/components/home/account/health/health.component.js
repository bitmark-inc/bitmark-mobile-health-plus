import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, Image
} from 'react-native';

import { BitmarkComponent } from '../../../../commons/components';

import defaultStyle from '../../../../commons/styles';
import style from './health.component.style';
import { BitmarkOneTabButtonComponent } from '../../../../commons/components/bitmark-button';

export class HealthComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <BitmarkComponent
        backgroundColor='#F5F5F5'
        header={(<View style={defaultStyle.header}>
          <BitmarkOneTabButtonComponent style={defaultStyle.headerLeft} onPress={() => this.props.navigation.goBack()}>
            <Image style={defaultStyle.headerLeftIcon} source={require('./../../../../../assets/imgs/header_blue_icon.png')} />
          </BitmarkOneTabButtonComponent>
          <Text style={defaultStyle.headerTitle}>iOS HEALTH</Text>
          <BitmarkOneTabButtonComponent style={defaultStyle.headerRight} />
        </View>)}

        content={(<View style={style.body}>
          <BitmarkOneTabButtonComponent style={[defaultStyle.itemContainer, style.itemContainer]} onPress={() => this.props.navigation.navigate('HealthDataSource')}>
            <View style={[defaultStyle.itemBottomBorderContainer, { justifyContent: 'space-between', }]}>
              <Text style={defaultStyle.text}>View Data Type</Text>
              <Image style={defaultStyle.iconArrowRight} source={require('./../../../../../assets/imgs/arrow-right.png')} />
            </View>
          </BitmarkOneTabButtonComponent>

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