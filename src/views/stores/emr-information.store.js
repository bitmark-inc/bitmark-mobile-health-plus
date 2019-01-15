import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { merge } from 'lodash';

const ACTION_TYPES = {
  RESET: 'RESET',
  INIT: 'INIT',
};

const EMRInformationActions = {
  reset: () => {
    return { type: ACTION_TYPES.RESET, };
  },
  initData: ({ emrInformation }) => {
    return { type: ACTION_TYPES.INIT, emrInformation };
  },
};

const initialState = { emrInformation: null };

const data = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.RESET:
      return merge({}, initialState);
    case ACTION_TYPES.INIT: {
      let tempState = merge({}, state);
      tempState.emrInformation = action.emrInformation;
      return tempState;
    }
    default:
      return state;
  }
};
const reducer = combineReducers({ data });

const EMRInformationStore = createStore(
  reducer, applyMiddleware(thunk)
);

export {
  EMRInformationActions,
  EMRInformationStore
};
