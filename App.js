import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import Slider from './slider';

class App extends React.Component {
  state = {
    value: 10
  };

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
            onValueChange={(value) => this.setState({ value })}
            onValueChangeThrottle={16}
            onSlideStart={(value) => this.setState({ value })}
            onSlideEnd={(value) => this.setState({ value })}
            min={-50}
            max={200}
            size={30}
            color="#6168e7"
            initialValue={this.state.value}
            sliderTextStyle={{
              fontWeight: 'bold'
            }}
          />
        </View>

        <Text style={{ marginBottom: 30 }}>{ this.state.value }</Text>
      </View>
    )
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  }
});

export default App;
