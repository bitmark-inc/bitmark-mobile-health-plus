import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { merge } from 'lodash';

const ACTION_TYPES = {
  RESET: 'RESET',
  INIT: 'INIT',
};

const MMRInformationActions = {
  reset: () => {
    return { type: ACTION_TYPES.RESET, };
  },
  initData: ({ mmrInformation }) => {
    return { type: ACTION_TYPES.INIT, mmrInformation };
  },
};

const initialState = { mmrInformation: null };

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      return merge({}, initialState);
    case ACTION_TYPES.INIT: {
      let tempState = merge({}, state);
      tempState.mmrInformation = action.mmrInformation;
      return tempState;
    }
    default:
      return state;
  }
};
const reducer = combineReducers({ data });

const MMRInformationStore = createStore(
  reducer, applyMiddleware(thunk)
);

export {
  MMRInformationActions,
  MMRInformationStore
};
