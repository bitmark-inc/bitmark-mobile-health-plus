import React from 'react';
import {
  View, Image, Text,
  StyleSheet,
} from 'react-native';

import { EventEmitterService } from '../../services';
import { convertWidth } from '../../utils';
import { Actions } from 'react-native-router-flux';
import { DataProcessor } from '../../processors';
import { config } from '../../configs';

export class LocalStorageMigrationComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handerProgress = this.handerProgress.bind(this);
    this.state = {
      status: 'updating',
      progress: 0,
    };
  }

  componentDidMount() {
    EventEmitterService.on(EventEmitterService.events.APP_MIGRATION_FILE_LOCAL_STORAGE_PERCENT, this.handerProgress);

    DataProcessor.doMigrateFilesToLocalStorage().catch(error => {
      console.log('doMigrateFilesToLocalStorage error:', error);
      EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
    });
  }

  componentWillUnmount() {
    EventEmitterService.remove(EventEmitterService.events.APP_MIGRATION_FILE_LOCAL_STORAGE_PERCENT, this.handerProgress)
  }

  handerProgress(progress) {
    let status = this.state.status;
    if (progress === 100) {
      status = 'completed';
      setTimeout(Actions.pop, 2000);
    }
    this.setState({ progress, status });
  }

  render() {
    return (
      <View style={styles.body}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image style={styles.bitmarkIcon} source={require('./../../../assets/imgs/loading.png')} />
        </View>
        <View style={styles.statusContainer}>
          {!!this.state.status && <Text style={this.state.status === 'updating' ? styles.updatingStatus : styles.completedStatus}>
            {this.state.status === 'updating' ? i18n.t('LocalStorageMigrationComponent_status1') : i18n.t('LocalStorageMigrationComponent_status2')}
          </Text>}
        </View>
        <View style={styles.progressBar}>
          <View style={{ width: `${this.state.progress}%`, backgroundColor: '#0060F2', flex: 1 }}>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    zIndex: 1000
  },

  bitmarkIcon: {
    width: convertWidth(213),
    height: 45 * convertWidth(213) / 213,
    resizeMode: 'contain',
  },

  statusContainer: {
    position: 'absolute', bottom: 50,
    width: '100%',
    alignItems: 'center', justifyContent: 'center',
  },

  updatingStatus: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: config.localization.startsWith('vi') ? null : 'Avenir Black',
    color: '#A4B5CD'
  },

  completedStatus: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: config.localization.startsWith('vi') ? null : 'Avenir Black',
    color: '#0060F2'
  },

  progressBar: {
    position: 'absolute',
    width: '100%',
    height: 5,
    bottom: 0
  }
});