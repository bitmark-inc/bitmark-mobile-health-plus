let cacheData = {
  donationTasks: {
    totalTasks: 0,
    totalDonationTasks: 0,
    donationTasks: [],
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
    donationTasks: {
      totalTasks: 0,
      totalDonationTasks: 0,
      donationTasks: [],
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


const getDonationTasks = () => {
  return cacheData.donationTasks;
};

const setDonationsTasks = ({ totalTasks, totalDonationTasks, donationTasks }) => {
  cacheData.donationTasks.totalTasks = (totalTasks != undefined) ? totalTasks : cacheData.donationTasks.totalTasks;
  cacheData.donationTasks.totalDonationTasks = (totalDonationTasks != undefined) ? totalDonationTasks : cacheData.donationTasks.totalDonationTasks;
  cacheData.donationTasks.donationTasks = donationTasks ? donationTasks : cacheData.donationTasks.donationTasks;
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

  getDonationTasks,
  setDonationsTasks,

  getPropertiesScreenData,
  setPropertiesScreen,

  cacheLength: 20,
};

export { DataCacheProcessor };