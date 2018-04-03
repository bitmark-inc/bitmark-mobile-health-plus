import React from 'react';
import PropTypes from 'prop-types';
import { StackNavigator, } from 'react-navigation';



import { IssuanceOptionsComponent } from './issuance-options/issuance-options.component';
import { HealthDataActiveComponent } from './../../donation';

const LocalIssuanceTemp = StackNavigator({
  IssuanceOptions: { screen: IssuanceOptionsComponent, },
  HealthDataActive: { screen: HealthDataActiveComponent, },
}, {
    headerMode: 'none',
    navigationOptions: {
      gesturesEnabled: false,
    },
    cardStyle: {
      shadowOpacity: 0,
    }
  }
);

export class LocalIssuanceComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <LocalIssuanceTemp screenProps={{
        refreshPropertiesScreen: this.props.navigation.state.params.refreshPropertiesScreen,
        homeNavigation: this.props.screenProps.homeNavigation,
        issuanceNavigation: this.props.navigation,
      }} />
    )
  }
}

LocalIssuanceComponent.propTypes = {
  navigation: PropTypes.shape({
    state: PropTypes.shape({
      params: PropTypes.shape({
        refreshPropertiesScreen: PropTypes.func,
      }),
    }),
  }),
  screenProps: PropTypes.shape({
    homeNavigation: PropTypes.shape({
      navigate: PropTypes.func,
      goBack: PropTypes.func,
    }),
  }),
}