import { StackNavigator, } from 'react-navigation';

import { WelcomeComponent } from './welcome';
import { SignInComponent } from './sign-in';
import { FaceTouchIdComponent } from './face-touch-id';
import { NotificationComponent } from './notification';
import { GetStartComponent } from './get-start';
import { BitmarkWebViewComponent } from '../../commons/components';


let OnBoardingComponent = StackNavigator({
  Welcome: { screen: WelcomeComponent, },
  SignIn: { screen: SignInComponent, },
  Notification: { screen: NotificationComponent, },
  FaceTouchId: { screen: FaceTouchIdComponent, },
  GetStart: { screen: GetStartComponent, },
  BitmarkWebView: { screen: BitmarkWebViewComponent, },
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

export { OnBoardingComponent };