let cacheData = {
  donationTasks: {
    totalTasks: 0,
    totalDonationTasks: 0,
    donationTasks: [],
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

const DataCacheProcessor = {
  resetCacheData,

  getDonationTasks,
  setDonationsTasks,

  cacheLength: 20,
};

export { DataCacheProcessor };