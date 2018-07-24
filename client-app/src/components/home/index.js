import { StackNavigator, } from 'react-navigation';

import { UserComponent } from './user.component';
import { BitmarkWebViewComponent } from './../../commons/components';
import {
  LocalPropertyDetailComponent,
  LocalAssetDetailComponent,
  LocalPropertyTransferComponent,
  LocalIssueFileComponent,
  LocalIssueFileEditLabelComponent,
  IftttActiveComponent,
  AssetTypeHelpComponent,
} from './properties';

import { TransactionDetailComponent } from './transactions';
import {
  StudyDetailComponent,
  StudySettingComponent,
  StudyDonationComponent,
  StudyConsentComponent,
  HealthDataSourceComponent,
  HealthDataBitmarkComponent,
  Study1ExitSurvey2Component,
  Study2EntryInterviewComponent,
} from './donation';


let HomeComponent = StackNavigator({
  User: { screen: UserComponent, },
  BitmarkWebView: { screen: BitmarkWebViewComponent, },
  LocalAssetDetail: { screen: LocalAssetDetailComponent, },
  LocalPropertyDetail: { screen: LocalPropertyDetailComponent, },
  LocalPropertyTransfer: { screen: LocalPropertyTransferComponent, },
  LocalIssueFile: { screen: LocalIssueFileComponent, },
  AssetTypeHelp: { screen: AssetTypeHelpComponent },
  LocalIssueFileEditLabel: { screen: LocalIssueFileEditLabelComponent, },

  TransactionDetail: { screen: TransactionDetailComponent, },

  StudyDetail: { screen: StudyDetailComponent, },
  StudySetting: { screen: StudySettingComponent, },
  HealthDataBitmark: { screen: HealthDataBitmarkComponent, },
  StudyDonation: { screen: StudyDonationComponent, },
  StudyConsent: { screen: StudyConsentComponent, },
  HealthDataSource: { screen: HealthDataSourceComponent, },
  Study1ExitSurvey2: { screen: Study1ExitSurvey2Component, },
  Study2EntryInterview: { screen: Study2EntryInterviewComponent, },
  IftttActive: { screen: IftttActiveComponent, },

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