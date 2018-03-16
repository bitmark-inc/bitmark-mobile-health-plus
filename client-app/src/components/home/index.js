import { StackNavigator, } from 'react-navigation';
import { UserComponent } from './user.component';
import { ApplicationDetailComponent } from './application-detail';
import { BitmarkPrivacyComponent, BitmarkTermsComponent } from './../../commons/components';
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

import { TransactionDetailComponent } from './transactions';


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
  TransactionDetail: { screen: TransactionDetailComponent, },

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