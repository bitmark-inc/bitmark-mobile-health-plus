import { convertWidth } from "src/utils";
import { config } from "src/configs";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: '#F4F2EE',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    paddingBottom: 16,
  },
  cardTopBar: {
    position: 'absolute',
    width: '100%',
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    zIndex: 2,
  },
  cardTitle: {
    marginTop: 16,
    fontFamily: 'AvenirNextW1G-Light',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.87)'
  },
  cardIcon: {
    width: 26,
    height: 33,
    resizeMode: 'contain'
  },
  cardContent: {
    marginTop: 16,
    paddingLeft: convertWidth(16),
    paddingRight: convertWidth(16),
  },
  cardImageContainer: {
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    overflow: "hidden"
  },
  cardImage: {
    width: '100%',
    height: 195,
    resizeMode: 'stretch'
  },
  coverThumbnailHeaderBar: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardHeader: {
    fontFamily: 'AvenirNextW1G-Bold',
    fontSize: 24,
    lineHeight: 36,
    color: 'rgba(0, 0, 0, 0.87)'
  },
  cardText: {
    marginTop: 10,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Andale Mono',
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)'
  }
});

export {styles};