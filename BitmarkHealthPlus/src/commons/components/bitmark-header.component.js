import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View, TouchableOpacity,
} from 'react-native';

import { convertWidth } from './../../utils';


export class LoadingComponent extends Component {
  static propTypes = {
    headerLeft: PropTypes.any,
    hideHeaderLeft: PropTypes.bool,
    renderHeaderLeft: PropTypes.func,
    renderHeaderTitle: PropTypes.func,
    hideHeaderRight: PropTypes.bool,
    renderHeaderRight: PropTypes.func,
  };
  render() {
    return (
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {!this.props.renderHeaderLeft && !this.props.hideHeaderLeft && <TouchableOpacity style={[styles.headerLeft, this.props.headerLeft]}>

          </TouchableOpacity>}
          {this.props.renderHeaderLeft && this.props.renderHeaderLeft()}

          {!this.props.renderHeaderTitle && <View style={[styles.headerLeft, this.props.headerLeft]}>

          </View>}
          {this.props.renderHeaderTitle && this.props.renderHeaderTitle()}

          {!this.props.renderHeaderRight && !this.props.renderHeaderRight && <TouchableOpacity style={[styles.headerLeft, this.props.headerLeft]}>

          </TouchableOpacity>}
          {this.props.renderHeaderRight && this.props.renderHeaderRight()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    flex: 1,
  },
  headerContent: {

  },
  headerLeft: {
    width: convertWidth(191),
    height: 49 * convertWidth(191) / 191,
    resizeMode: 'contain',
  },
});
