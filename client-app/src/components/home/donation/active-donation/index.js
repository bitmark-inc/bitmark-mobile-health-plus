import { StackNavigator, } from 'react-navigation';

import { InactiveDonationComponent } from './inactive-donation.component'
import { DoActiveDonationComponent } from './do-active-donation.component'

let ActiveDonationComponent = StackNavigator({
  InactiveDonation: { screen: InactiveDonationComponent, },
  DoActiveDonation: { screen: DoActiveDonationComponent, },
}, {
    headerMode: 'none',
    navigationOptions: {
      gesturesEnabled: false,
    }, cardStyle: {
      shadowOpacity: 0,
    }
  }
);

export { ActiveDonationComponent, DoActiveDonationComponent };