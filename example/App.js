import React from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';

// import Slider from 'react-native-fluid-slider';
const Slider = () => <View />;
// import Slider from '../lib/slider';

class App extends React.Component {
  constructor() {
    super();

    this.animation = new Animated.Value(10);
    this.color = this.animation.interpolate({
      inputRange: [0, 100],
      outputRange: ['red', 'blue']
    });
    this.borderRadius = this.animation.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 50]
    });
    this.rotation = this.animation.interpolate({
      inputRange: [0, 100],
      outputRange: ['0deg', '360deg']
    });
  }

  render() {
    return (
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
            range={[0, 100]}
            size={30}
            leftValueRenderer={() => (
              <Text style={{ color: 'white', fontSize: 7 }}>RED</Text>
            )}
            middleValueRenderer={() => (
              <Text style={{ color: 'white', fontSize: 7 }}>LOL</Text>
            )}
            rightValueRenderer={() => (
              <Text style={{ color: 'white', fontSize: 7 }}>BLUE</Text>
            )}
            onValueChange={value => this.animation.setValue(value)}
            onSlideEnd={value => this.animation.setValue(value)}
            initialValue={10}
            sliderTextStyle={{
              fontWeight: 'bold'
            }}
          />
        </View>

        <Animated.View
          style={{
            width: 100,
            height: 100,
            backgroundColor: this.color,
            marginTop: 30,
            borderRadius: this.borderRadius,
            transform: [{ rotate: this.rotation }]
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  }
});

export default App;
