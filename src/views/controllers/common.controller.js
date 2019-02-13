import { Alert } from 'react-native';
import { AppProcessor, EventEmitterService, IndexDBService, CommonModel, CacheData } from "src/processors";
import { FileUtil, isMedicalRecord } from 'src/utils';
import { UserBitmarksStore, UserBitmarksActions } from '../stores';

const issue = (issueParams, callBack) => {
  let {filePath, assetName, metadataList, quantity, fileType, note, tags} = issueParams;

  if (!CacheData.networkStatus) {
    AppProcessor.showOfflineMessage();
    return;
  }
  if (assetName.length > 64) assetName = assetName.substring(0, 64);

  AppProcessor.doCheckFileToIssue(filePath).then(({ asset }) => {
    if (asset && asset.name && !asset.canIssue) {
      let message = asset.registrant === CacheData.userInformation.bitmarkAccountNumber
        ? i18n.t('CaptureAssetComponent_alertMessage11', { type: fileType })
        : i18n.t('CaptureAssetComponent_alertMessage12', { type: fileType });

      Alert.alert('', message, [{
        text: i18n.t('CaptureAssetComponent_alertButton1'), style: 'cancel'
      }]);
    } else {
      AppProcessor.doIssueFile({filePath, assetName, metadataList, quantity, note, tags}, {
        indicator: true, title: i18n.t('CaptureAssetComponent_title'), message: ''
      }).then(async (data) => {
        if (data) {
          await callBack(data);
          FileUtil.removeSafe(filePath);
        }
      }).catch(error => {
        Alert.alert(i18n.t('CaptureAssetComponent_alertTitle2'), i18n.t('CaptureAssetComponent_alertMessage2'));
        console.log('issue bitmark error :', error);
      });
    }
  }).catch(error => {
    console.log('Check file error :', error);
    EventEmitterService.emit(EventEmitterService.events.APP_PROCESS_ERROR, { error });
  });
};

const search = async (searchTerm) => {
  let searchResults = { length: 0, healthDataBitmarks: [], healthAssetBitmarks: [] };

  if (searchTerm) {
    let queryResult = await IndexDBService.searchIndexedBitmarks(searchTerm);
    let searchResultBitmarkIds = queryResult.bitmarkIds;
    let tagRecords = queryResult.tagRecords;

    if (searchResultBitmarkIds.length) {
      let userCompData = UserBitmarksStore.getState().data;
      let allBitmarks = userCompData.healthDataBitmarks.concat(userCompData.healthAssetBitmarks);
      let allBitmarksMap = {};
      allBitmarks.forEach(bitmark => allBitmarksMap[bitmark.id] = bitmark);

      let tagRecordsMap = {};
      tagRecords.forEach(tagRecord => tagRecordsMap[tagRecord.bitmarkId] = tagRecord);

      for (let i = 0; i < searchResultBitmarkIds.length; i++) {
        let bitmark = allBitmarksMap[searchResultBitmarkIds[i]];

        if (bitmark) {
          if (isMedicalRecord(bitmark.asset)) {
            if (!bitmark.thumbnail) {
              bitmark.thumbnail = await CommonModel.checkThumbnailForBitmark(bitmark.id);
            }

            if (tagRecordsMap[bitmark.id]) {
              // Augment tag info
              let searchTermParts = searchTerm.split(' ');
              let tagsStr = tagRecordsMap[bitmark.id].tags;
              let tags = tagsStr.split(' ');

              tags = tags.filter((tag) => {
                let matched = false;
                for (let index = 0; index < searchTermParts.length; index++) {
                  if (tag.toLowerCase().startsWith(searchTermParts[index].toLowerCase())) {
                    matched = true;
                    break;
                  }
                }
                return matched;
              });

              bitmark.tags = tags.map((item) => { return { value: item } });
            }

            searchResults.healthAssetBitmarks.push(bitmark);
          } else {
            searchResults.healthDataBitmarks.push(bitmark);
          }
        }
      }
    }
  }

  searchResults.length = searchResults.healthDataBitmarks.length + searchResults.healthAssetBitmarks.length;
  console.log('searchResults:', searchResults);
  return searchResults;
};

const searchAgain = async () => {
  let userCompData = UserBitmarksStore.getState().data;
  let searchTerm = userCompData.searchTerm;
  let searchResults = await search(searchTerm);
  UserBitmarksStore.dispatch(UserBitmarksActions.updateSearchResults(searchResults, searchTerm));
};

export {
  issue,
  search,
  searchAgain
};