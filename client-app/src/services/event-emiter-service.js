import { NativeAppEventEmitter } from 'react-native';

let EventEmiterService = {
  event_extra: {},
  events: {
    COMPONENT_MOUNTING: 'app-component-mounting',
    APP_PROCESSING: 'app-processing',
    APP_SUBMITTING: 'app-submitting',
    APP_PROCESS_ERROR: 'app-process-error',
    APP_LOADING_DATA: 'app-load-fist-data',
    APP_RECEIVED_NOTIFICATION: 'app-received-notification',
    NEED_RELOAD_USER_DATA: 'need-reload-user-data',
    CHANGE_USER_INFO: 'change-user-info',
    CHANGE_USER_DATA_LOCAL_BITMARKS: 'change-user-data:local-bitmarks',
    CHANGE_USER_DATA_TRACKING_BITMARKS: 'change-user-data:tracking-bitmarks',
    CHANGE_USER_DATA_ACTIVE_INCOMING_TRANSFER_OFFER: 'change-user-data:active-incoming-transfer-offer',
    CHANGE_USER_DATA_TRANSACTIONS: 'change-user-data:transactions',
    CHANGE_USER_DATA_DONATION_INFORMATION: 'change-user-data:donation-information',
    CHANGE_USER_DATA_IFTTT_INFORMATION: 'change-user-data:ifttt-information',
  },
  on: (eventName, func, extra) => {
    if (extra && EventEmiterService.event_extra[eventName] && EventEmiterService.event_extra[eventName][extra]) {
      return;
    }
    if (extra && (!EventEmiterService.event_extra[eventName] || !EventEmiterService.event_extra[eventName][extra])) {
      if (!EventEmiterService.event_extra[eventName]) {
        EventEmiterService.event_extra[eventName] = {};
      }
      EventEmiterService.event_extra[eventName][extra] = true;
    }
    NativeAppEventEmitter.addListener(eventName + (extra || ''), func);
  },
  emit: (eventName, data) => {
    if (EventEmiterService.event_extra[eventName]) {
      for (let extra in EventEmiterService.event_extra[eventName]) {
        NativeAppEventEmitter.emit(eventName + (extra || ''), data);
      }
    }
    NativeAppEventEmitter.emit(eventName, data);
  },
  remove: (eventName, func, extra) => {
    if (!func) {
      NativeAppEventEmitter.removeAllListeners(eventName + (extra || ''));
    } else {
      NativeAppEventEmitter.removeListener(eventName + (extra || ''), func);
    }
  }
};

export { EventEmiterService };