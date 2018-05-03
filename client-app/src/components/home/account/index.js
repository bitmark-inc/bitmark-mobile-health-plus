import { StackNavigator } from 'react-navigation';

import {
  BitmarkWebViewComponent,
} from './../../../commons/components';
import { AccountDetailComponent } from './account.component';
import { AccountRecoveryComponent } from './account-recovery';
import { ApplicationDetailComponent } from './application-detail';
import { WebAccountMigrateComponent, WebAccountSignInComponent } from './web-account';


let AccountComponent = StackNavigator({
  AccountDetail: { screen: AccountDetailComponent, },
  AccountRecovery: { screen: AccountRecoveryComponent, },
  ApplicationDetail: { screen: ApplicationDetailComponent, },
  BitmarkWebView: { screen: BitmarkWebViewComponent, },
  WebAccountMigrate: { screen: WebAccountMigrateComponent, },
  WebAccountSignIn: { screen: WebAccountSignInComponent, },

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