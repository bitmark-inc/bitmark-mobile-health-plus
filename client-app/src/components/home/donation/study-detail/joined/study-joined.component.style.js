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
  cardArea: {
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
    marginTop: 5,
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
    width: convertWidth(337),
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '300',
    fontFamily: 'Avenir black',
    color: 'black',
  },
  infoButton: {
    width: '100%',
    height: 48,
    paddingTop: 9,
    paddingBottom: 9,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
  },
  infoButtonText: {
    fontSize: 15,
    fontFamily: 'Avenir Black',
    color: '#0060F2',
    fontWeight: '900',
    marginLeft: 15,
  },
  infoButtonBar: {
    borderTopWidth: 1,
    borderTopColor: '#BDBDBD',
  },

  leaveButton: {
    width: '100%',
    minHeight: 45 + constant.blankFooter / 2,
    paddingTop: 10,
    paddingBottom: Math.max(10, constant.blankFooter),
    backgroundColor: '#FF003C',
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Avenir Black',
    color: 'white',
    textAlign: 'center',
  },

});