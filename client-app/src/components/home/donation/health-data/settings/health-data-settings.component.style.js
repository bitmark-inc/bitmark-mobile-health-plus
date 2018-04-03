import { StyleSheet } from 'react-native'
import { convertWidth } from '../../../../../utils';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  healthDataField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minHeight: 45,
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    backgroundColor: '#F5F5F5',
    marginTop: 10,
  },
  healthDataFieldTitle: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: '#0060F2'
  },
  healthDataFieldFrequency: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '300',
  },
  healthDataFieldNextIcon: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
  },

  healthDataFieldDescriptionArea: {
    width: '100%',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
    marginBottom: 5,
  },
  healthDataFieldDescriptionText: {
    marginTop: 15,
    fontFamily: 'Avenir black',
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '300'
  },

  bottomButtonArea: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
  },
  bottomButton: {
    width: convertWidth(337),
    minHeight: 45,
    paddingTop: 11,
    paddingBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
  },
  bottomButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  }
});