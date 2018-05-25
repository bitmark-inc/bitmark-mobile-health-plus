import { StackNavigator } from 'react-navigation';

import { AssetsComponent } from './assets.component';
import { LocalAssetDetailComponent } from './local-asset-detail';
import { LocalPropertyDetailComponent } from './local-property-detail';
import { LocalPropertyTransferComponent } from './local-property-transfer';
import { LocalIssuanceComponent } from './local-issuance';
import { LocalIssueFileComponent, AssetTypeHelpComponent, LocalIssueFileEditLabelComponent } from './local-issue-file';
import { BitmarkWebViewComponent, } from './../../../commons/components';
import { IftttActiveComponent } from './ifttt-active';

let PropertiesComponent = StackNavigator({
  Assets: { screen: AssetsComponent, },
  BitmarkWebView: { screen: BitmarkWebViewComponent},
  LocalIssuance: { screen: LocalIssuanceComponent}
}, {
    headerMode: 'none',
    navigationOptions: {
      gesturesEnabled: false,
    }, cardStyle: {
      shadowOpacity: 0,
    }
  }
);

export {
  PropertiesComponent,
  LocalAssetDetailComponent,
  LocalPropertyDetailComponent,
  LocalPropertyTransferComponent,
  LocalIssueFileComponent,
  AssetTypeHelpComponent,
  LocalIssueFileEditLabelComponent,
  IftttActiveComponent,
};