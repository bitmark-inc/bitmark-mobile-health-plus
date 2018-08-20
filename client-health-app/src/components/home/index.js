import { StackNavigator, } from 'react-navigation';

import { UserComponent } from './user.component';
import { BitmarkWebViewComponent, BitmarkLegalComponent } from './../../commons/components';
import { AccountDetailComponent, AccountRecoveryComponent, HealthComponent, SupportComponent } from './account';

import {
  StudySettingComponent, StudyDetailComponent, StudyDonationComponent,
  Study1ExitSurvey2Component, Study2EntryInterviewComponent,
  StudyConsentComponent, HealthDataSourceComponent,
} from './donation';

import { BitmarkDetailComponent, AssetImageContentComponent, CaptureAssetPermissionRequestComponent, CaptureAssetPreviewComponent } from './timeline';

let HomeComponent = StackNavigator({
  User: { screen: UserComponent, },
  BitmarkWebView: { screen: BitmarkWebViewComponent, },
  BitmarkLegal: { screen: BitmarkLegalComponent, },
  Account: { screen: AccountDetailComponent, },
  AccountRecovery: { screen: AccountRecoveryComponent, },
  Health: { screen: HealthComponent },
  Support: { screen: SupportComponent },
  StudyDetail: { screen: StudyDetailComponent, },
  StudyConsent: { screen: StudyConsentComponent, },
  StudySetting: { screen: StudySettingComponent, },
  StudyDonation: { screen: StudyDonationComponent, },
  Study1ExitSurvey2: { screen: Study1ExitSurvey2Component, },
  Study2EntryInterview: { screen: Study2EntryInterviewComponent, },
  HealthDataSource: { screen: HealthDataSourceComponent, },
  BitmarkDetail: { screen: BitmarkDetailComponent, },
  AssetImageContent: { screen: AssetImageContentComponent, },
  CaptureAssetPermissionRequest: { screen: CaptureAssetPermissionRequestComponent },
  CaptureAssetPreview: { screen: CaptureAssetPreviewComponent },
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
