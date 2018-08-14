import { StyleSheet } from 'react-native'
import { convertWidth } from './../../utils';

export default StyleSheet.create({
  header: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
  },
  headerLeft: {
    width: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '100%'
  },
  headerLeftIcon: {
    marginLeft: convertWidth(19),
    width: 16,
    height: 16,
    resizeMode: 'contain'
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: convertWidth(375) - 140,
    height: '100%',
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'Avenir Black',
    maxWidth: convertWidth(375) - 140,
  },
  headerRight: {
    width: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  headerRightText: {
    fontFamily: 'Avenir Light',
    fontSize: 16,
    fontWeight: '300',
    color: '#0060F2',
    marginRight: 19,
    textAlign: 'right',
  },
  itemHeaderContainer: {
    height: 32,
    width: '100%',
    borderColor: "#D8D8D8",
    borderBottomWidth: 1,
    justifyContent: 'center',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19)
  },
  itemContainer: {
    height: 44,
    width: '100%',
    backgroundColor: 'white',
    borderColor: "#D8D8D8",
    borderBottomWidth: 1,
    justifyContent: 'center',
    paddingLeft: convertWidth(19),
    paddingRight: convertWidth(19)
  },
  itemNoBorderContainer: {
    height: 44,
    width: '100%',
    justifyContent: 'center',
    paddingLeft: convertWidth(19),
    backgroundColor: 'white'
  },
  itemBottomBorderContainer: {
    flexDirection: 'row',
    borderColor: "#D8D8D8",
    borderBottomWidth: 1,
    flexGrow: 5,
    height: '100%',
    alignItems: 'center',
    paddingRight: convertWidth(19)
  },
  iconBase: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
    marginRight: 13,
  },
  iconArrowRight: {
    width: 8,
    height: 14,
    resizeMode: 'contain'
  },
  textAlignRight: {
    flex: 1,
    textAlign: 'right',
    lineHeight: 20
  },
  text: {
    fontFamily: 'Avenir Light',
    fontSize: 16,
    lineHeight: 44,
    fontWeight: '300',
    textAlign: 'left'
  },
  headerText: {
    fontFamily: 'Avenir Light',
    fontSize: 14,
    lineHeight: 16,
    textAlign: 'left',
    fontWeight: '300',
    color: '#6D6D72'
  },
  sectionContainer: {
    marginTop: 20,
  }
});