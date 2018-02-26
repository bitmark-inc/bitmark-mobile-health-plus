import { StackNavigator, } from 'react-navigation';
import { UserComponent } from './user.component';
import { MarketPairComponent, MarketLoginComponent, MarketViewerComponent } from './markets';
import {
  LocalPropertyDetailComponent,
  LocalAssetDetailComponent,
  LocalAddPropertyComponent,
  MarketPropertyDetailComponent,
  MarketAssetDetailComponent,
  BitmarkDepositComponent,
  BitmarkWithdrawComponent,
} from './properties';

let HomeComponent = StackNavigator({
  User: { screen: UserComponent, },
  MarketPair: { screen: MarketPairComponent, },
  MarketLogin: { screen: MarketLoginComponent, },
  MarketViewer: { screen: MarketViewerComponent, },
  LocalAssetDetail: { screen: LocalAssetDetailComponent, },
  LocalPropertyDetail: { screen: LocalPropertyDetailComponent, },
  MarketAssetDetail: { screen: MarketAssetDetailComponent, },
  MarketPropertyDetail: { screen: MarketPropertyDetailComponent, },
  BitmarkDeposit: { screen: BitmarkDepositComponent, },
  BitmarkWithdraw: { screen: BitmarkWithdrawComponent, },
  LocalAddProperty: { screen: LocalAddPropertyComponent, },
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