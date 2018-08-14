import { StyleSheet } from 'react-native';
import { convertWidth } from '../../../utils';

export default StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#EDF0F4',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.3)'
  },
  contentScroll: {
    width: '100%',
    flexDirection: 'column',
    alignContent: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  contentSubTab: {
    width: '100%',
    flexDirection: 'column',
    paddingTop: 20,
    paddingBottom: 20,
  },
  addIconContainer: {
    position: 'absolute',
    bottom: 25,
    right: 19,
  },

  addIcon: {
    width: 44,
    height: 44,
    resizeMode: 'contain'
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
    marginRight: convertWidth(15),
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
  },
  rowDataTitle: {
    marginLeft: convertWidth(8),
    width: convertWidth(229),
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

  rowDataFooterStatus: {
    fontFamily: 'Avenir Medium',
    fontSize: 14,
    fontStyle: 'italic',
    color: '#A4B5CD',
    marginRight: convertWidth(9),
  },
});