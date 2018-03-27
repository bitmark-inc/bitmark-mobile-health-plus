import { StackNavigator, } from 'react-navigation';
import { UserComponent } from './user.component';
import { ApplicationDetailComponent } from './application-detail';
import {
  BitmarkPrivacyComponent,
  BitmarkTermsComponent,
  BitmarkDetailComponent,

} from './../../commons/components';
import {
  LocalPropertyDetailComponent,
  LocalAssetDetailComponent,
  LocalAddPropertyComponent,
  LocalPropertyTransferComponent,
} from './properties';

import { TransactionDetailComponent } from './transactions';
import {
  StudyDetailComponent,
  StudySettingComponent,
  DoActiveDonationComponent,
  BitmarkHealthDataComponent,
  StudyDonationComponent,
  StudyConsentComponent,
} from './donation';


let HomeComponent = StackNavigator({
  User: { screen: UserComponent, },
  BitmarkDetail: { screen: BitmarkDetailComponent, },
  LocalAssetDetail: { screen: LocalAssetDetailComponent, },
  LocalPropertyDetail: { screen: LocalPropertyDetailComponent, },
  LocalPropertyTransfer: { screen: LocalPropertyTransferComponent, },
  LocalAddProperty: { screen: LocalAddPropertyComponent, },
  ApplicationDetail: { screen: ApplicationDetailComponent, },
  BitmarkPrivacy: { screen: BitmarkPrivacyComponent, },
  BitmarkTerms: { screen: BitmarkTermsComponent, },
  TransactionDetail: { screen: TransactionDetailComponent, },
  StudyDetail: { screen: StudyDetailComponent, },
  StudySetting: { screen: StudySettingComponent, },
  DoActiveDonation: { screen: DoActiveDonationComponent, },
  BitmarkHealthData: { screen: BitmarkHealthDataComponent, },
  StudyDonation: { screen: StudyDonationComponent, },
  StudyConsent: { screen: StudyConsentComponent, },

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