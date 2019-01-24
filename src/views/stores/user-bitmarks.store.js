import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { merge } from 'lodash';

const ACTION_TYPES = {
  RESET: 'RESET',
  INIT: 'INIT',
  UPDATE_BITMARK_TYPE: 'UPDATE_BITMARK_TYPE',
  UPDATE_SEARCH_RESULTS: 'UPDATE_SEARCH_RESULTS',
  UPDATE_EMR: 'UPDATE_EMR'
};

const UserBitmarksActions = {
  reset: () => {
    return { type: ACTION_TYPES.RESET, };
  },
  initBitmarks: ({ healthDataBitmarks, healthAssetBitmarks, dailyHealthDataBitmarks, bitmarkType }) => {
    return { type: ACTION_TYPES.INIT, healthDataBitmarks, healthAssetBitmarks, dailyHealthDataBitmarks, bitmarkType };
  },
  updateBitmarkType: (bitmarkType) => {
    return { type: ACTION_TYPES.UPDATE_BITMARK_TYPE, bitmarkType };
  },
  updateSearchResults: (searchResults, searchTerm) => {
    return { type: ACTION_TYPES.UPDATE_SEARCH_RESULTS, searchResults, searchTerm };
  },
  updateEMRInformation: (emrInformation) => {
    return { type: ACTION_TYPES.UPDATE_EMR, emrInformation };
  }
};

const initialState = { healthDataBitmarks: [], healthAssetBitmarks: [], dailyHealthDataBitmarks: [], bitmarkType: '', searchTerm: '', searchResults: {}, emrInformation: null };

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      return merge({}, initialState);
    case ACTION_TYPES.INIT: {
      let tempState = merge({}, state);
      tempState.healthDataBitmarks = action.healthDataBitmarks || tempState.healthDataBitmarks;
      tempState.healthAssetBitmarks = action.healthAssetBitmarks || tempState.healthAssetBitmarks;
      tempState.dailyHealthDataBitmarks = action.dailyHealthDataBitmarks || tempState.dailyHealthDataBitmarks;
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
    case ACTION_TYPES.UPDATE_EMR: {
      let tempState = merge({}, state);
      tempState.emrInformation = action.emrInformation;
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
