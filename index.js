import { Platform } from 'react-native'

export default Platform.select({
  ios: require('./lib/slick-slider.ios'),
  android: require('./lib/slick-slider.android')
});
