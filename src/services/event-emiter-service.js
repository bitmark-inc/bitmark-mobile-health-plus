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
    APP_MIGRATION_FILE_LOCAL_STORAGE: 'app-migration:file-local-storage',

    CHANGE_USER_INFO: 'change-user-info',

    CHECK_DATA_SOURCE_HEALTH_KIT_EMPTY: 'CHECK_DATA_SOURCE_HEALTH_KIT_EMPTY',
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