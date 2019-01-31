import { Platform } from 'react-native'

export default Platform.select({
  ios: require('./lib/slick-slider.ios.js'),
  android: require('./lib/slick-slider.android.js')
});
