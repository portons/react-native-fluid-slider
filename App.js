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

    /* All of these will be moved to props passed to the slider */
    this.state = {
      min: 0,
      max: 150,
      backgroundColor: '#6168e7',
      valueBorderColor: '#6168e7',
      dropColor: '#6168e7',
      sliderTextColor: 'white',
      valueTextColor: 'black',
      initialValue: 75,
      sliderTextStyle: {
        fontWeight: 'bold'
      }
    };

    /* These 2 are 'Animated Values', which are passed to the Value element, and responsible
     * for its movement animation while dragging */
    this.translateY = new Animated.Value(0);
    this.translateX = new Animated.Value(0);

    /* This one is responsible for the little 'drop' beneath the value */
    this.backdropTranslateY = new Animated.Value(0);

    /* These ones are used for deltaY calculations, when moving the Value element
     * The dX always starts from 0, so we need to save its offset */
    this.offsetX = 0;
    this.overflow = 0;

    /* This one adds listeners to the slider component, which are responsible for the 'move' event, that
     * updates the Value position */
    this.setPanResponder();

    /* Value element text is interpolated from the X position. We're listening to the X position changes,
     * And interpolate the Value string accordingly */
    this.translateX.addListener(this.interpolateValue);
  }

  /* On touch, animated the Value & Drop element positions to go 'up' */
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

  /* On touch, animated the Value & Drop element positions to go back 'down' */
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
      .range([this.state.min, this.state.max])
      .clamp(true);

    this.setInitialValue();
  };

  setInitialValue = () => {
    const { initialValue } = this.state;

    this.valueRef.setNativeProps({ text: `${initialValue}` });
    const initialTranslateX = this.valueInterpolator.invert(initialValue);

    this.translateX.setValue(initialTranslateX);
    this.offsetX = initialTranslateX;
  };

  interpolateValue = ({ value }) => this.valueRef.setNativeProps({ text: `${this.valueInterpolator(value)}` });

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
