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
import PropTypes from 'prop-types';

export default class Slider extends React.PureComponent {
  constructor(props) {
    super(props);

    /* These 2 are 'Animated Values', which are passed to the Value element, and responsible
     * for its movement animation while dragging */
    this.translateY = new Animated.Value(0);
    this.translateX = new Animated.Value(0);

    this.middle = (props.min + props.max) / 4;

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
      this.offsetX = Math.min(this.sliderWidth - this.props.size, normalizedMoveX - (this.props.size/2));
    } else {
      this.offsetX = Math.max(0, normalizedMoveX - (this.props.size / 2));
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
        toValue: -this.props.size - 1,
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

        if (this.offsetX + gestureState.dx > this.sliderWidth - this.props.size) {
          this.overflow =
            this.offsetX + gestureState.dx - (this.sliderWidth - this.props.size);

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
      .domain([0, this.sliderWidth - this.props.size])
      .range([this.props.min, this.props.max])
      .clamp(true);

    /* When the value is interpolated, we can set the initial value & the initial X position */
    this.setInitialValue();
  };

  setInitialValue = () => {
    const { initialValue } = this.props;

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
        backgroundColor: this.props.dropColor || this.props.color,
        height: this.props.size,
        width: this.props.size,
        borderRadius: this.props.size / 2,
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
          backgroundColor: this.props.backgroundColor || this.props.color,
          height: this.props.size,
          borderRadius: this.props.sliderBorderRadius
        }
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: this.props.sliderTextColor },
          this.props.sliderTextStyle
        ]}
      >
        {this.props.min}
      </Text>
      <Text
        style={[
          styles.label,
          { color: this.props.sliderTextColor },
          this.props.sliderTextStyle
        ]}
      >
        {this.props.max}
      </Text>
    </View>
  );

  renderValue = () => (
    <Animated.View
      pointerEvents="none"
      style={{
        ...styles.value,
        borderColor: this.props.valueBorderColor || this.props.color,
        height: this.props.size,
        minWidth: this.props.size,
        borderRadius: this.props.size / 2,
        transform: [
          { translateY: this.translateY },
          { translateX: this.translateX }
        ]
      }}
    >
      <TextInput
        allowFontScaling={false}
        style={[styles.label, { color: this.props.valueTextColor }]}
        ref={this.setValueRef}
        editable={false}
      />
    </Animated.View>
  );

  render() {
    return (
      <View style={styles.wrapper} {...this.panResponder.panHandlers} onLayout={this.onWrapperLayout}>
        {this.renderDrop()}

        {this.renderSlider()}

        {this.renderValue()}
      </View>
    );
  }
}

Slider.defaultProps = {
  min: 0,
  max: 100,
  size: 30,
  color: '#6168e7',
  sliderTextColor: 'white',
  valueTextColor: 'black',
  initialValue: 50,
  sliderBorderRadius: 5,
  sliderTextStyle: {
    fontWeight: 'bold'
  }
};

Slider.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
  color: PropTypes.string,
  backgroundColor: PropTypes.string,
  valueBorderColor: PropTypes.string,
  dropColor: PropTypes.string,
  sliderTextColor: PropTypes.string,
  valueTextColor: PropTypes.string,
  initialValue: PropTypes.number.isRequired,
  sliderBorderRadius: PropTypes.number,
  sliderTextStyle: PropTypes.object
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
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
