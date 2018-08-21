import { StyleSheet, } from 'react-native';
import { convertWidth } from '../../../../utils';


export default StyleSheet.create({
  body: {
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.3)',
    backgroundColor: '#FFFFFF'
  },
  bodyContent: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 25
  },
  contentContainer: {
    width: '100%',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
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
  eyeIcon: {
    width: 16,
    height: 11,
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
  bitmarkConfirmedText: {
    marginTop: 25,
    fontWeight: '300',
    fontFamily: 'Avenir Medium',
    fontSize: 14,
    color: '#0060F2',
  },

  informationArea: {
    backgroundColor: 'white',
    borderTopWidth: 0.3,
    borderBottomWidth: 0.3,
    borderColor: '#BCBBC1',
  },
  informationRow: {
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
    fontSize: 15,
  },
  informationRowValue: {
    fontWeight: '300',
    fontFamily: 'Avenir Light',
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'right',
    marginRight: convertWidth(19),
    flex: 1
  },
  informationRowBarArea: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  informationRowBarLine: {
    borderBottomWidth: 0.3,
    borderColor: '#BCBBC1',
    width: '100%',
  },

  viewRegistryButton: {
    height: 44,
    backgroundColor: 'white',
    width: convertWidth(375),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19),
  },
  viewRegistryButtonText: {
    fontFamily: 'Avenir Medium',
    fontSize: 14,
    color: '#0060F2'
  },
  titleArea: {
    width: '100%',
    marginBottom: 20,
  },
  titleText: {
    fontSize: 16,
    fontFamily: 'Avenir Medium'
  },
  subTitleArea: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center'
  },
  subTitleText: {
    fontSize: 14,
    fontFamily: 'Avenir Light',
    marginLeft: 5,
    color: '#999999'
  },
  fromSecondRow: {
    marginTop: 10
  },
  textAlignRight: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '300',
    fontFamily: 'Avenir Light'
  },
  privateInfoArea: {
    marginTop: 25
  },
  separator: {
    width: '100%',
    height: 10,
    backgroundColor: '#EDF0F4'
  }
});