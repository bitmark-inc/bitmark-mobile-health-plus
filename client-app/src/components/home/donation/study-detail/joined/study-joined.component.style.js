import { StyleSheet, Platform } from 'react-native';
import {
  ios,
  android // TODO
} from './../../../../../configs';
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
    width: 340,
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
    width: 337,
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
    marginLeft: 15,
  },

  leaveButton: {
    marginBottom: 0,
    width: '100%',
    height: 42,
    backgroundColor: '#FF003C',
    paddingTop: 9,
    paddingBottom: 9,
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Avenir Black',
    color: 'white',
    textAlign: 'center',
  },

  //history
  historyContent: {
    flexDirection: 'column',
    backgroundColor: 'white',
    height: 594,
  },
  historyStudyCode: {
    fontFamily: 'Avenir Black',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '900',
    marginLeft: 17,
    marginTop: 27,
  },
  historyDonorId: {
    fontFamily: 'Avenir Black',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '900',
    marginLeft: 17,
  },
  historyDonorAccountNumber: {
    fontFamily: 'Andale Mono',
    fontSize: 14,
    lineHeight: 16,
    marginLeft: 17,
    marginTop: 20,
  },
  historyTitleTable: {
    fontFamily: 'Avenir Black',
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
    marginLeft: 17,
    marginTop: 24,
  },
  historyTable: {
    flexDirection: 'column',
  },
  historyTableHeaderRow: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    marginLeft: 17,
    marginBottom: 5,
    width: 344,
    height: 20,
    backgroundColor: '#EDF0F4',
  },
  historyTableRow: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    marginLeft: 17,
    width: 344,
    height: 22,
  },
  historyTableColumn1: {
    marginLeft: 3,
    fontFamily: 'Andale Mono',
    fontSize: 12,
    lineHeight: 14,
    width: 90,
  },
  historyTableColumn2: {
    fontFamily: 'Avenir Black',
    fontSize: 13,
    lineHeight: 18,
    overflow: 'hidden',
    width: 245,
    fontWeight: '900',
  },

  //donation
  donationContent: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
    height: 594,
  },
  donationTitle: {
    fontFamily: 'Avenir Black',
    fontSize: 30,
    textAlign: 'center',
    color: '#0060F2',
    fontWeight: '900',
    width: 287,
  },
  donationIcon: {
    marginTop: 40,
    width: 237,
    height: 237,
    resizeMode: 'contain'
  },
  donationDescription: {
    fontFamily: 'Avenir Black',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '300',
    width: 344,
    marginTop: 30,
  },
  donationButton: {
    width: '100%',
    height: 42,
    backgroundColor: '#0060F2',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
  },
  donationButtonText: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Avenir Black',
    color: 'white',
    textAlign: 'center',
  },

  donationRequestTouchIdTitle: {
    fontFamily: 'Arial',
    fontSize: 15.42,
    textAlign: 'center',
    fontWeight: '800',
    width: 248,
    height: 106,
    marginTop: 26,
  },

  donationRequestTouchIdCancelButton: {
    borderTopColor: '#919191',
    borderTopWidth: 1,
    width: '100%',
    paddingTop: 10,
    paddingBottom: 10,
  },
  donationRequestTouchIdCancelButtonText: {
    fontFamily: 'Arial',
    fontSize: 15.42,
    textAlign: 'center',
    fontWeight: '800',
    color: '#0060F2',
  },

  donationSuccessTitle: {
    fontFamily: 'Arial',
    fontSize: 15.42,
    textAlign: 'center',
    fontWeight: '800',
    width: 248,
    marginTop: 26,
  },
  donationSuccessDescription: {
    fontFamily: 'Arial',
    fontSize: 15.42,
    textAlign: 'center',
    fontWeight: '300',
    width: 208,
    marginTop: 10,
    marginBottom: 25,
  },

  bottomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#0060F2',
    marginTop: 20,
    width: '100%',
    height: 45,
    paddingBottom: constant.blankFooter,
  },
  bottomButtonText: {
    fontFamily: 'Avenir black',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: 'white'
  },

});