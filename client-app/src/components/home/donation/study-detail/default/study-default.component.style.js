import { StyleSheet, Platform } from 'react-native';
import {
  ios,
  android // TODO
} from './../../../../../configs';
import { convertWidth } from '../../../../../utils';
let constant = Platform.select({
  ios: ios.constant,
  android: android.constant
});
export default StyleSheet.create({
  content: {
    width: '100%',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  contentCenter: {
    width: '100%',
  },
  researcherArea: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginTop: 12,
  },
  researcherImage: {
    width: 90,
    height: 90,
    resizeMode: 'contain'
  },
  studyResearcherName: {
    fontFamily: 'Avenir black',
    fontSize: 15,
    fontWeight: '900',
    color: 'black',
    marginTop: 10,
  },

  studyResearcherLink: {
    marginLeft: 15,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Avenir black',
    color: '#0060F2',
    marginTop: 12,
  },
  cardMessage: {
    marginTop: 7,
    width: convertWidth(340),
    fontSize: 15,
    fontWeight: '300',
    fontFamily: 'Avenir black',
    color: 'black',
    marginLeft: 15,
    marginBottom: 3,
  },
  infoArea: {
    width: '100%',
    marginTop: 20,
  },
  infoAreaTitle: {
    marginLeft: 15,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: 'Avenir black',
    color: 'black',
  },
  infoAreaListItem: {
    marginTop: 5,
    width: '100%',
    backgroundColor: 'white',
    paddingTop: 9,
    paddingBottom: 9,
    paddingLeft: 16,
    paddingRight: 16,
  },
  infoAreaItem: {
    fontSize: 15,
    fontWeight: '300',
    fontFamily: 'Avenir Light',
    color: 'black',
    lineHeight: 22,
  },

  requireButton: {
    marginTop: 14,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
  },
  requireIcon: {
    marginLeft: 16,
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  requireMessage: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: 'Avenir black',
    color: 'black',
  },
  bottomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
    marginTop: 20,
    width: '100%',
    height: 45 + constant.blankFooter / 2,
    paddingTop: 10,
    paddingBottom: Math.max(10, constant.blankFooter),
  },
  bottomButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  },
});