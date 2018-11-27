import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  StyleSheet,
  Image, View, TouchableOpacity, ScrollView, FlatList, Text, Share
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { isFileRecord, isImageFile, isPdfFile } from "../../utils";
import moment from "moment/moment";
import { config } from "../../configs";


export class SearchResultsComponent extends Component {
  constructor(props) {
    super(props);
  }

  goToDetailScreen(bitmark, bitmarkType) {
    Actions.bitmarkDetail({ bitmark, bitmarkType });
  }

  shareBitmark(asset) {
    if (asset.filePath) {
      Share.share({ title: i18n.t('BitmarkListComponent_shareTitle'), url: asset.filePath }).then(() => {
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
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity style={styles.bitmarkItemContainer} onPress={() => {
                    isFileRecord(item) ? this.shareBitmark.bind(this)(item.asset) : this.goToDetailScreen.bind(this)(item, 'bitmark_health_data');
                  }}>
                    <View style={(index == results.healthDataBitmarks.length - 1) ? styles.bitmarkLastItem : styles.bitmarkItem}>
                      {/*Thumbnail*/}
                      <Image style={styles.bitmarkThumbnail} source={require('./../../../assets/imgs/health_data_icon.png')} />

                      {/*Content*/}
                      <View style={styles.itemContent}>
                        {/*Name*/}
                        <Text style={styles.assetName}>{item.asset.name}</Text>
                        {/*Status*/}
                        <Text style={styles.bitmarkStatus}>{item.status === 'pending' ? i18n.t('BitmarkListComponent_bitmarkPending') : moment(item.asset.created_at).format('YYYY MMM DD').toUpperCase()}</Text>
                      </View>
                    </View>
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
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity style={styles.bitmarkItemContainer} onPress={() => {
                    (isFileRecord(item) && !isImageFile(item.asset.filePath) && !isPdfFile(item.asset.filePath)) ? this.shareBitmark.bind(this)(item.asset) : this.goToDetailScreen.bind(this)(item, 'bitmark_health_issuance');
                  }}>
                    <View style={(index == results.healthAssetBitmarks.length - 1) ? styles.bitmarkLastItem : styles.bitmarkItem}>
                      {/*Thumbnail*/}
                      {item && item.thumbnail && item.thumbnail.exists ? (
                        <View>
                          <Image style={styles.bitmarkThumbnail} source={{ uri: `${item.thumbnail.path}` }} />
                          {item.thumbnail.multiple &&
                            <Image style={styles.multipleFilesIcon} source={require('./../../../assets/imgs/multiple_files_icon.png')} />
                          }
                        </View>
                      ) : (
                          <Image style={styles.bitmarkThumbnail} source={require('./../../../assets/imgs/unknown_file_type_icon.png')} />
                        )}

                      {/*Content*/}
                      <View style={styles.itemContent}>
                        {/*Name*/}
                        <Text style={styles.assetName}>{item.asset.name}</Text>
                        {/*Status*/}
                        <Text style={styles.bitmarkStatus}>{item.status === 'pending' ? i18n.t('BitmarkListComponent_bitmarkPending') : moment(item.asset.created_at).format('YYYY MMM DD').toUpperCase()}</Text>

                        {/*Tags*/}
                        {(item.tags && item.tags.length) ? (
                          <View style={styles.tagListContainer}>
                            {(item.tags || []).map(tag => {
                              return (
                                <View key={tag.value} style={styles.taggingItemContainer}>
                                  <Text style={styles.taggingItem}>#{tag.value}</Text>
                                </View>
                              );
                            })
                            }
                          </View>
                        ) : null
                        }
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
    padding: 8,
    paddingTop: 0,
    paddingBottom: 0,
  },
  bitmarkItem: {
    borderBottomWidth: 0.3,
    borderBottomColor: '#999999',
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 8,
  },
  bitmarkLastItem: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 8,
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
  },
  tagListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  taggingItemContainer: {
    flexDirection: 'row',
    padding: 5,
    paddingTop: 2,
    paddingBottom: 2,
    backgroundColor: '#ECECEC',
    marginRight: 10,
    marginTop: 13
  },
  taggingItem: {
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next' : 'Avenir Light',
    fontSize: 14,
    fontWeight: '300',
  }

});
