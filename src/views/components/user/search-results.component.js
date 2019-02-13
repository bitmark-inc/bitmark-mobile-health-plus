import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  StyleSheet,
  Image, View, TouchableOpacity, ScrollView, FlatList, Text, Share
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import moment from "moment/moment";
import { isMedicalRecord, isImageFile, isPdfFile } from 'src/utils';
import Highlighter from 'react-native-highlight-words';


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
        console.log('SearchResultsComponent Share error:', error);
      })
    }
  }

  render() {
    let results = this.props.results;
    let numberOfResults = (results && results.length) ? results.length : 0;

    return (
      <View style={this.props.style}>
        {/*RESULTS STATUS*/}
        <View style={styles.resultStatusContainer}>
          {/*Back button*/}
          <TouchableOpacity onPress={() => { this.props.cancel() }}>
            <Image style={styles.backIcon} source={require('assets/imgs/back-icon-black.png')} />
          </TouchableOpacity>

          {/*Number of results*/}
          <Text style={styles.numberOfResultsText}>{numberOfResults} {numberOfResults == 1 ? 'RESULT FOUND' : 'RESULTS FOUND'}</Text>
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
                    this.goToDetailScreen.bind(this)(item, 'bitmark_health_data');
                  }}>
                    <View style={[styles.bitmarkItem]}>
                      {/*Thumbnail*/}
                      <Image style={styles.bitmarkThumbnail} source={require('assets/imgs/health_data_icon.png')} />

                      {/*Content*/}
                      <View style={styles.itemContent}>
                        {/*Name*/}
                        <Highlighter
                          style={styles.assetName}
                          highlightStyle={[styles.highlightingText]}
                          searchWords={this.props.searchTerm.split(' ')}
                          textToHighlight={item.asset.name}
                        />
                        {/*Status*/}
                        {item.status === 'pending' ? (
                          <Text style={styles.bitmarkStatus}>{i18n.t('BitmarkListComponent_bitmarkPending')}</Text>
                        ) : (
                            <Highlighter
                              style={styles.bitmarkStatus}
                              highlightStyle={[styles.highlightingText]}
                              searchWords={this.props.searchTerm.split(' ')}
                              textToHighlight={moment(item.asset.created_at).format('MMM DD, YYYY').toUpperCase()}
                            />
                          )
                        }
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
                    (isMedicalRecord(item.asset) && !isImageFile(item.asset.filePath) && !isPdfFile(item.asset.filePath)) ? this.shareBitmark.bind(this)(item.asset) : this.goToDetailScreen.bind(this)(item, 'bitmark_health_issuance');
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
                        <Highlighter
                          style={styles.assetName}
                          highlightStyle={[styles.highlightingText]}
                          searchWords={this.props.searchTerm.split(' ')}
                          textToHighlight={item.asset.name}
                        />
                        {/*Status*/}
                        {item.status === 'pending' ? (
                          <Text style={styles.bitmarkStatus}>{i18n.t('BitmarkListComponent_bitmarkPending')}</Text>
                        ) : (
                            <Highlighter
                              style={styles.bitmarkStatus}
                              highlightStyle={[styles.highlightingText]}
                              searchWords={this.props.searchTerm.split(' ')}
                              textToHighlight={moment(item.asset.created_at).format('MMM DD, YYYY').toUpperCase()}
                            />
                          )
                        }

                        {/*Tags*/}
                        {(item.tags && item.tags.length) ? (
                          <View style={styles.tagListContainer}>
                            {(item.tags || []).map(tag => {
                              return (
                                <View key={tag.value} style={styles.taggingItemContainer}>
                                  {/*<Text style={styles.taggingItem}>#{tag.value}</Text>*/}
                                  <Highlighter
                                    style={styles.taggingItem}
                                    highlightStyle={[styles.highlightingTag]}
                                    searchWords={this.props.searchTerm.split(' ')}
                                    textToHighlight={'#' + tag.value}
                                  />
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
  cancel: PropTypes.func,
  searchTerm: PropTypes.string,
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
    width: 22,
    height: 22,
    resizeMode: 'contain'
  },
  numberOfResultsText: {
    fontSize: 12,
    fontFamily: 'Andale Mono',
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

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,

    elevation: 0,
  },
  resultHeaderText: {
    fontSize: 10,
    fontFamily: 'AvenirNextW1G-Light',
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

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,

    elevation: 0,
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
    left: 25
  },
  itemContent: {
    marginLeft: 10,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flex: 1
  },
  assetName: {
    fontSize: 18,
    lineHeight: 20,
    fontFamily: 'AvenirNextW1G-Bold',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  bitmarkStatus: {
    fontSize: 14,
    fontFamily: 'Andale Mono',
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
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: 'rgba(0, 96, 242, 0.2)',
    marginRight: 10,
    marginTop: 13,
    borderRadius: 4,
  },
  taggingItem: {
    fontFamily: 'Andale Mono',
    fontSize: 14,
    fontWeight: '300',
    color: '#0060F2',
  },
  highlightingText: {
    color: '#0060F2'
  },
  highlightingTag: {
    color: '#0060F2'
  }
});
