import React from 'react';
import PropTypes from 'prop-types';
import { StackNavigator, } from 'react-navigation';



import { ChooseFileComponent } from './choose-file/choose-file.component';
import { IssueFileComponent } from './issue-file/issue-file.component';
import { EditLabelComponent } from './edit-label/edit-label.component';

const AddPropertyComponent = StackNavigator({
  ChooseFile: { screen: ChooseFileComponent, },
  IssueFile: { screen: IssueFileComponent, },
  EditLabel: { screen: EditLabelComponent, },
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

export class LocalAddPropertyComponent extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <AddPropertyComponent screenProps={{
        refreshPropertiesScreen: this.props.navigation.state.params.refreshPropertiesScreen,
        addPropertyNavigation: this.props.navigation,
      }} />
    )
  }
}

LocalAddPropertyComponent.propTypes = {
  navigation: PropTypes.shape({
    state: PropTypes.shape({
      params: PropTypes.shape({
        refreshPropertiesScreen: PropTypes.func,
      }),
    }),
  }),
}