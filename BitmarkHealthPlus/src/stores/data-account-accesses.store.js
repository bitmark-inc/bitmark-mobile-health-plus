import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { merge } from 'lodash';

const ACTION_TYPES = {
  RESET: 'RESET',
  INIT: 'INIT',
};

const DataAccountAccessesActions = {
  reset: () => {
    return { type: ACTION_TYPES.RESET, };
  },
  init: (accesses) => {
    return { type: ACTION_TYPES.INIT, accesses };
  },
};

const initialState = {
  accesses: {
    granted_to: [],
    granted_from: [],
  }
};

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      return merge({}, initialState);
    case ACTION_TYPES.INIT:
      state.accesses.granted_from = action.accesses.granted_from || [];
      state.accesses.granted_to = action.accesses.granted_to || [];
      return merge({}, state);
    default:
      return state;
  }
};
const reducer = combineReducers({ data });

const DataAccountAccessesStore = createStore(
  reducer, applyMiddleware(thunk)
);

export {
  DataAccountAccessesActions,
  DataAccountAccessesStore
};
