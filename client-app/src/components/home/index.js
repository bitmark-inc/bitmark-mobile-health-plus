import { StackNavigator, } from 'react-navigation';
import { UserComponent } from './user.component';
import { MarketPairComponent, MarketLoginComponent, MarketViewerComponent } from './markets';
import {
  LocalPropertyDetailComponent,
  LocalAssetDetailComponent,
  LocalAddPropertyComponent,
  MarketPropertyDetailComponent,
  MarketAssetDetailComponent,
  MarketBitmarkDepositComponent,
  MarketBitmarkWithdrawComponent,
  LocalPropertyTransferComponent,
} from './properties';
import { ApplicationDetailComponent } from './application-detail';
import { BitmarkPrivacyComponent, BitmarkTermsComponent } from './../../commons/components';

let HomeComponent = StackNavigator({
  User: { screen: UserComponent, },
  MarketPair: { screen: MarketPairComponent, },
  MarketLogin: { screen: MarketLoginComponent, },
  MarketViewer: { screen: MarketViewerComponent, },
  LocalAssetDetail: { screen: LocalAssetDetailComponent, },
  LocalPropertyDetail: { screen: LocalPropertyDetailComponent, },
  LocalPropertyTransfer: { screen: LocalPropertyTransferComponent, },
  MarketAssetDetail: { screen: MarketAssetDetailComponent, },
  MarketPropertyDetail: { screen: MarketPropertyDetailComponent, },
  MarketBitmarkDeposit: { screen: MarketBitmarkDepositComponent, },
  MarketBitmarkWithdraw: { screen: MarketBitmarkWithdrawComponent, },
  LocalAddProperty: { screen: LocalAddPropertyComponent, },
  ApplicationDetail: { screen: ApplicationDetailComponent, },
  BitmarkPrivacy: { screen: BitmarkPrivacyComponent, },
  BitmarkTerms: { screen: BitmarkTermsComponent, },
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