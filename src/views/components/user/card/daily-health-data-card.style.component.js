import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  stepsContainer: {
    marginTop: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 16,
  },
  stepsHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepsHeaderText: {
    fontFamily: 'AvenirNextW1G-Light',
    fontSize: 10,
    lineHeight: 12,
    color: 'rgba(0, 0, 0, 0.87)'
  },
  stepsAverageContainer: {
    flexDirection: 'row',
    position: 'absolute',
    right: 0,
    top: 5,
  },
  averageText: {
    fontFamily: 'AvenirNextW1G-Light',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.87)',
  },
  averageNumber: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.87)',
  },
  stepsIcon: {
    width: 33,
    height: 33,
    resizeMode: 'contain'
  },
  sleepIcon: {
    width: 33,
    height: 25,
    resizeMode: 'contain'
  },
  visualization: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 5,
    paddingBottom: 20,
  },
  stepsImageStyle: {
    width: 50,
    height: 47,
    resizeMode: 'contain'
  },
  sleepImageStyle: {
    width: 51,
    height: 30,
    resizeMode: 'contain'
  },
  missingDayText: {
    fontFamily: 'AvenirNextW1G-Light',
    fontSize: 10,
    lineHeight: 16,
    color: '#FF003C',
    textAlign: 'center',
    letterSpacing: 2,
  },
  missingDayIcon: {
    marginTop: 7,
    width: 108,
    height: 104,
    resizeMode: 'contain'
  },
  assetNameContainer: {
    marginTop: 30,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingLeft: 10,
    paddingRight: 10,
  },
  assetName: {
    fontFamily: 'Andale Mono',
    fontSize: 10,
    lineHeight: 20,
    letterSpacing: 1,
    color: 'rgba(0, 0, 0, 0.6)',
  },
});

export { styles };