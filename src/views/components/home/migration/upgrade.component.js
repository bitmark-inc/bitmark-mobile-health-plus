import React, { Component } from 'react';
import {
  StyleSheet,
  Image, View, TouchableOpacity, Text, SafeAreaView
} from 'react-native';

import { convertWidth } from 'src/utils';
import { ShadowTopComponent } from "src/views/commons";
import { EventEmitterService } from "src/processors";
import PropTypes from 'prop-types';

const UPGRADE_STATE = {
  UPGRADING: 0,
  UPGRADE_COMPLETED: 1,
};

export class UpgradeComponent extends Component {
  static propTypes = {
    phraseWords: PropTypes.any
  };

  constructor(props) {
    super(props);
    this.phraseWords = props.phraseWords;
    console.log('phraseWords:', this.phraseWords);

    this.state = {
      upgradeState: UPGRADE_STATE.UPGRADING
    }
  }

  async componentDidMount() {
    await this.migrateTo12Words(this.phraseWords);
  }

  async migrateTo12Words() {
    // TODO: Call migration for 24 words here

    // If migrate successfully
    this.setState({
      upgradeState: UPGRADE_STATE.UPGRADE_COMPLETED
    })
  }

  reloadApp() {
    console.log('reloadApp...');
    EventEmitterService.emit(EventEmitterService.events.APP_NEED_REFRESH, { justCreatedBitmarkAccount: false, indicator: true });
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.body}>
          <View style={styles.bodyContent}>
            {this.state.upgradeState == UPGRADE_STATE.UPGRADING &&
            <View style={{flex: 1}}>
              {/*TOP AREA*/}
              <ShadowTopComponent style={{ height: 40 }} contentStyle={[styles.topArea, styles.paddingContent]}>
                <Text style={[styles.title]}>UPGRADE IN PROCESS...</Text>
              </ShadowTopComponent>

              {/*CONTENT*/}
              <View style={[styles.contentArea, styles.paddingContent]}>
                {/*Upgrade progress container*/}
                <View style={[styles.progressContainer]}>
                  <Text style={[styles.introductionDescription]}>Your account is now being upgraded.</Text>
                  <View style={[styles.progressBar]}>

                  </View>
                </View>

                {/*Desc*/}
                <View style={styles.introductionTextArea}>
                  <Text style={[styles.introductionDescription]}>
                    {
                      `Please do not switch to another app during this time.\n\nAfter the upgrade, your existing properties will be updated automatically. No data or information will be lost in the process.`
                    }
                  </Text>
                </View>
              </View>
            </View>
            }

            {this.state.upgradeState == UPGRADE_STATE.UPGRADE_COMPLETED &&
            <View style={{flex: 1}}>
              {/*TOP AREA*/}
              <ShadowTopComponent style={{ height: 40 }} contentStyle={[styles.topArea, styles.paddingContent]}>
                <Text style={[styles.title]}>UPGRADE COMPLETE!</Text>
              </ShadowTopComponent>

              {/*CONTENT*/}
              <View style={[styles.contentArea, styles.paddingContent]}>
                {/*Desc*/}
                <View style={styles.introductionTextArea}>
                  <Text style={[styles.introductionDescription]}>
                    {`Your account upgrade has been finished!`}
                  </Text>
                  <View style={[styles.iconContainer]}>
                    <Image style={styles.successIcon} source={require('assets/imgs/success-icon.png')} />
                  </View>
                </View>
              </View>

              {/*BOTTOM AREA*/}
              <View style={[styles.bottomArea, styles.paddingContent]}>
                <TouchableOpacity style={[styles.buttonNext]} onPress={() => {this.reloadApp.bind(this)()}}>
                  <Text style={[styles.buttonText, { color: '#FF003C' }]}>VIEW YOUR ACCOUNT</Text>
                </TouchableOpacity>
              </View>
            </View>
            }
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
    backgroundColor: '#0060F2',
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
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 10,
    letterSpacing: 1.5,
    color: '#FFFFFF'
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
    fontSize: 17,
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
  progressContainer: {
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  iconContainer: {
    marginTop: 80,
    width: '100%',
    alignItems: 'center'
  },
  successIcon: {
    width: 74,
    height: 74,
    resizeMode: 'contain'
  }
});
