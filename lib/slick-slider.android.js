import React from 'react';
import {
  StyleSheet,
  Animated,
  View,
  PanResponder,
  Text
} from 'react-native';
import { scaleLinear } from 'd3-scale';
import throttle from 'lodash.throttle';

import PropTypes from './prop-types';

const LEFT = 0;
const RIGHT = 1;

export default class SlickSliderAndroid extends React.PureComponent {
  constructor(props) {
    super(props);

    /* These 2 are 'Animated Values', which are passed to the Value element, and responsible
     * for its movement animation while dragging */
    this.translateY = new Animated.Value(0);
    this.translateX = new Animated.Value(0);

    this.middle = (props.range[LEFT] + props.range[RIGHT]) / 4;
    this.currentValue = props.initialValue.toFixed(this.props.decimalPrecision);
    this.previousCurrentValue = this.currentValue;

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

    this.state = {
      value: this.currentValue
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.initialValue !== prevProps.initialValue) {
      this.setInitialValue(true);
    }
  }

  /* On touch, animated the Value & Drop element positions to go 'up' */
  onTouch = (_, gestureState) => {
    if (this.props.onSlideStart) {
      this.props.onSlideStart(Number(this.currentValue));
    }
    /* Set a flag to prevent 'move' event from changing Value's X position,
       before it's moved to the 'touch' position */
    this.wait = true;

    /* `gestureState.moveX` is the position of the touch ON THE SCREEN, but we need to know where it's relatively
    * to the sidebar's position inside the screen */
    const normalizedMoveX = gestureState.moveX - this.wrapperStartX;

    /* Set the offset to the current touch position */
    if (normalizedMoveX > this.middle) {
      this.offsetX = Math.min(
        this.sliderWidth - this.props.size,
        normalizedMoveX - this.props.size / 2
      );
    } else {
      this.offsetX = Math.max(0, normalizedMoveX - this.props.size / 2);
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
  onRelease = (_, gestureState) => {
    this.offsetX = this.offsetX + gestureState.dx - this.overflow;
    this.overflow = 0;
    this.translateX.flattenOffset();

    if (this.props.onSlideEnd) {
      this.props.onSlideEnd(Number(this.currentValue));
    }

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

  onMove = (_, gestureState) => {
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
  };

  setPanResponder = () => {
    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: this.onTouch,
      onPanResponderMove: this.onMove,
      onPanResponderRelease: this.onRelease
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
      .range([this.props.range[LEFT], this.props.range[RIGHT]])
      .clamp(true);

    /* When the value is interpolated, we can set the initial value & the initial X position */
    this.setInitialValue();
  };

  setInitialValue = (animate: false) => {
    const { initialValue } = this.props;

    this.isInitial = true;
    this.setValue(initialValue);

    const initialTranslateX = this.valueInterpolator.invert(
      initialValue.toFixed(0)
    );

    if (animate) {
      this.wait = false;

      Animated.timing(this.translateX, {
        toValue: initialTranslateX,
        duration: 100
      }).start(() => {
        this.wait = false;
      });
    } else {
      this.translateX.setValue(initialTranslateX);
    }

    this.offsetX = initialTranslateX;
  };

  interpolateValue = ({ value }) => this.setValue(value);

  setValue = value => {
    if (this.isInitial) {
      this.isInitial = false;

      return;
    }

    this.previousCurrentValue = this.currentValue;
    const interpolatedValue = this.valueInterpolator(value).toFixed(
      this.props.decimalPrecision
    );
    this.currentValue = interpolatedValue;

    if (this.props.onValueChange) {
      this.onValueChange();
    }

    this.setState({ value: interpolatedValue });
  };

  onValueChange = throttle(() => {
    if (this.currentValue !== this.previousCurrentValue) {
      this.props.onValueChange(Number(this.currentValue));
    }
  }, this.props.onValueChangeThrottle);

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
      {
        this.props.leftValueRenderer
          ? this.props.leftValueRenderer()
          : (
            <Text
              style={[
                styles.minMaxLabel,
                { color: this.props.sliderTextColor },
                this.props.sliderTextStyle
              ]}
            >
              {this.props.range[LEFT].toString()}
            </Text>
          )
      }

      {
        this.props.middleValueRenderer && (
          this.props.middleValueRenderer()
        )
      }

      {
        this.props.rightValueRenderer
          ? this.props.rightValueRenderer()
          : (
            <Text
              style={[
                styles.minMaxLabel,
                { color: this.props.sliderTextColor },
                this.props.sliderTextStyle
              ]}
            >
              {this.props.range[RIGHT].toString()}
            </Text>
          )
      }
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
      <Text
        style={[
          styles.valueLabel,
          { color: this.props.valueTextColor },
          this.props.valueTextStyle
        ]}
      >
        { this.state.value }
      </Text>
    </Animated.View>
  );

  render() {
    return (
      <View
        style={styles.wrapper}
        {...this.panResponder.panHandlers}
        onLayout={this.onWrapperLayout}
      >
        {this.renderDrop()}

        {this.renderSlider()}

        {this.renderValue()}
      </View>
    );
  }
}

SlickSliderAndroid.defaultProps = {
  size: 30,
  color: '#6168e7',
  sliderTextColor: 'white',
  valueTextColor: 'black',
  valueTextStyle: {},
  initialValue: 50,
  sliderBorderRadius: 5,
  decimalPrecision: 0,
  onValueChangeThrottle: 16,
  sliderTextStyle: {
    fontWeight: 'bold'
  }
};

SlickSliderAndroid.propTypes = PropTypes;

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
  minMaxLabel: {
    fontSize: 10,
    fontWeight: '600'
  },
  valueLabel: {
    fontSize: 10,
    fontWeight: '500'
  },
  whiteText: {
    color: 'white'
  }
});
