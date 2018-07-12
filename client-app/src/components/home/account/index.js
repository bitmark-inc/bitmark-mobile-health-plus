import { StackNavigator } from 'react-navigation';

import {
  BitmarkWebViewComponent,
} from './../../../commons/components';
import { AccountDetailComponent } from './account.component';
import { AccountRecoveryComponent } from './account-recovery';
import { ApplicationDetailComponent } from './application-detail';
import { WebAccountMigrateComponent, WebAccountSignInComponent } from './web-account';
import { ScanQRCodeComponent } from './scan-qr-code/scan-qr-code.component'


let AccountComponent = StackNavigator({
  AccountDetail: { screen: AccountDetailComponent, },
  AccountRecovery: { screen: AccountRecoveryComponent, },
  ApplicationDetail: { screen: ApplicationDetailComponent, },
  BitmarkWebView: { screen: BitmarkWebViewComponent, },
  WebAccountMigrate: { screen: WebAccountMigrateComponent, },
  WebAccountSignIn: { screen: WebAccountSignInComponent, },
  ScanQRCode: { screen: ScanQRCodeComponent, },
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