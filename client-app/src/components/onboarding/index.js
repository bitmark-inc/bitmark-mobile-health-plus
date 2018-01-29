import { StackNavigator, } from 'react-navigation';

import { WelcomeComponent } from './welcome';
import { NewAccountComponent } from './new-account';
import { SignInComponent } from './sign-in';


let OnboardingComponent = StackNavigator({
  Welcome: { screen: WelcomeComponent, },
  NewAccount: { screen: NewAccountComponent, },
  SignIn: { screen: SignInComponent, },
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

export { OnboardingComponent };