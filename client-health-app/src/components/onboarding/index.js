import { StackNavigator, } from 'react-navigation';

import { WelcomeComponent } from './welcome';
import { NewAccountComponent } from './new-account';
import { SignInComponent } from './sign-in';
import { FaceTouchIdComponent } from './face-touch-id';
import { NotificationComponent } from './notification';
import { LegalComponent } from './legal';
import { CoachMark1Component } from './coach-mark/coach-mark-1';
import { CoachMark2Component } from './coach-mark/coach-mark-2';
import { BitmarkWebViewComponent } from '../../commons/components';


let OnBoardingComponent = StackNavigator({
  Notification: { screen: NotificationComponent, },
  Welcome: { screen: WelcomeComponent, },
  NewAccount: { screen: NewAccountComponent, },
  SignIn: { screen: SignInComponent, },
  FaceTouchId: { screen: FaceTouchIdComponent, },
  Legal: { screen: LegalComponent, },
  CoachMark1: { screen: CoachMark1Component, },
  CoachMark2: { screen: CoachMark2Component, },
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