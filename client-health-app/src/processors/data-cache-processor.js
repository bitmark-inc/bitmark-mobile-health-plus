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
    },
  };
  return cacheData;
};


const getTransactionScreenData = () => {
  return cacheData.transactionsScreen;
};

const setTransactionScreenData = ({ totalTasks, totalActionRequired, actionRequired, totalCompleted, completed }) => {
  cacheData.transactionsScreen.totalTasks = (totalTasks != undefined) ? totalTasks : cacheData.transactionsScreen.totalTasks;
  cacheData.transactionsScreen.totalActionRequired = (totalActionRequired != undefined) ? totalActionRequired : cacheData.transactionsScreen.totalActionRequired;
  cacheData.transactionsScreen.actionRequired = actionRequired ? actionRequired : cacheData.transactionsScreen.actionRequired;
  cacheData.transactionsScreen.totalCompleted = (totalCompleted != undefined) ? totalCompleted : cacheData.transactionsScreen.totalCompleted;
  cacheData.transactionsScreen.completed = completed ? completed : cacheData.transactionsScreen.completed;
};


const getPropertiesScreenData = () => {
  return cacheData.propertiesScreen;
};

const setPropertiesScreen = ({ localAssets, totalAssets, existNewAsset, totalBitmarks }) => {
  cacheData.propertiesScreen.localAssets = localAssets ? localAssets : cacheData.propertiesScreen.localAssets;
  cacheData.propertiesScreen.totalAssets = (totalAssets != undefined) ? totalAssets : cacheData.propertiesScreen.totalAssets;
  cacheData.propertiesScreen.existNewAsset = (existNewAsset != undefined) ? existNewAsset : cacheData.propertiesScreen.existNewAsset;
  cacheData.propertiesScreen.totalBitmarks = (totalBitmarks != undefined) ? totalBitmarks : cacheData.propertiesScreen.totalBitmarks;
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