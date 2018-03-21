import React from 'react';
import PropTypes from 'prop-types';
import {
  View, Text, TouchableOpacity,
} from 'react-native';

import inactiveStyles from './inactive-donation.component.style';

export class InactiveDonationComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (<View style={inactiveStyles.disableContent}>
      <Text style={inactiveStyles.enableTitle}>DONATE YOUR DATA</Text>
      <Text style={inactiveStyles.enableMessage}>
        Your activity and personal health data is of value to public health researchers. Use Bitmark to donate your bitmarked data to help advance their studies.
      </Text>
      <TouchableOpacity style={inactiveStyles.enableButton} onPress={() => this.props.navigation.navigate('DoActiveDonation')}>
        <Text style={inactiveStyles.enableButtonText}>GET STARTED!</Text>
      </TouchableOpacity>
    </View>);
  }
}

InactiveDonationComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
}
