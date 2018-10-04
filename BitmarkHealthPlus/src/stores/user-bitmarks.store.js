import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { merge } from 'lodash';

const ACTION_TYPES = {
  RESET: 'RESET',
  INIT: 'INIT',
  UPDATE_BITMARK_TYPE: 'UPDATE_BITMARK_TYPE',
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
};

const initialState = { healthDataBitmarks: [], healthAssetBitmarks: [], bitmarkType: '' };

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      state = initialState;
      return merge({}, state);
    case ACTION_TYPES.INIT:
      state.healthDataBitmarks = action.healthDataBitmarks || state.healthDataBitmarks;
      state.healthAssetBitmarks = action.healthAssetBitmarks || state.healthAssetBitmarks;
      state.bitmarkType = action.bitmarkType || action.bitmarkType;
      return merge({}, state);
    case ACTION_TYPES.UPDATE_BITMARK_TYPE:
      state.bitmarkType = action.bitmarkType || action.bitmarkType;
      return merge({}, state);
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
