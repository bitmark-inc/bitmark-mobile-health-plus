import { StackNavigator, } from 'react-navigation';

import { UserComponent } from './user.component';
import { BitmarkWebViewComponent } from './../../commons/components';
import {
  LocalPropertyDetailComponent,
  LocalAssetDetailComponent,
  LocalPropertyTransferComponent,
  LocalIssueFileComponent,
  LocalIssueFileEditLabelComponent
} from './properties';

import { TransactionDetailComponent } from './transactions';
import {
  StudyDetailComponent,
  StudySettingComponent,
  StudyDonationComponent,
  StudyConsentComponent,
  HealthDataSettingsComponent,
  HealthDataMetadataComponent,
  HealthDataDataSourceComponent,
  HealthDataBitmarkComponent,
} from './donation';


let HomeComponent = StackNavigator({
  User: { screen: UserComponent, },
  BitmarkWebView: { screen: BitmarkWebViewComponent, },
  LocalAssetDetail: { screen: LocalAssetDetailComponent, },
  LocalPropertyDetail: { screen: LocalPropertyDetailComponent, },
  LocalPropertyTransfer: { screen: LocalPropertyTransferComponent, },
  LocalIssueFile: { screen: LocalIssueFileComponent, },
  LocalIssueFileEditLabel: { screen: LocalIssueFileEditLabelComponent, },

  TransactionDetail: { screen: TransactionDetailComponent, },

  StudyDetail: { screen: StudyDetailComponent, },
  StudySetting: { screen: StudySettingComponent, },
  HealthDataBitmark: { screen: HealthDataBitmarkComponent, },
  StudyDonation: { screen: StudyDonationComponent, },
  StudyConsent: { screen: StudyConsentComponent, },
  HealthDataSettings: { screen: HealthDataSettingsComponent, },
  HealthDataMetadata: { screen: HealthDataMetadataComponent, },
  HealthDataDataSource: { screen: HealthDataDataSourceComponent, },

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