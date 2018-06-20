let cacheData = {
  transactionsScreen: {
    totalTasks: 0,
    totalActionRequired: 0,
    actionRequired: [],

    totalCompleted: 0,
    completedLength: 20,
    completed: [],
  },
  propertiesScreen: {
    localAssets: [],
    totalAssets: 0,
    existNewAsset: false,
    totalBitmarks: 0,

    trackingBitmarks: [],
    totalTrackingBitmarks: 0,
    existNewTrackingBitmark: false,
  },
};

let resetCacheData = () => {
  cacheData = {
    transactionsScreen: {
      totalTasks: 0,
      totalActionRequired: 0,
      actionRequired: [],

      totalCompleted: 0,
      completedLength: 20,
      completed: [],
    },
    propertiesScreen: {
      localAssets: [],
      totalAssets: 0,
      existNewAsset: false,
      totalBitmarks: 0,

      trackingBitmarks: [],
      totalTrackingBitmarks: 0,
      existNewTrackingBitmark: false,
    },
  };
  return cacheData;
};


const getTransactionScreenData = () => {
  return cacheData.transactionsScreen;
};

const setTransactionScreenData = ({ totalTasks, totalActionRequired, actionRequired, totalCompleted, completed }) => {
  cacheData.transactionsScreen.totalTasks = totalTasks ? totalTasks : cacheData.transactionsScreen.totalTasks;
  cacheData.transactionsScreen.totalActionRequired = totalActionRequired ? totalActionRequired : cacheData.transactionsScreen.totalActionRequired;
  cacheData.transactionsScreen.actionRequired = actionRequired ? actionRequired : cacheData.transactionsScreen.actionRequired;
  cacheData.transactionsScreen.totalCompleted = totalCompleted ? totalCompleted : cacheData.transactionsScreen.totalCompleted;
  cacheData.transactionsScreen.completed = completed ? completed : cacheData.transactionsScreen.completed;
};


const getPropertiesScreenData = () => {
  return cacheData.propertiesScreen;
};

const setPropertiesScreen = ({ localAssets, totalAssets, existNewAsset, totalBitmarks, trackingBitmarks, totalTrackingBitmarks, existNewTrackingBitmark }) => {
  cacheData.propertiesScreen.localAssets = localAssets ? localAssets : cacheData.propertiesScreen.localAssets;
  cacheData.propertiesScreen.totalAssets = totalAssets ? totalAssets : cacheData.propertiesScreen.totalAssets;
  cacheData.propertiesScreen.existNewAsset = existNewAsset ? existNewAsset : cacheData.propertiesScreen.existNewAsset;
  cacheData.propertiesScreen.totalBitmarks = totalBitmarks ? totalBitmarks : cacheData.propertiesScreen.totalBitmarks;
  cacheData.propertiesScreen.trackingBitmarks = trackingBitmarks ? trackingBitmarks : cacheData.propertiesScreen.trackingBitmarks;
  cacheData.propertiesScreen.totalTrackingBitmarks = totalTrackingBitmarks ? totalTrackingBitmarks : cacheData.propertiesScreen.totalTrackingBitmarks;
  cacheData.propertiesScreen.existNewTrackingBitmark = existNewTrackingBitmark ? existNewTrackingBitmark : cacheData.propertiesScreen.existNewTrackingBitmark;
}

const DataCacheProcessor = {
  resetCacheData,

  getTransactionScreenData,
  setTransactionScreenData,

  getPropertiesScreenData,
  setPropertiesScreen,

  cacheLength: 20,
};

export { DataCacheProcessor };