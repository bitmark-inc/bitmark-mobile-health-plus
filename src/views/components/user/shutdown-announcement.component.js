import React, { Component } from 'react';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, SafeAreaView, Linking
} from 'react-native';
import { Actions } from 'react-native-router-flux';

import { convertWidth } from 'src/utils';
import { ShadowTopComponent } from "../../commons";
import { config } from 'src/configs';

export class ShutdownAnnouncementComponent extends Component {
  constructor(props) {
    super(props);
  }

  openLink() {
    Linking.openURL(`${config.webapp_web_site}/health-app-migration`);
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            {/*TOP AREA*/}
            <ShadowTopComponent style={{ height: 40 }} contentStyle={[styles.topArea, styles.paddingContent]}>
              <Text style={[styles.title]}>SHUTTING DOWN BITMARK HEALTH</Text>
              <Image style={styles.logo} source={require('assets/imgs/bitmark-health-icon.png')} />
            </ShadowTopComponent>

            {/*CONTENT*/}
            <View style={[styles.contentArea, styles.paddingContent]}>
              {/*DESC*/}
              <View style={styles.introductionTextArea}>
                <Text style={[styles.introductionDescription]}>
                  {`Dear Bitmark Health Users,\n\nToday we are announcing that we will be shutting down the Health app on `}<Text style={{fontFamily: 'AvenirNextW1G-Bold'}}>August 31, 2019</Text>{`. We’ll walk you through how to install our Bitmark mobile app and migrate your health data.\n\nThank you!\nThe Bitmark team`
                  }
                </Text>
              </View>
            </View>

            {/*BOTTOM AREA*/}
            <View style={[styles.bottomArea, styles.paddingContent]}>
              <TouchableOpacity style={[styles.buttonNext]} onPress={() => Actions.user()}>
                <Text style={[styles.buttonText, { color: 'rgba(255, 0, 60, 0.3)' }]}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.buttonNext]} onPress={() => this.openLink()}>
                <Text style={[styles.buttonText, { color: '#FF003C' }]}>START MIGRATION</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: 'white',
    padding: convertWidth(16),
    paddingTop: convertWidth(16),
  },

  bodyContent: {
    flex: 1,
    backgroundColor: '#F4F2EE',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  paddingContent: {
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16)
  },

  topArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  contentArea: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  bottomArea: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#000000'
  },
  logo: {
    width: 23,
    height: 23,
    resizeMode: 'contain',
  },
  introductionTextArea: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
  },
  introductionDescription: {
    marginTop: 56,
    fontFamily: 'AvenirNextW1G-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'left',
    letterSpacing: 0.25,
  },
  buttonNext: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 16,
    color: '#FF003C',
  },
  buttonText: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 16,
    letterSpacing: 0.75,
  },
});
