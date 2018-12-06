import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, ActivityIndicator, View,
  StyleSheet,
} from 'react-native';

import { BitmarkDialogComponent } from './bitmark-dialog.component';
import { constants } from 'src/configs';
import { convertWidth } from 'src/utils';

export class BitmarkIndicatorComponent extends React.Component {
  static propTypes = {
    indicator: PropTypes.bool,
    message: PropTypes.string,
    title: PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = {
      indicator: this.props.indicator,
      message: this.props.message,
      title: this.props.title,
    };
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      indicator: nextProps.indicator,
      message: nextProps.message,
      title: nextProps.title,
    });
  }

  render() {
    return (
      <BitmarkDialogComponent style={styles.dialog}>
        <View style={styles.content}>
          {!!this.state.indicator && <ActivityIndicator size="large" style={styles.indicatorImage} />}
          <View style={styles.textArea}>
            {!!this.state.title && <Text style={[styles.indicatorTitle, {
              marginTop: this.state.indicator ? 0 : 23,
            }]}>{this.state.title}</Text>}
            {!!this.state.message && <Text style={styles.indicatorMessage}>{this.state.message}</Text>}
          </View>
        </View>
      </BitmarkDialogComponent>
    );
  }
}

export class DefaultIndicatorComponent extends React.Component {
  render() {
    return (
      <BitmarkDialogComponent style={styles.dialog} dialogStyle={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}>
        <ActivityIndicator size="large" style={styles.indicatorImage} />
      </BitmarkDialogComponent>
    );
  }
}

const styles = StyleSheet.create({
  dialog: {
    zIndex: constants.zIndex.indicator,
  },
  content: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  indicatorImage: {
    width: 90,
    height: 90,
    opacity: 1,
    marginTop: 5,
  },
  textArea: {
    marginBottom: 28,
    alignItems: 'center',
    flexDirection: 'column',
  },
  indicatorTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    width: convertWidth(230),
  },
  indicatorMessage: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    width: convertWidth(235),
    marginTop: 5,
  },
});