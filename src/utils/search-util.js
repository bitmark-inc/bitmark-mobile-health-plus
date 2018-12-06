import { isAssetDataRecord } from './common-util';
import { UserBitmarksStore, UserBitmarksActions } from 'src/views';
import { CommonModel, IndexDBService } from 'src/processors';

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
          if (isAssetDataRecord(bitmark.asset)) {
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
                  if (tag.startsWith(searchTermParts[index])) {
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
  search,
  searchAgain
}