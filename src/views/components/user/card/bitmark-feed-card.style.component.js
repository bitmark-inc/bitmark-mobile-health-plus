import { convertWidth } from "src/utils";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: '#FBC9D5',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    paddingBottom: 16,
  },
  cardTopBar: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  cardTitle: {
    marginTop: 16,
    fontFamily: 'AvenirNextW1G-Light',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.87)',
    letterSpacing: 1.5,
  },
  cardIcon: {
    width: 26,
    height: 33,
    resizeMode: 'contain'
  },
  cardContent: {
    marginTop: 0,
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
  },
  cardHeader: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 24,
    lineHeight: 36,
    color: 'rgba(0, 0, 0, 0.87)',
    letterSpacing: 0.15,
  },
  cardText: {
    marginTop: 5,
    fontFamily: 'Andale Mono',
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)'
  },
  cardBottomBar: {
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  cardNextIcon: {
    width: 12,
    height: 24,
    resizeMode: 'contain',
  }
});

export { styles };