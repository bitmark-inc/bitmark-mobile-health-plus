let EventEmiterService = {
  _eventsListeners: {},
  events: {
    APP_PROCESSING: 'app-processing',
    APP_SUBMITTING: 'app-submitting',
  },
  on: (eventName, func) => {
    if (typeof (eventName) === 'string' && typeof (func) === 'function') {
      if (!EventEmiterService._eventsListeners[eventName]) {
        EventEmiterService._eventsListeners[eventName] = [];
      }
      EventEmiterService._eventsListeners[eventName].push(func);
    }
  },
  emit: (eventName, data) => {
    if (EventEmiterService._eventsListeners[eventName]) {
      EventEmiterService._eventsListeners[eventName].forEach(func => {
        if (func instanceof Function) {
          func(data);
        }
      });
    }
  },
  remove: (eventName, func) => {

    if (eventName && EventEmiterService._eventsListeners[eventName]) {
      if (!func) {
        delete EventEmiterService._eventsListeners[eventName];
      } else {
        for (let index in EventEmiterService._eventsListeners[eventName]) {
          if (EventEmiterService._eventsListeners[eventName][index] === func) {
            EventEmiterService._eventsListeners[eventName].splice(index, 1);
            return;
          }
        }
      }
    }
  }
};

export { EventEmiterService };