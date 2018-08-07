import { StyleSheet } from 'react-native';
import { convertWidth } from '../../../utils';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#EDF0F4',
    paddingTop: 40,
  },

  rowData: {
    flexDirection: 'row',
    width: convertWidth(375),
  },

  rowDataTime: {
    width: convertWidth(53),
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  rowDataTimeText: {
    width: convertWidth(40),
    textAlign: 'right',
    fontFamily: 'Andale Mono',
    fontSize: 11,
    color: '#0060F2',
  },

  rowDataLineArea: {
    marginLeft: convertWidth(10),
    marginRight: convertWidth(10),
    flexDirection: 'column',
  },
  rowDataLine: {
    borderWidth: 2,
    borderColor: '#0060F2',
    flex: 1,
    position: 'absolute',
    height: '100%'
  },
  rowDataDot: {
    borderColor: '#0060F2',
    borderWidth: 3,
    borderRadius: 6,
    position: 'absolute',
    left: -4,
    top: 0,
    width: 12,
    height: 12,
    backgroundColor: 'white',
  },

  rowDataDetail: {
    paddingBottom: 26,
    marginTop: -26,
    width: convertWidth(282),
  },
  rowDataContent: {
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'column',
  },

  rowDataIcon: {
    width: 21,
    height: 21,
    resizeMode: 'contain',
    marginLeft: convertWidth(8),
  },
  rowDataMainContent: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
  },
  rowDataTitle: {
    marginLeft: convertWidth(8),
    fontFamily: 'Avenir Medium',
    fontSize: 16,
    fontWeight: '600',
  },
  rowDataFooterContent: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },

  rowDataSignButton: {
    marginRight: convertWidth(11),
    borderWidth: 1,
    borderColor: '#0060F2',
    paddingTop: 6,
    paddingBottom: 6,
    textAlign: 'center',
    width: convertWidth(76),
    color: '#0060F2',
    fontWeight: '900',
    fontFamily: 'Avenir Black'
  },




  // rowContainerStyle: {
  //   // justifyContent: 'flex-start',
  //   flex: 0,
  //   borderWidth: 1,
  // },

  // rowDataCircle: {
  //   borderWidth: 3,
  //   borderColor: '#0060F2',
  //   backgroundColor: 'white',
  //   width: 12,
  //   height: 12,
  //   borderRadius: 6,
  //   position: 'absolute',
  //   left: convertWidth(66),
  // },

  // rowDataTime: {
  //   paddingBottom: 10,
  //   width: convertWidth(53),
  //   borderWidth: 1,
  //   borderColor: 'red'
  // },

  // rowDataTimeText: {
  //   width: convertWidth(40),
  //   marginLeft: convertWidth(13),
  //   fontFamily: 'Andale Mono',
  //   fontSize: 11,
  //   textAlign: 'right',
  //   color: '#0060F2',
  // },

  // rowDataDetail: {
  //   flexDirection: 'column',
  //   minHeight: 43,
  //   width: convertWidth(282),
  //   paddingBottom: 30,
  //   marginTop: -23,
  // },
  // rowDataDetailContent: {
  //   flexDirection: 'column',
  //   paddingBottom: 11,
  //   paddingTop: 11,
  // },
  // rowDataIcon: {
  //   width: 21,
  //   height: 21,
  //   resizeMode: 'contain',
  //   marginLeft: convertWidth(8),
  //   marginRight: convertWidth(8),
  // },
  // rowDataDetailMainContent: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  // },

  // rowDataDetailTitle: {
  //   fontFamily: 'Avenir Medium',
  //   fontSize: 16,
  //   fontWeight: '600',
  // },
  // rowDataDetailFooterContent: {
  //   flexDirection: 'row',
  //   justifyContent: 'flex-end',
  //   marginTop: 15,
  // },

  // rowDataDetailSignButton: {
  //   marginRight: convertWidth(11),
  //   borderWidth: 1,
  //   borderColor: '#0060F2',
  //   paddingTop: 6,
  //   paddingBottom: 6,
  //   textAlign: 'center',
  //   width: convertWidth(76),
  //   color: '#0060F2',
  //   fontWeight: '900',
  //   fontFamily: 'Avenir Black'
  // },

});