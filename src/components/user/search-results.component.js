import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  StyleSheet,
  Image, View, TouchableOpacity, ScrollView, FlatList, Text, Share
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { isFileRecord } from "../../utils";
import moment from "moment/moment";


export class SearchResultsComponent extends Component {
  constructor(props) {
    super(props);
  }

  goToDetailScreen(bitmark, bitmarkType) {
    Actions.bitmarkDetail({bitmark, bitmarkType});
  }

  downloadBitmark(asset) {
    if (asset.filePath) {
      Share.share({title: i18n.t('BitmarkListComponent_shareTitle'), url: asset.filePath}).then(() => {
      }).catch(error => {
        console.log('Share error:', error);
      })
    }
  }

  render() {
    let results = this.props.results;

    return (
      <View style={this.props.style}>
        {/*RESULTS*/}
        {results.length ? <ScrollView style={styles.scrollView}>
          {/*HEALTH DATA RESULTS*/}
          {(results.healthDataBitmarks && results.healthDataBitmarks.length) ? <View style={styles.resultsContainer}>
            <Text style={styles.resultHeaderText}>Health data</Text>
            <FlatList
              contentContainerStyle={[styles.bitmarksContainer]}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              data={results.healthDataBitmarks}
              extraData={this.props}
              renderItem={({item}) => {
                return (
                  <TouchableOpacity style={styles.bitmarkItemContainer} onPress={() => {
                    isFileRecord(item) ? this.downloadBitmark.bind(this)(item.asset) : this.goToDetailScreen.bind(this)(item, 'bitmark_health_data');
                  }}>
                    <View style={styles.bitmarkItem}>
                      {/*Thumbnail*/}
                      <Image style={styles.bitmarkThumbnail} source={require('./../../../assets/imgs/health_data_icon.png')}/>

                      {/*Content*/}
                      <View style={styles.itemContent}>
                        <Text style={styles.assetName}>{item.asset.name}</Text>
                        <Text
                          style={styles.bitmarkStatus}>{item.status === 'pending' ? i18n.t('BitmarkListComponent_bitmarkPending') : moment(item.asset.created_at).format('YYYY MMM DD').toUpperCase()}</Text>
                      </View></View>
                  </TouchableOpacity>
                );
              }}
            />
          </View> : null
          }

          {/*HEALTH ASSET RESULTS*/}
          {(results.healthAssetBitmarks && results.healthAssetBitmarks.length) ? <View style={styles.resultsContainer}>
            <Text style={styles.resultHeaderText}>Medical records</Text>
            <FlatList
              contentContainerStyle={[styles.bitmarksContainer]}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              data={results.healthAssetBitmarks}
              extraData={this.props}
              renderItem={({item}) => {
                return (
                  <TouchableOpacity style={styles.bitmarkItemContainer} onPress={() => {
                    isFileRecord(item) ? this.downloadBitmark.bind(this)(item.asset) : this.goToDetailScreen.bind(this)(item, 'bitmark_health_issuance');
                  }}>
                    <View style={styles.bitmarkItem}>
                      {/*Thumbnail*/}
                      {item && item.thumbnail && item.thumbnail.exists ? (
                        <View>
                          <Image style={styles.bitmarkThumbnail} source={{uri: `${item.thumbnail.path}`}}/>
                          {item.thumbnail.multiple &&
                          <Image style={styles.multipleFilesIcon} source={require('./../../../assets/imgs/multiple_files_icon.png')}/>
                          }
                        </View>
                      ) : (
                        <Image style={styles.bitmarkThumbnail} source={require('./../../../assets/imgs/unknown_file_type_icon.png')}/>
                      )}

                      {/*Content*/}
                      <View style={styles.itemContent}>
                        <Text style={styles.assetName}>{item.asset.name}</Text>
                        <Text
                          style={styles.bitmarkStatus}>{item.status === 'pending' ? i18n.t('BitmarkListComponent_bitmarkPending') : moment(item.asset.created_at).format('YYYY MMM DD').toUpperCase()}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View> : null
          }
        </ScrollView> : null
        }

        {/*NO RESULTS*/}
        {(results.length == 0) ?
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>{global.i18n.t("SearchResultsComponent_noResults")}</Text>
        </View> : null
        }
      </View>
    );
  }
}

SearchResultsComponent.propTypes = {
  results: PropTypes.object,
  style: PropTypes.object
};

const styles = StyleSheet.create({
  noResultsContainer: {
    marginTop: 10,
    alignItems: 'center'
  },
  noResultsText: {
    fontSize: 17,
    fontFamily: 'Avenir light',
    color: '#404040'
  },
  scrollView: {
  },

  resultsContainer: {
    marginTop: 10,
  },

  resultHeaderText: {
    fontSize: 12,
    fontFamily: 'Avenir medium',
    color: '#000000',
    marginLeft: 5
  },
  bitmarksContainer: {
    backgroundColor: 'white',
    borderRadius: 5
  },
  bitmarkItemContainer: {
    height: 90,
    padding: 8,
  },
  bitmarkItem: {
    height: 85,
    borderBottomWidth: 0.3,
    borderBottomColor: '#999999',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  bitmarkThumbnail: {
    width: 60,
    height: 60,
    resizeMode: 'stretch'
  },
  multipleFilesIcon: {
    width: 10,
    height: 12,
    resizeMode: 'contain',
    position: 'absolute',
    top: 5,
    left: 45
  },
  itemContent: {
    marginLeft: 10,
    height: '100%',
    justifyContent: 'center',
    flex: 1
  },
  assetName: {
    fontSize: 16,
    fontFamily: 'Avenir black',
    color: '#000000',
    fontWeight: '900'
  },
  bitmarkStatus: {
    fontSize: 14,
    fontFamily: 'Avenir medium',
    color: '#000000',
    marginTop: 5
  }
});