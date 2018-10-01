import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

const ACTION_TYPES = {
  RESET: 'RESET',
  INIT: 'INIT',
  UPDATE_BITMARKS: 'UPDATE_BITMARKS',
  UPDATE_BITMARK_TYPE: 'UPDATE_BITMARK_TYPE',
};

const UserBitmarksActions = {
  reset: () => {
    return { type: ACTION_TYPES.RESET, };
  },
  initBitmarks: (healthDataBitmarks, healthAssetBitmarks, bitmarkType) => {
    return { type: ACTION_TYPES.INIT, healthDataBitmarks, healthAssetBitmarks, bitmarkType };
  },
  updateBitmarks: (healthDataBitmarks, healthAssetBitmarks) => {
    return { type: ACTION_TYPES.UPDATE_BITMARKS, healthDataBitmarks, healthAssetBitmarks };
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
      return state;
    case ACTION_TYPES.INIT:
      state.healthDataBitmarks = action.healthDataBitmarks || state.healthDataBitmarks;
      state.healthAssetBitmarks = action.healthAssetBitmarks || state.healthAssetBitmarks;
      state.bitmarkType = action.bitmarkType || action.bitmarkType;
      return state;
    case ACTION_TYPES.UPDATE_BITMARKS:

      state.healthDataBitmarks = action.healthDataBitmarks || state.healthDataBitmarks;
      state.healthAssetBitmarks = action.healthAssetBitmarks || state.healthAssetBitmarks;
      return state;
    case ACTION_TYPES.UPDATE_BITMARK_TYPE:
      state.bitmarkType = action.bitmarkType || action.bitmarkType;
      return state;
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
