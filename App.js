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
            range={[0, 100]}
            size={30}
            onValueChange={(value) => this.setState({ value })}
            onSlideEnd={(value) => this.setState({ value })}
            onSlideStart={(value) => this.setState({ value })}
            initialValue={0}
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
