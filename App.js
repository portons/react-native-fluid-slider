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

const PADDING = 20;

export default class App extends React.Component {
  constructor() {
    super();

    /* All of these will be moved to props passed to the slider */
    this.state = {
      min: -50,
      max: 200,
      size: 30, // Height of the Slider && (height & width) of the Value & Drop elements
      backgroundColor: '#6168e7',
      valueBorderColor: '#6168e7',
      dropColor: '#6168e7',
      sliderTextColor: 'white',
      valueTextColor: 'black',
      initialValue: 75,
      sliderBorderRadius: 5,
      sliderTextStyle: {
        fontWeight: 'bold'
      }
    };

    /* These 2 are 'Animated Values', which are passed to the Value element, and responsible
     * for its movement animation while dragging */
    this.translateY = new Animated.Value(0);
    this.translateX = new Animated.Value(0);

    this.middle = (this.state.min + this.state.max) / 4;

    /* This one is responsible for the little 'drop' beneath the value */
    this.backdropTranslateY = new Animated.Value(0);

    /* These ones are used for deltaX calculations, when moving the Value element
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
  onTouch = (_, gestureState) => {
    /* Set a flag to prevent 'move' event from changing Value's X position,
       before it's moved to the 'touch' position */
    this.wait = true;

    /* `gestureState.moveX` is the position of the touch ON THE SCREEN, but we need to know where it's relatively
    * to the sidebar's position inside the screen */
    const normalizedMoveX = gestureState.moveX - this.wrapperStartX;

    /* Set the offset to the current touch position */
    if (normalizedMoveX > this.middle) {
      this.offsetX = Math.min(this.sliderWidth - this.state.size, normalizedMoveX - (this.state.size/2));
    } else {
      this.offsetX = Math.max(0, normalizedMoveX - (this.state.size / 2));
    }

    /* Animated the Value element to current touch position, and only then reset 'wait' flag and allow
     * the Value element to be moved */
    Animated.timing(this.translateX, {
      toValue: this.offsetX,
      duration: 100
    }).start(() => {
      this.translateX.setOffset(this.offsetX);
      this.translateX.setValue(0);

      this.wait = false;
    });

    Animated.parallel([
      Animated.spring(this.translateY, {
        toValue: -this.state.size - 1,
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
      onPanResponderMove: (_, gestureState) => {
        if (this.wait) {
          return;
        }

        if (this.offsetX + gestureState.dx < 0) {
          this.overflow = this.offsetX + gestureState.dx;

          return;
        }

        if (this.offsetX + gestureState.dx > this.sliderWidth - this.state.size) {
          this.overflow =
            this.offsetX + gestureState.dx - (this.sliderWidth - this.state.size);

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

  /* Save the width of the slider, for various calculations */
  onSliderLayout = ({ nativeEvent: { layout } }) => {
    this.sliderWidth = layout.width;

    if (this.wrapperStartX) {
      this.setValueInterpolator();
    }
  };

  onWrapperLayout = ({ nativeEvent: { layout } }) => {
    this.wrapperStartX = layout.x;

    if (this.sliderWidth) {
      this.setValueInterpolator();
    }
  };

  /* When we get the slider's width, we can interpolate the values based on the width */
  setValueInterpolator = () => {
    this.valueInterpolator = scaleLinear()
      .domain([0, this.sliderWidth - this.state.size])
      .range([this.state.min, this.state.max])
      .clamp(true);

    /* When the value is interpolated, we can set the initial value & the initial X position */
    this.setInitialValue();
  };

  setInitialValue = () => {
    const { initialValue } = this.state;

    this.valueRef.setNativeProps({ text: `${initialValue.toFixed(0)}` });
    const initialTranslateX = this.valueInterpolator.invert(
      initialValue.toFixed(0)
    );

    this.translateX.setValue(initialTranslateX);
    this.offsetX = initialTranslateX;
  };

  interpolateValue = ({ value }) =>
    this.valueRef.setNativeProps({
      text: `${this.valueInterpolator(value).toFixed(0)}`
    });

  setValueRef = ref => (this.valueRef = ref);

  renderDrop = () => (
    <Animated.View
      style={{
        ...styles.drop,
        backgroundColor: this.state.dropColor,
        height: this.state.size,
        width: this.state.size,
        borderRadius: this.state.size / 2,
        transform: [
          { translateY: this.backdropTranslateY },
          { translateX: this.translateX }
        ]
      }}
    />
  );

  renderSlider = () => (
    <View
      onLayout={this.onSliderLayout}
      style={[
        styles.sliderBar,
        {
          backgroundColor: this.state.backgroundColor,
          height: this.state.size,
          borderRadius: this.state.sliderBorderRadius
        }
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
        height: this.state.size,
        minWidth: this.state.size,
        borderRadius: this.state.size / 2,
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
      />
    </Animated.View>
  );

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.wrapper} {...this.panResponder.panHandlers} onLayout={this.onWrapperLayout}>
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
    position: 'absolute'
  },
  sliderBar: {
    paddingLeft: 12,
    paddingRight: 12,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  value: {
    backgroundColor: 'white',
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
