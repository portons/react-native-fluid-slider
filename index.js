import { Platform } from 'react-native'

export default Platform.select({
  ios: require('./lib/slick-slider.ios').default,
  android: require('./lib/slick-slider.android').default
});
