import { Platform } from 'react-native';

const Slider = Platform.select({
  ios: () => require('./lib/slider.ios').default,
  android: () => require('./lib/slider.android').default
})();

export default Slider;

