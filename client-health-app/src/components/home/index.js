import { StackNavigator, } from 'react-navigation';

import { UserComponent } from './user.component';
import { BitmarkWebViewComponent } from './../../commons/components';
import { AccountDetailComponent, AccountRecoveryComponent, ApplicationDetailComponent } from './account';


let HomeComponent = StackNavigator({
  User: { screen: UserComponent, },
  BitmarkWebView: { screen: BitmarkWebViewComponent, },
  Account: { screen: AccountDetailComponent, },
  AccountRecovery: { screen: AccountRecoveryComponent, },
  ApplicationDetail: { screen: ApplicationDetailComponent, },

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

export { HomeComponent };