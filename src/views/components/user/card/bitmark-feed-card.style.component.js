import { convertWidth } from "src/utils";
import { config } from "src/configs";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: '#FBC9D5',
    borderRadius: 10,
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
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardTitle: {
    marginTop: 16,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Light',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.87)'
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
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Black',
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '900',
    color: 'rgba(0, 0, 0, 0.87)'
  },
  cardText: {
    marginTop: 5,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Andale Mono',
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

export {styles};