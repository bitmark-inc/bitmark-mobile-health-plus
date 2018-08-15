import { StyleSheet, } from 'react-native';
import { convertWidth } from '../../../../utils';


export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  bodyContent: {
    flexDirection: 'column',
    alignItems: 'center',
  },

  imageArea: {
    backgroundColor: 'white',
    width: '100%',
    minHeight: 229,
    flexDirection: 'column',
    alignItems: 'center',
  },
  assetIcon: {
    marginTop: 44,
    width: 82,
    height: 112,
    resizeMode: 'contain',
  },
  bitmarkPending: {
    fontWeight: '300',
    fontFamily: 'Avenir Medium',
    fontSize: 14,
    marginTop: 25,
    fontStyle: 'italic',
    color: '#A4B5CD',
  },
  bitmarkConfirmed: {
    marginTop: 25,
  },
  bitmarkConfirmedText: {
    fontWeight: '300',
    fontFamily: 'Avenir Medium',
    fontSize: 14,
    color: '#0060F2',
  },

  informationArea: {
    width: convertWidth(375),
    marginTop: 40,
    backgroundColor: 'white',
    borderTopWidth: 0.3,
    borderBottomWidth: 0.3,
    borderColor: '#BCBBC1',
  },
  informationRow: {
    width: convertWidth(375),
    minHeight: 44,
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 10,
  },
  informationRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
  },
  informationRowLabel: {
    fontWeight: '300',
    fontFamily: 'Avenir Light',
    fontSize: 16,
    marginLeft: convertWidth(19),
    width: convertWidth(150),
  },
  informationRowValue: {
    fontWeight: '300',
    fontFamily: 'Avenir Light',
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'right',
    width: convertWidth(180),
    marginRight: convertWidth(19),
  },
  informationRowBarArea: {
    marginTop: 10,
    flexDirection: 'row',
    width: convertWidth(375),
    justifyContent: 'flex-end',
  },
  informationRowBarLine: {
    borderBottomWidth: 0.3,
    borderColor: '#BCBBC1',
    width: convertWidth(356),
  },

  viewRegistryButton: {
    marginTop: 37,
    backgroundColor: 'white',
    width: convertWidth(375),
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
  },
  viewRegistryButtonText: {
    fontWeight: '300',
    fontFamily: 'Avenir Light',
    fontSize: 16,
    color: '#0060F2'
  }
});