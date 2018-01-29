import { StyleSheet } from 'react-native'
import { ios } from './../../configs';

export default StyleSheet.create({
  header: {
    width: ios.constant.headerSize.width,
    height: ios.constant.headerSize.height,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: ios.constant.headerSize.paddingTop,
  },
  headerLeft: {
    width: 70,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  headerLeftIcon: {
    marginLeft: 23,
    width: 10,
    height: 19,
    resizeMode: 'contain'
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'Avenir Black'
  },
  headerRight: {
    width: 70,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  headerRightText: {
    fontFamily: 'Avenir Light',
    fontSize: 16,
    fontWeight: '300',
    color: '#0060F2',
    marginRight: 10,
    textAlign: 'right',
  },

  bottomButtonArea: {
    position: 'absolute',
    bottom: 0,
    minHeight: ios.constant.buttonHeight + ios.constant.blankFooter,
    width: '100%',
    flexDirection: 'column',
  },
  bottomButton: {
    height: ios.constant.buttonHeight + ios.constant.blankFooter,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
    paddingBottom: ios.constant.blankFooter,
  },
  bottomButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  },
  defaultButton: {
    height: ios.constant.buttonHeight,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
  },
  defaultButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  },
});