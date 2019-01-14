import React from 'react';
import { StyleSheet, View } from 'react-native';

import Slider from './slider';

const App = () => (
  <View style={styles.container}>
    <View
      style={{
        width: '100%',
        paddingLeft: 20,
        paddingRight: 20,
        height: 40,
        marginBottom: 30
      }}
    >
      <Slider
        min={-50}
        max={200}
        size={30}
        color="#6168e7"
        initialValue={75}
        sliderBorderRadius={5}
        sliderTextStyle={{
          fontWeight: 'bold'
        }}
      />
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
