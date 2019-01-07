import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View
} from 'react-native';

export class ShadowComponent extends Component {
  static propTypes = {
    children: PropTypes.any,
    style: PropTypes.any,
    contentStyle: PropTypes.any,
  };
  render() {
    return (
      <View style={[styles.body, this.props.style]}>
        <View style={[styles.bodyContent, this.props.contentStyle]}>
          {this.props.children}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    shadowOffset: { width: 0, height: 1, }, shadowOpacity: 0.2, shadowColor: '#000000', shadowRadius: 5,
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    borderWidth: 0.1, borderRadius: 4, borderColor: '#F4F2EE',
  },
});

export class OutterShadowComponent extends Component {
  static propTypes = {
    children: PropTypes.any,
    style: PropTypes.any,
    contentStyle: PropTypes.any,
  };
  render() {
    return (
      <View style={[outterStyles.body, this.props.style]}>
        <View style={[outterStyles.bodyContent, this.props.contentStyle]}>
          {this.props.children}
        </View>
      </View>
    );
  }
}

const outterStyles = StyleSheet.create({
  body: {
    padding: 2,
    paddingTop: 0,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 2, },
    shadowOpacity: 0.2,
    shadowColor: '#000000',
    shadowRadius: 5,
  },
  bodyContent: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    borderWidth: 0.1,
    borderTopWidth: 0,
    borderRadius: 4,
    borderColor: '#F4F2EE',
  },
});

export class ShadowTopComponent extends Component {
  static propTypes = {
    children: PropTypes.any,
    style: PropTypes.any,
    contentStyle: PropTypes.any,
  };
  render() {
    return (
      <View style={[tStyles.body, this.props.style]}>
        <View style={[tStyles.bodyContent, this.props.contentStyle]}>
          {this.props.children}
        </View>
      </View>
    );
  }
}

const tStyles = StyleSheet.create({
  body: {
    zIndex: 1,
    shadowOffset: { width: 0, height: 1, }, shadowOpacity: 0.2, shadowRadius: 4,
    flexDirection: 'column', justifyContent: 'center',
  },
  bodyContent: {
    flex: 1, height: '100%', flexDirection: 'column', justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 0.1, borderColor: '#F4F2EE', borderTopLeftRadius: 4, borderTopRightRadius: 4,
  },
});

export class ShadowBottomComponent extends Component {
  static propTypes = {
    children: PropTypes.any,
    style: PropTypes.any,
    contentStyle: PropTypes.any,
  };
  render() {
    return (
      <View style={[bStyles.body, this.props.style]}>
        <View style={[bStyles.bodyContent, this.props.contentStyle]}>
          {this.props.children}
        </View>
      </View>
    );
  }
}

const bStyles = StyleSheet.create({
  body: {
    shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.14, shadowRadius: 5,
    flexDirection: 'column', justifyContent: 'center',
  },
  bodyContent: {
    flex: 1, height: '100%', flexDirection: 'column', justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 0.1, borderColor: '#F4F2EE', borderBottomLeftRadius: 4, borderBottomRightRadius: 4, borderTopWidth: 0,
  },
});

export class ShadowMiddleComponent extends Component {
  static propTypes = {
    children: PropTypes.any,
    style: PropTypes.any,
    contentStyle: PropTypes.any,
  };
  render() {
    return (
      <View style={[mStyles.body, this.props.style]}>
        <View style={[mStyles.bodyContent, this.props.contentStyle]}>
          {this.props.children}
        </View>
      </View>
    );
  }
}

const mStyles = StyleSheet.create({
  body: {
    shadowOffset: { width: 0, height: 1, }, shadowOpacity: 0.14, shadowRadius: 4,
    flexDirection: 'column', justifyContent: 'center',
  },
  bodyContent: {
    flex: 1, height: '100%', flexDirection: 'column', justifyContent: 'center',
    backgroundColor: 'white',
  },
});

