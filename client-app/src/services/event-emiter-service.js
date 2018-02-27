import { NativeAppEventEmitter } from 'react-native';

let EventEmiterService = {
  _eventsListeners: {},
  events: {
    APP_PROCESSING: 'app-processing',
    APP_SUBMITTING: 'app-submitting',
  },
  on: (eventName, func) => {
    NativeAppEventEmitter.addListener(eventName, func);
  },
  emit: (eventName, data) => {
    NativeAppEventEmitter.emit(eventName, data);
  },
  remove: (eventName, func) => {
    if (!func) {
      NativeAppEventEmitter.removeAllListeners(eventName);
    } else {
      NativeAppEventEmitter.removeListener(eventName, func);
    }
  }
};

export { EventEmiterService };