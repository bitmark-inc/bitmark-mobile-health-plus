import { StackNavigator, } from 'react-navigation';

import { UserComponent } from './user.component';
import { BitmarkWebViewComponent } from './../../commons/components';
import { AccountDetailComponent, AccountRecoveryComponent, ApplicationDetailComponent } from './account';

import {
  StudySettingComponent, StudyDetailComponent, StudyDonationComponent,
  Study1ExitSurvey2Component, Study2EntryInterviewComponent,
  StudyConsentComponent, HealthDataSourceComponent

} from './donation';


let HomeComponent = StackNavigator({
  User: { screen: UserComponent, },
  BitmarkWebView: { screen: BitmarkWebViewComponent, },
  Account: { screen: AccountDetailComponent, },
  AccountRecovery: { screen: AccountRecoveryComponent, },
  ApplicationDetail: { screen: ApplicationDetailComponent, },
  StudyDetail: { screen: StudyDetailComponent, },
  StudyConsent: { screen: StudyConsentComponent, },
  StudySetting: { screen: StudySettingComponent, },
  StudyDonation: { screen: StudyDonationComponent, },
  Study1ExitSurvey2: { screen: Study1ExitSurvey2Component, },
  Study2EntryInterview: { screen: Study2EntryInterviewComponent, },
  HealthDataSource: { screen: HealthDataSourceComponent, },
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