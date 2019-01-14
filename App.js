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
        onValueChange={(value) => console.log('LOL', value)}
        onValueChangeThrottle={16}
        onSlideStart={(startValue) => console.log('startValue', startValue)}
        onSlideEnd={(endValue) => console.log('endValue', endValue)}
        min={-50}
        max={200}
        size={30}
        color="#6168e7"
        initialValue={75}
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
