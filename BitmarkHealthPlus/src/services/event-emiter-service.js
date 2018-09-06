import { NativeAppEventEmitter } from 'react-native';

let EventEmitterService = {
  event_extra: {},
  events: {
    APP_NETWORK_CHANGED: 'app-network-changed',
    APP_NEED_REFRESH: 'app-need-refresh',
    APP_PROCESSING: 'app-processing',
    APP_SUBMITTING: 'app-submitting',
    APP_PROCESS_ERROR: 'app-process-error',
    APP_LOADING_DATA: 'app-load-fist-data',
    APP_RECEIVED_NOTIFICATION: 'app-received-notification',
    APP_TASK: 'app-task:',

    CHANGE_USER_INFO: 'change-user-info',
    CHANGE_USER_DATA_DONATION_INFORMATION: 'change-user-data:donation-information',
    CHANGE_USER_DATA_ACCOUNT_ACCESSES: 'change-user-data:account-accesses',
    CHANGE_OTHER_USER_DATA_DONATION_INFORMATION: 'change-other-user-data:donation-information',
  },
  on: (eventName, func, extra) => {
    if (extra && (!EventEmitterService.event_extra[eventName] || !EventEmitterService.event_extra[eventName][extra])) {
      if (!EventEmitterService.event_extra[eventName]) {
        EventEmitterService.event_extra[eventName] = {};
      }
      EventEmitterService.event_extra[eventName][extra] = true;
    }
    NativeAppEventEmitter.addListener(eventName + (extra || ''), func);
  },
  emit: (eventName, data) => {
    if (EventEmitterService.event_extra[eventName]) {
      for (let extra in EventEmitterService.event_extra[eventName]) {
        NativeAppEventEmitter.emit(eventName + (extra || ''), data);
      }
    }
    NativeAppEventEmitter.emit(eventName, data);
  },
  remove: (eventName, func, extra) => {
    if (extra && EventEmitterService.event_extra[eventName] && EventEmitterService.event_extra[eventName][extra]) {
      delete EventEmitterService.event_extra[eventName][extra];
    }
    if (!func) {
      NativeAppEventEmitter.removeAllListeners(eventName + (extra || ''));
    } else {
      NativeAppEventEmitter.removeListener(eventName + (extra || ''), func);
    }
  }
};

export { EventEmitterService };