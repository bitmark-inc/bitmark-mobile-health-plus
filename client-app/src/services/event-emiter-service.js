import { NativeAppEventEmitter } from 'react-native';

let EventEmiterService = {
  _eventsListeners: {},
  events: {
    APP_PROCESSING: 'app-processing',
    APP_SUBMITTING: 'app-submitting',
    APP_PROCESS_ERROR: 'app-process-error',
    APP_RECEIVED_NOTIFICATION: 'app-received-notification',
    NEED_RELOAD_DATA: 'need-reload-data',
    CHANGE_USER_INFO: 'change-user-info',
    CHANGE_USER_DATA_LOCAL_BITMARKS: 'change-user-data:local-bitmarks',
    CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER: 'change-user-data:active-incoming-transfer-offer',
    CHANGE_USER_DATA_TRANSACTIONS: 'change-user-data:transactions',
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