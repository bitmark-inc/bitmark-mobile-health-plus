import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { merge } from 'lodash';
import { CacheData } from 'src/processors';

const ACTION_TYPES = {
  RELOAD: 'RELOAD',
  INIT: 'INIT',
};

const AccountActions = {
  reload: () => {
    return { type: ACTION_TYPES.RELOAD, };
  },
};

const initialState = { userInformation: null };

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RELOAD:
      return merge({}, { userInformation: CacheData.userInformation });
    default:
      return state;
  }
};
const reducer = combineReducers({ data });

const AccountStore = createStore(
  reducer, applyMiddleware(thunk)
);

export {
  AccountActions,
  AccountStore
};
