import { StackNavigator } from 'react-navigation';

import { AccountDetailComponent } from './account.component';
import { AccountRecoveryComponent } from './account-recovery';

let AccountComponent = StackNavigator({
  AccountDetail: { screen: AccountDetailComponent, },
  AccountRecovery: { screen: AccountRecoveryComponent, },
}, {
    headerMode: 'none',
    navigationOptions: {
      gesturesEnabled: false,
    }, cardStyle: {
      shadowOpacity: 0,
    }
  }
);

export { AccountComponent };