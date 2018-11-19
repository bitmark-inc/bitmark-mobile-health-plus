import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { merge } from 'lodash';

const ACTION_TYPES = {
  RESET: 'RESET',
  INIT: 'INIT',
  UPDATE_BITMARK_TYPE: 'UPDATE_BITMARK_TYPE',
  UPDATE_SEARCH_RESULTS: 'UPDATE_SEARCH_RESULTS'
};

const UserBitmarksActions = {
  reset: () => {
    return { type: ACTION_TYPES.RESET, };
  },
  initBitmarks: ({ healthDataBitmarks, healthAssetBitmarks, bitmarkType }) => {
    return { type: ACTION_TYPES.INIT, healthDataBitmarks, healthAssetBitmarks, bitmarkType };
  },
  updateBitmarkType: (bitmarkType) => {
    return { type: ACTION_TYPES.UPDATE_BITMARK_TYPE, bitmarkType };
  },
  updateSearchResults: (searchResults, searchTerm) => {
    return { type: ACTION_TYPES.UPDATE_SEARCH_RESULTS, searchResults, searchTerm };
  },
};

const initialState = { healthDataBitmarks: [], healthAssetBitmarks: [], bitmarkType: '', searchTerm: '', searchResults: {} };

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      return merge({}, initialState);
    case ACTION_TYPES.INIT: {
      let tempState = merge({}, state);
      tempState.healthDataBitmarks = action.healthDataBitmarks || tempState.healthDataBitmarks;
      tempState.healthAssetBitmarks = action.healthAssetBitmarks || tempState.healthAssetBitmarks;
      tempState.bitmarkType = action.bitmarkType || tempState.bitmarkType;
      return tempState;
    }
    case ACTION_TYPES.UPDATE_BITMARK_TYPE: {
      let tempState = merge({}, state);
      tempState.bitmarkType = action.bitmarkType || tempState.bitmarkType;
      return tempState;
    }
    case ACTION_TYPES.UPDATE_SEARCH_RESULTS: {
      let tempState = merge({}, state);
      tempState.searchResults = action.searchResults;
      tempState.searchTerm = action.searchTerm;
      return tempState;
    }
    default:
      return state;
  }
};
const reducer = combineReducers({ data });

const UserBitmarksStore = createStore(
  reducer, applyMiddleware(thunk)
);

export {
  UserBitmarksActions,
  UserBitmarksStore
};
