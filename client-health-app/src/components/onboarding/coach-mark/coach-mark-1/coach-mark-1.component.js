import React from "react";
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image
} from 'react-native';
import defaultStyle from "../../../../commons/styles";
import style from "./coach-mark-1.component.style";

export class CoachMark1Component extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={style.body}>
        <View style={style.content}>
          {/*HEADER*/}
          <View style={style.header}>
            <Text style={defaultStyle.headerTitle}>BITMARK HEALTH</Text>
          </View>

          {/*IMAGES*/}
          <View style={[style.backgroundImageArea]}>
            <Image style={style.topLeftImage} source={require('./../../../../../assets/imgs/coach_mark_1_top_left.png')} />
            <Image style={style.topRightImage} source={require('./../../../../../assets/imgs/coach_mark_1_top_right.png')} />
            <Image style={style.bottomLeftImage} source={require('./../../../../../assets/imgs/coach_mark_1_bottom_left.png')} />
            <Image style={style.bottomRightImage} source={require('./../../../../../assets/imgs/coach_mark_1_bottom_right.png')} />
          </View>

          <Image style={style.addIcon} source={require('./../../../../../assets/imgs/icon-add.png')} />

          {/*BUTTON*/}
          <View style={style.buttonsArea}>
            <TouchableOpacity style={style.button} onPress={() => this.props.navigation.navigate('CoachMark2')}>
              <Text style={style.buttonText}>GOT IT!</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/*FOOTER*/}
        <View style={style.footer}></View>
      </View>
    )
  }
}

CoachMark1Component.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }),
};