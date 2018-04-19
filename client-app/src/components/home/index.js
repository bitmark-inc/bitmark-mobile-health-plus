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
  HealthDataMetadataComponent,
  HealthDataDataSourceComponent,
  HealthDataBitmarkComponent,
  Study1ExitSurvey2Component,
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
  HealthDataMetadata: { screen: HealthDataMetadataComponent, },
  HealthDataDataSource: { screen: HealthDataDataSourceComponent, },
  Study1ExitSurvey2: { screen: Study1ExitSurvey2Component, },

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