import React from "react";
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity, Image
} from 'react-native';
import defaultStyle from "../../../../commons/styles";
import style from "./coach-mark-2.component.style";
import userStyle from "../../../home/user.component.style";
import {BottomTabsComponent} from "../../../home/bottom-tabs/bottom-tabs.component";
import {BitmarkComponent} from "../../../../commons/components/bitmark";
import {EventEmitterService} from "../../../../services";
import {AppProcessor} from "../../../../processors";
import {NavigationActions} from 'react-navigation';

const MainTabs = BottomTabsComponent.MainTabs;

export class CoachMark2Component extends React.Component {
  constructor(props) {
    super(props);
  }

  requestHealthKitPermission() {
    AppProcessor.doRequireHealthKitPermission().then(() => {
      this.gotoTimeline();
    }).catch(error => {
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, {error});
      console.log('doRequireHealthKitPermission error :', error);
    });
  }

  gotoTimeline() {
    const resetMainPage = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({routeName: 'Main', params: {justCreatedBitmarkAccount: true}})]
    });

    this.props.screenProps.rootNavigation.dispatch(resetMainPage);
  }

  render() {
    return (
      <View style={style.body}>
        {/*BACKGROUND*/}
        <BitmarkComponent
          backgroundColor={'#EDF0F4'}
          header={(
            <View style={[defaultStyle.header, style.header]}>
              <View style={defaultStyle.headerLeft}>
                <Image style={userStyle.accountIcon} source={require('./../../../../../assets/imgs/account-icon.png')}/>
              </View>
              <Text style={defaultStyle.headerTitle}>BITMARK HEALTH</Text>
              <View style={defaultStyle.headerRight}>
                <Image style={[userStyle.accountIcon, style.rightHeaderIcon]} source={require('./../../../../../assets/imgs/intercom.png')}/>
              </View>
            </View>
          )}
          content={(
            <View style={{flex: 1}}></View>
          )}
          footer={(<BottomTabsComponent mainTab={MainTabs.Timeline}/>)}
        />

        {/*COVER*/}
        <View style={style.cover}></View>

        {/*CONTENT*/}
        <View style={style.content}>
          {/*SIGN*/}
          <View style={style.imageArea}>
            <Image style={style.signWeeklyImage} source={require('./../../../../../assets/imgs/coach_mark_2_sign_weekly.png')}/>
          </View>
          <View style={style.textArea}>
            <Text style={style.text}>{`Register your weekly Apple HealthKit data by clicking “SIGN” everytime\n`}</Text>
            <Text style={style.text}>Please give Bitmark Health permission to access specific (or all) categories of your data in the next
              screen.</Text>
          </View>

          {/*ADD ICON*/}
          <Image style={style.addIcon} source={require('./../../../../../assets/imgs/coach_mark_2_add_icon.png')}/>
          <Text style={[style.text, style.addIconText]}>Add your health record.</Text>

          {/*BUTTON*/}
          <View style={style.buttonsArea}>
            <TouchableOpacity style={style.button} onPress={() => this.requestHealthKitPermission()}>
              <Text style={style.buttonText}>GOT IT!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }
}

CoachMark2Component.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }),
  screenProps: PropTypes.shape({
    rootNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      dispatch: PropTypes.func,
    })
  }),
};