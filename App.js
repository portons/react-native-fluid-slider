import React from 'react';
import {
  StyleSheet,
  Animated,
  View,
  TextInput,
  PanResponder,
  Text
} from 'react-native';
import { scaleLinear } from 'd3-scale';

const PADDING = 15;

export default class App extends React.Component {
  constructor() {
    super();

    this.state = {
      min: 0,
      max: 129,
      backgroundColor: '#6168e7',
      valueBorderColor: '#6168e7',
      dropColor: '#6168e7',
      sliderTextColor: 'white',
      valueTextColor: 'black',
      sliderTextStyle: {
        fontWeight: 'bold'
      }
    };

    this.translateY = new Animated.Value(0);
    this.translateX = new Animated.Value(0);

    this.backdropTranslateY = new Animated.Value(0);

    this.offsetX = 0;
    this.overflow = 0;

    this.setPanResponder();
    this.translateX.addListener(this.interpolateValue);
  }

  onTouch = () => {
    Animated.parallel([
      Animated.spring(this.translateY, {
        toValue: -31,
        duration: 200,
        bounciness: 15
      }),
      Animated.spring(this.backdropTranslateY, {
        toValue: -2,
        duration: 300,
        bounciness: 15
      })
    ]).start();

    return true;
  };

  onRelease = () => {
    Animated.parallel([
      Animated.timing(this.translateY, {
        toValue: 0,
        duration: 200
      }),
      Animated.timing(this.backdropTranslateY, {
        toValue: 0,
        duration: 200
      })
    ]).start();
  };

  setPanResponder = () => {
    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: this.onTouch,
      onPanResponderGrant: () => {
        this.translateX.setOffset(this.offsetX);
        this.translateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (this.offsetX + gestureState.dx < 0) {
          this.overflow = this.offsetX + gestureState.dx;

          return;
        }

        if (this.offsetX + gestureState.dx > this.width - 30) {
          this.overflow = this.offsetX + gestureState.dx - (this.width - 30);

          return;
        }

        this.translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        this.offsetX = this.offsetX + gestureState.dx - this.overflow;
        this.overflow = 0;

        this.onRelease();
        this.translateX.flattenOffset();
      }
    });
  };

  onLayout = ({ nativeEvent: { layout } }) => {
    this.width = layout.width;

    this.setValueInterpolator();
  };

  setValueInterpolator = () => {
    this.valueInterpolator = scaleLinear()
      .domain([0, this.width - PADDING])
      .range([this.state.min, this.state.max]);
  };

  interpolateValue = ({ value }) => this.valueRef.setNativeProps({ text: this.valueInterpolator(value).toString() });

  setValueRef = ref => (this.valueRef = ref);

  renderDrop = () => (
    <Animated.View
      style={{
        ...styles.drop,
        backgroundColor: this.state.dropColor,
        transform: [
          { translateY: this.backdropTranslateY },
          { translateX: this.translateX }
        ]
      }}
    />
  );

  renderSlider = () => (
    <View
      onLayout={this.onLayout}
      style={[
        styles.sliderBar,
        { backgroundColor: this.state.backgroundColor }
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: this.state.sliderTextColor },
          this.state.sliderTextStyle
        ]}
      >
        {this.state.min}
      </Text>
      <Text
        style={[
          styles.label,
          { color: this.state.sliderTextColor },
          this.state.sliderTextStyle
        ]}
      >
        {this.state.max}
      </Text>
    </View>
  );

  renderValue = () => (
    <Animated.View
      pointerEvents="none"
      style={{
        ...styles.value,
        borderColor: this.state.valueBorderColor,
        transform: [
          { translateY: this.translateY },
          { translateX: this.translateX }
        ]
      }}
    >
      <TextInput
        allowFontScaling={false}
        style={[styles.label, { color: this.state.valueTextColor }]}
        ref={this.setValueRef}
        editable={false}
      >
        0
      </TextInput>
    </Animated.View>
  );

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.wrapper} {...this.panResponder.panHandlers}>
          {this.renderDrop()}

          {this.renderSlider()}

          {this.renderValue()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    paddingLeft: PADDING,
    paddingRight: PADDING
  },
  wrapper: {
    width: '100%',
    position: 'relative'
  },
  drop: {
    height: 30,
    width: 30,
    borderRadius: 15,
    position: 'absolute'
  },
  sliderBar: {
    paddingLeft: 12,
    paddingRight: 12,
    width: '100%',
    height: 30,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  value: {
    height: 30,
    width: 30,
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute'
  },
  label: {
    fontSize: 10
  },
  whiteText: {
    color: 'white'
  }
});
