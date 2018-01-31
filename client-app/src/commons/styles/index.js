import iosDefaultStyle from './ios.style';
import androidDefaultStyle from './android.style';
import { Platform } from 'react-native';

export { iosDefaultStyle, androidDefaultStyle };
export default Platform.select({
  ios: iosDefaultStyle,
  android: androidDefaultStyle
})