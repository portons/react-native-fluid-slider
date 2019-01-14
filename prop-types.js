import PropTypes from "prop-types";

const LEFT = 0;
const RIGHT = 1;

export default {
  range: ({ range }) => {
    if (!Array.isArray(range)) {
      return new Error('`range` has to be an array');
    }

    if (range.length !== 2) {
      return new Error('`range` has to be an array with a length of 2');
    }

    if (typeof range[LEFT] !== 'number' || typeof range[RIGHT] !== 'number') {
      return new Error('Both values in `range` have to be numbers');
    }

    if (range[LEFT] === range[RIGHT]) {
      return new Error("Range has to have different values");
    }
  },
  size: PropTypes.number,
  initialValue: ({ initialValue, range }) => {
    if (typeof initialValue !== 'number') {
      return new Error('`initialValue` has to be a number')
    }

    switch (true) {
      case range[LEFT] < range[RIGHT]:
        if (initialValue < range[LEFT] || initialValue > range[RIGHT]) {
          return new Error('`initialValue` has to be in range of [leftValue, rightValue]')
        }

        break;
      case range[LEFT] > range[RIGHT]:
        if (initialValue > range[LEFT] || initialValue < range[RIGHT]) {
          return new Error('`initialValue` has to be in range of [leftValue, rightValue]')
        }
    }
  },
  color: PropTypes.string,
  backgroundColor: PropTypes.string,
  valueBorderColor: PropTypes.string,
  dropColor: PropTypes.string,
  sliderTextColor: PropTypes.string,
  valueTextColor: PropTypes.string,
  sliderBorderRadius: PropTypes.number,
  decimalPrecision: PropTypes.number,
  sliderTextStyle: PropTypes.object,
  onValueChangeThrottle: PropTypes.number,
  onValueChange: PropTypes.func.isRequired,
  onSlideStart: PropTypes.func,
  onSlideEnd: PropTypes.func,
  leftValueRenderer: PropTypes.func,
  rightValueRenderer: PropTypes.func,
}
