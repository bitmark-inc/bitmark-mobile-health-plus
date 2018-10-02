import React from 'react';
import {
  View, Image, Text,
  StyleSheet
} from 'react-native';

import codePush from "react-native-code-push";
import { MainComponent } from './main.component';

export class CodePushComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: null,
      progress: 0,
    };

    codePush.getCurrentPackage().then(updateInfo => {
      console.log('current package :', updateInfo);
    });
  }

  codePushStatusDidChange(status) {
    switch (status) {
      case codePush.SyncStatus.CHECKING_FOR_UPDATE:
        this.setState({ status: 'checking' });
        break;
      case codePush.SyncStatus.DOWNLOADING_PACKAGE:
        this.setState({ status: 'downloading' });
        break;
      case codePush.SyncStatus.INSTALLING_UPDATE:
        this.setState({ status: 'installing' });
        break;
      case codePush.SyncStatus.UP_TO_DATE:
        this.setState({ status: 'updated' });
        break;
      case codePush.SyncStatus.UPDATE_INSTALLED:
        this.setState({ status: 'updated' });
        break;
    }
  }

  codePushDownloadDidProgress(progress) {
    this.setState({ progress: Math.floor(progress.receivedBytes * 100 / progress.totalBytes) });
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.state.status && (this.state.status === 'downloading' || this.state.status === 'installing') && <View style={styles.body}>
          <View style={{ flex: 1 }} />
          <View style={styles.content}>
            <View>
              <Image style={styles.bitmarkIcon} source={require('./../../assets/imgs/loading.png')} />
            </View>
            <View style={styles.statusContainer}>
              <Text style={this.state.status === 'downloading' ? styles.updatingStatus : styles.completedStatus}>
                {this.state.status === 'downloading' ? i18n.t('CodePushComponent_status1') : i18n.t('CodePushComponent_status2')}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={{ width: `${this.state.progress}%`, backgroundColor: '#0060F2', flex: 1 }}>
              </View>
            </View>
          </View>
        </View>}
        <MainComponent />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    zIndex: 1000
  },

  content: {
    flex: 1,
    alignItems: 'center'
  },

  bitmarkIcon: {
    marginTop: -24,
    width: 285,
    height: 48,
    resizeMode: 'contain'
  },

  statusContainer: {
    position: 'absolute',
    bottom: 50,
  },

  updatingStatus: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Avenir Black',
    color: '#A4B5CD'
  },

  completedStatus: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Avenir Black',
    color: '#0060F2'
  },

  progressBar: {
    position: 'absolute',
    width: '100%',
    height: 5,
    bottom: 0
  }
});