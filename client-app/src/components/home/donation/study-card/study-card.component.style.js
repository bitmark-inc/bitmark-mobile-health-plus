import { StyleSheet, Dimensions } from 'react-native';
let currentSize = Dimensions.get('window');
let scale = currentSize.width / 375;

export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    borderRadius: 12,
    overflow: 'hidden',
    height: 170 * scale,
  },
  scale: {
    width: 375,
    height: 170,
    transform: [
      { scaleX: scale },
      { scaleY: scale },
      { translateX: ((currentSize.width - 375) / (2 * scale)) },
      { translateY: (170 * scale - 170) / (2 * scale) },
    ],

  },
  cardBackground: {
    width: 375,
    height: 170,
  },
  title: {
    position: 'absolute',
    left: 16,
    top: 50,
    color: '#F9F9F9',
    backgroundColor: 'rgba(0,0,0,0)',
    fontFamily: 'Avenir black',
    fontSize: 16,
    fontWeight: '800',
  },
  description: {
    position: 'absolute',
    left: 16,
    top: 72,
    color: '#F9F9F9',
    backgroundColor: 'rgba(0,0,0,0)',
    fontFamily: 'Avenir light',
    fontSize: 14,
    fontWeight: '200',
  },
  frequency: {
    position: 'absolute',
    left: 16,
    top: 125,
    backgroundColor: 'rgba(0,0,0,0)',
    fontFamily: 'Andale Mono',
    fontSize: 12,
    fontWeight: '200',
  },
  frequencyValue: {
    position: 'absolute',
    left: 201,
    top: 125,
    backgroundColor: 'rgba(0,0,0,0)',
    fontFamily: 'Andale Mono',
    fontSize: 12,
    fontWeight: '200',
  },
  durationLabel: {
    position: 'absolute',
    left: 16,
    top: 145,
    backgroundColor: 'rgba(0,0,0,0)',
    fontFamily: 'Andale Mono',
    fontSize: 12,
    fontWeight: '200',
  },
  durationValue: {
    position: 'absolute',
    left: 201,
    top: 145,
    backgroundColor: 'rgba(0,0,0,0)',
    fontFamily: 'Andale Mono',
    fontSize: 12,
    fontWeight: '200',
  },
});