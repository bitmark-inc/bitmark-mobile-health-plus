import React from 'react';
import PropTypes from 'prop-types';
import {
  Text, View, Image
} from 'react-native';
import codePushUpdateStyle from './code-push.component.style';

export class CodePushUpdateComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.shouldRender !== undefined && !this.props.shouldRender) {
      return null;
    }

    return (
      <View style={codePushUpdateStyle.body}>
        <View style={{ flex: 1 }} />
        <View style={codePushUpdateStyle.content}>
          <View>
            <Image style={codePushUpdateStyle.bitmarkIcon} source={require('./../../../assets/imgs/loading-logo.png')} />
          </View>

          <View style={codePushUpdateStyle.statusContainer}>
            <Text style={this.props.status === 'downloading' ? codePushUpdateStyle.updatingStatus : codePushUpdateStyle.completedStatus}>
              {this.props.status === 'downloading' ? 'UPDATING...' : 'COMPLETE!'}
            </Text>
          </View>

          {/*Progress bar*/}
          <View style={codePushUpdateStyle.progressBar}>
            <View style={{ width: `${this.props.progress}%`, backgroundColor: '#0060F2', flex: 1 }}>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

CodePushUpdateComponent.propTypes = {
  status: PropTypes.string,
  progress: PropTypes.number,
  shouldRender: PropTypes.bool,
};