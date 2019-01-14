import React from 'react';
import { StyleSheet, View } from 'react-native';

import Slider from './slider';

const App = () => (
  <View style={styles.container}>
    <View style={{ width: '100%', paddingLeft: 20, paddingRight: 20, height: 40, marginBottom: 30 }}>
      <Slider/>
    </View>

    <View style={{ width: '100%', paddingLeft: 20, paddingRight: 20, flexDirection: 'row' , height: 40, marginBottom: 30 }}>
      <Slider/>
      <View style={{ width: 20 }}/>
      <Slider/>
    </View>

    <View style={{ width: '100%', paddingLeft: 20, paddingRight: 20, flexDirection: 'row' , height: 40 }}>
      <Slider/>
      <View style={{ width: 5 }}/>
      <Slider/>
      <View style={{ width: 5 }}/>
      <Slider/>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  }
});

export default App;
