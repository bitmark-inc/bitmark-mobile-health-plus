import { StackNavigator, } from 'react-navigation';
import { UserComponent } from './user.component';
import { MarketPairComponent, MarketLoginComponent, MarketViewerComponent } from './markets';
import { PropertyDetailComponent, AssetDetailComponent } from './properties';

let HomeComponent = StackNavigator({
  User: { screen: UserComponent, },
  MarketPair: { screen: MarketPairComponent, },
  MarketLogin: { screen: MarketLoginComponent, },
  MarketViewer: { screen: MarketViewerComponent, },
  AssetDetail: { screen: AssetDetailComponent, },
  PropertyDetail: { screen: PropertyDetailComponent, },
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