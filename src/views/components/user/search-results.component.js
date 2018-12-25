import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  StyleSheet,
  Image, View, TouchableOpacity, ScrollView, FlatList, Text, Share
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import moment from "moment/moment";
import { isFileRecord, isImageFile, isPdfFile } from 'src/utils';
import { config } from 'src/configs';


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
        {/*RESULTS STATUS*/}
        <View style={styles.resultStatusContainer}>
          {/*Back button*/}
          <TouchableOpacity onPress={() => {this.props.cancel()}}>
            <Image style={styles.backIcon} source={require('assets/imgs/back-icon-black.png')} />
          </TouchableOpacity>

          {/*Number of results*/}
          <Text style={styles.numberOfResultsText}>{global.i18n.t("SearchResultsComponent_numberOfResults", {number: (results && results.length) ? results.length : 0})}</Text>
        </View>

        {/*RESULTS*/}
        {results.length ? <ScrollView style={styles.scrollView}>
          {/*HEALTH DATA RESULTS*/}
          {(results.healthDataBitmarks && results.healthDataBitmarks.length) ? <View style={styles.resultsContainer}>
            <View style={[styles.resultHeaderContainer]}>
              <Text style={styles.resultHeaderText}>{global.i18n.t("SearchResultsComponent_healthData")}</Text>
            </View>

            <FlatList
              contentContainerStyle={[styles.bitmarksContainer]}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              data={results.healthDataBitmarks}
              extraData={this.props}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity style={[styles.bitmarkItemContainer, (index == results.healthDataBitmarks.length - 1) ? styles.bitmarkLastItemContainer : {}]} onPress={() => {
                    isFileRecord(item.asset) ? this.shareBitmark.bind(this)(item.asset) : this.goToDetailScreen.bind(this)(item, 'bitmark_health_data');
                  }}>
                    <View style={[styles.bitmarkItem]}>
                      {/*Thumbnail*/}
                      <Image style={styles.bitmarkThumbnail} source={require('assets/imgs/health_data_icon.png')} />

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
            <View style={[styles.resultHeaderContainer]}>
              <Text style={styles.resultHeaderText}>{global.i18n.t("SearchResultsComponent_medicalRecords")}</Text>
            </View>
            <FlatList
              contentContainerStyle={[styles.bitmarksContainer]}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              data={results.healthAssetBitmarks}
              extraData={this.props}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity style={[styles.bitmarkItemContainer, (index == results.healthAssetBitmarks.length - 1) ? styles.bitmarkLastItemContainer : {}]} onPress={() => {
                    (isFileRecord(item.asset) && !isImageFile(item.asset.filePath) && !isPdfFile(item.asset.filePath)) ? this.shareBitmark.bind(this)(item.asset) : this.goToDetailScreen.bind(this)(item, 'bitmark_health_issuance');
                  }}>
                    <View style={[styles.bitmarkItem]}>
                      {/*Thumbnail*/}
                      {item && item.thumbnail && item.thumbnail.exists ? (
                        <View>
                          <Image style={styles.bitmarkThumbnail} source={{ uri: `${item.thumbnail.path}` }} />
                          {item.thumbnail.multiple &&
                            <Image style={styles.multipleFilesIcon} source={require('assets/imgs/multiple_files_icon.png')} />
                          }
                        </View>
                      ) : (
                          <Image style={styles.bitmarkThumbnail} source={require('assets/imgs/unknown_file_type_icon.png')} />
                        )}

                      {/*Content*/}
                      <View style={styles.itemContent}>
                        {/*Name*/}
                        <Text style={styles.assetName}>{item.asset.name}</Text>
                        {/*Status*/}
                        <Text style={styles.bitmarkStatus}>{item.status === 'pending' ? i18n.t('BitmarkListComponent_bitmarkPending').toUpperCase() : moment(item.asset.created_at).format('YYYY MMM DD').toUpperCase()}</Text>

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
      </View>
    );
  }
}

SearchResultsComponent.propTypes = {
  results: PropTypes.object,
  style: PropTypes.object,
  cancel: PropTypes.func
};

const styles = StyleSheet.create({
  resultStatusContainer: {
    height: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    alignItems: 'center'
  },
  backIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain'
  },
  numberOfResultsText: {
    fontSize: 17,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Andale Mono',
    color: 'rgba(0, 0, 0, 0.6)'
  },
  scrollView: {
  },

  resultsContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  resultHeaderContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 40,
    justifyContent: 'center',
    borderColor: '#F5F5F5',
    borderWidth: 1,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.2,
    // shadowRadius: 1,
  },
  resultHeaderText: {
    fontSize: 10,
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir light',
    color: 'rgba(0, 0, 0, 0.87)',
    marginLeft: 16,
  },
  bitmarksContainer: {
    backgroundColor: 'white',
    borderRadius: 5
  },
  bitmarkItemContainer: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 0,
    borderColor: '#F5F5F5',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 0 },
    // shadowOpacity: 0.2,
    // shadowRadius: 1,
  },
  bitmarkLastItemContainer: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  bitmarkItem: {
    flexDirection: 'row',
    paddingTop: 16,
    paddingBottom: 16,
  },
  bitmarkThumbnail: {
    width: 40,
    height: 40,
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
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Andale Mono',
    color: 'rgba(0, 0, 0, 0.6)',
    marginTop: 4
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
    fontFamily: config.localization.startsWith('vi') ? 'Avenir Next W1G' : 'Avenir Light',
    fontSize: 14,
    fontWeight: '300',
  }

});
